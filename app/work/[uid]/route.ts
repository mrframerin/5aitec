import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  buildMuxThumbnailPatchScript,
  buildProjectIds,
  buildRuntimeProject,
  buildRuntimeProjects,
  getProjectIndexByUid,
  type HomeProject,
} from "../../../modules/home/runtime-patches/mux-thumbnail-patch";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

// HomeProject, buildRuntimeProjects and buildProjectIds are shared with the home
// page film strip (see mux-thumbnail-patch.ts) so both render the same projects.

const contentPath = path.join(
  process.cwd(),
  "modules",
  "home",
  "content",
  "home.json",
);

async function loadHomeContent() {
  return JSON.parse(await readFile(contentPath, "utf8"));
}

function getNextProject(projects: HomeProject[], uid: string) {
  const uniqueProjects = projects.filter(
    (project, index, list) =>
      list.findIndex((item) => item.uid === project.uid) === index,
  );
  const currentIndex = uniqueProjects.findIndex((project) => project.uid === uid);
  if (currentIndex < 0 || uniqueProjects.length < 2) return null;

  const nextProject = uniqueProjects[(currentIndex + 1) % uniqueProjects.length];
  return {
    uid: nextProject.uid,
    url: nextProject.url,
    title: nextProject.title,
    subtitle: nextProject.subtitle ?? "",
    site_link: nextProject.siteUrl
      ? {
          link_type: "Web",
          key: `local-${nextProject.uid}`,
          url: nextProject.siteUrl,
          target: "_blank",
        }
      : null,
    collaborator: null,
    mux_playback_id: `local-project-${getProjectIndexByUid(nextProject.uid) ?? 0}`,
    brightness: null,
    contrast: null,
    project_media: [],
    description: nextProject.description ?? "",
  };
}

function injectMuxThumbnailPatch(
  html: string,
  uid: string,
  nextProject: Record<string, unknown> | null,
  projectIds: string[],
  runtimeProjects: Record<string, unknown>[],
): string {
  const fallbackIndex = getProjectIndexByUid(uid);
  const script = `<script>${buildMuxThumbnailPatchScript({
    fallbackIndex,
    nextProject,
    projectIds,
    runtimeProjects,
  })}</script>`;
  // Inject as the first script in <head> so the patch runs before any chunk loads.
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>${script}`);
  }
  return script + html;
}

function scrubProjectData(
  stream: string,
  nextProject: Record<string, unknown> | null,
  projectIds: string[],
  runtimeProjects: Record<string, unknown>[],
  currentProject: Record<string, unknown> | null,
  options: { skipProjectsRewrite?: boolean } = {},
): string {
  let nextStream = stream.replace(
    /"project_media":\[(\{"mux_playback_id":"[^"]+"\})(?:,\{"mux_playback_id":"[^"]+"\})*\]/g,
    '"project_media":[$1]',
  );
  nextStream = nextStream.replace(
    /"projectIds":\[[^\]]*\]/g,
    `"projectIds":${JSON.stringify(projectIds)}`,
  );
  if (!options.skipProjectsRewrite) {
    const projectsStartMarker = '"projects":[';
    const projectsEndMarker = '],"a11yChildren"';
    const projectsStart = nextStream.indexOf(projectsStartMarker);
    const projectsEnd = nextStream.indexOf(projectsEndMarker, projectsStart);
    if (projectsStart >= 0 && projectsEnd > projectsStart) {
      nextStream =
        nextStream.slice(0, projectsStart) +
        `"projects":${JSON.stringify(runtimeProjects)}` +
        nextStream.slice(projectsEnd + 1);
    }
    // Rewrite the page-level "project" prop (the project this page actually displays).
    // In the snapshot it lives in the $L1a component as "project":{...},"projectIds":[...]
    // — so the brand shown matches the URL even when a uid falls back to the shopos
    // template (reality-tools and stanford have no snapshot of their own).
  }
  if (currentProject) {
    nextStream = nextStream.replace(
      /"project":\{[\s\S]*?\},"projectIds":/,
      `"project":${JSON.stringify(currentProject)},"projectIds":`,
    );
  }
  if (nextProject) {
    nextStream = nextStream.replace(
      /"nextProject":\{[\s\S]*?\}\}\],\[\[/g,
      `"nextProject":${JSON.stringify(nextProject)}}],[[`,
    );
  }
  return nextStream;
}

function rewriteFlightPayloads(
  html: string,
  nextProject: Record<string, unknown> | null,
  projectIds: string[],
  runtimeProjects: Record<string, unknown>[],
  currentProject: Record<string, unknown> | null,
  options: { skipProjectsRewrite?: boolean } = {},
): string {
  return html.replace(
    /self\.__next_f\.push\(\[(\d+),([\s\S]*?)\]\)<\/script>/g,
    (match, chunkType: string, encodedPayload: string) => {
      if (chunkType !== "1") return match;
      try {
        const decoded = JSON.parse(encodedPayload);
        if (typeof decoded !== "string") return match;
        return `self.__next_f.push([${chunkType},${JSON.stringify(
          scrubProjectData(decoded, nextProject, projectIds, runtimeProjects, currentProject, options),
        )}])</script>`;
      } catch {
        return match;
      }
    },
  );
}

// Extract the RSC flight stream from a snapshot HTML file by walking
// self.__next_f.push([1, "..."]) calls and concatenating their decoded payloads.
function extractRscStream(html: string): string {
  const pattern = /self\.__next_f\.push\(\[(\d+),([\s\S]*?)\]\)<\/script>/g;
  const parts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const chunkType = match[1];
    if (chunkType !== "1") continue;
    try {
      const decoded = JSON.parse(match[2]);
      if (typeof decoded === "string") parts.push(decoded);
    } catch {
      // skip malformed payloads
    }
  }
  return parts.join("");
}

export async function GET(request: Request, context: RouteContext) {
  const { uid } = await context.params;

  const homeContent = await loadHomeContent();

  // /giving uses the work-page template too — synthesise a HomeProject for it
  // so the existing pipeline can find a template at public/work/giving/index.html
  // without exposing "giving" inside the home page's projects carousel.
  const synthesizedGiving: HomeProject | null =
    uid === "giving" && homeContent.giving
      ? {
          uid: "giving",
          url: "/work/giving",
          title: homeContent.giving.title,
          subtitle: "Giving · Ongoing",
          description: homeContent.giving.subline,
        }
      : null;

  const project =
    homeContent.projects.items.find(
      (project: HomeProject) => project.uid === uid,
    ) ?? synthesizedGiving;
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  const nextProject = getNextProject(homeContent.projects.items, uid);
  const projectIds = buildProjectIds(homeContent.projects.items);
  const runtimeProjects = buildRuntimeProjects(homeContent.projects.items);

  const templateUid = uid === "cope-studio" ? "shopos" : uid;
  const templatePath = path.join(
    process.cwd(),
    "public",
    "work",
    templateUid,
    "index.html",
  );
  const fallbackTemplatePath = path.join(
    process.cwd(),
    "public",
    "work",
    "shopos",
    "index.html",
  );

  let template: string;
  let usedFallbackTemplate = templateUid !== uid;
  try {
    template = await readFile(templatePath, "utf8");
  } catch {
    usedFallbackTemplate = true;
    try {
      template = await readFile(fallbackTemplatePath, "utf8");
    } catch {
      return NextResponse.json(
        { message: "Template not found for project" },
        { status: 404 },
      );
    }
  }

  // /work/giving uses an unrelated snapshot whose embedded "projects" / "nextProject"
  // slots represent the current page's own data, not a project carousel. Rewriting
  // them with the home page's runtime projects corrupts the RSC chunk graph and
  // breaks Flight hydration ("enqueueModel is not a function").
  const scrubOptions = { skipProjectsRewrite: true };

  // Only rewrite the displayed "project" prop when this uid had no snapshot of its own
  // and fell back to the shopos template (reality-tools, stanford). Pages with their own
  // snapshot already display the right brand (and keep their full media), so we leave them.
  const currentProject = uid !== "giving" ? buildRuntimeProject(project) : null;

  // RSC requests (Next.js client-side navigation) send RSC: 1 header.
  // Return the extracted flight stream so the router can transition without a full reload.
  const isRscRequest = request.headers.get("RSC") === "1";
  if (isRscRequest) {
    return new NextResponse(scrubProjectData(extractRscStream(template), nextProject, projectIds, runtimeProjects, currentProject, scrubOptions), {
      headers: {
        "content-type": "text/x-component",
        "cache-control": "no-store, max-age=0",
      },
    });
  }

  let rewrittenTemplate = rewriteFlightPayloads(
    template,
    nextProject,
    projectIds,
    runtimeProjects,
    currentProject,
    scrubOptions,
  );

  // Fallback pages inherit the shopos template's <title>/og:title — fix them so the
  // tab title and share previews match the brand the page actually shows.
  if (usedFallbackTemplate && project.title) {
    rewrittenTemplate = rewrittenTemplate.split("Work: ShopOS").join(`Work: ${project.title}`);
  }

  return new NextResponse(injectMuxThumbnailPatch(
    rewrittenTemplate,
    uid,
    nextProject,
    projectIds,
    runtimeProjects,
  ), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
