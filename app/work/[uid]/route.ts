import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  buildMuxThumbnailPatchScript,
  getProjectIndexByUid,
} from "../../../modules/home/runtime-patches/mux-thumbnail-patch";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

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

type HomeProject = {
  uid: string;
  url: string;
  title: string;
  subtitle?: string;
  siteUrl?: string;
  description?: string;
};

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

function toRuntimeProject(project: HomeProject) {
  const projectIndex = getProjectIndexByUid(project.uid) ?? 0;
  return {
    uid: project.uid,
    url: project.url,
    title: project.title,
    subtitle: project.subtitle ?? "",
    site_link: project.siteUrl
      ? {
          link_type: "Web",
          key: `local-${project.uid}`,
          url: project.siteUrl,
          target: "_blank",
        }
      : null,
    collaborator: null,
    mux_playback_id: `local-project-${projectIndex}`,
    brightness: null,
    contrast: null,
    project_media: [{ mux_playback_id: `local-project-${projectIndex}` }],
    description: project.description ?? "",
  };
}

function getRuntimeProjects(projects: HomeProject[]) {
  return projects
    .filter(
      (project, index, list) =>
        list.findIndex((item) => item.uid === project.uid) === index,
    )
    .map(toRuntimeProject);
}

function getUniqueProjectIds(projects: HomeProject[]) {
  return projects
    .filter(
      (project, index, list) =>
        list.findIndex((item) => item.uid === project.uid) === index,
    )
    .map((project) => project.uid);
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
): string {
  let nextStream = stream.replace(
    /"project_media":\[(\{"mux_playback_id":"[^"]+"\})(?:,\{"mux_playback_id":"[^"]+"\})*\]/g,
    '"project_media":[$1]',
  );
  nextStream = nextStream.replace(
    /"projectIds":\[[^\]]*\]/g,
    `"projectIds":${JSON.stringify(projectIds)}`,
  );
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
): string {
  return html.replace(
    /self\.__next_f\.push\(\[(\d+),([\s\S]*?)\]\)<\/script>/g,
    (match, chunkType: string, encodedPayload: string) => {
      if (chunkType !== "1") return match;
      try {
        const decoded = JSON.parse(encodedPayload);
        if (typeof decoded !== "string") return match;
        return `self.__next_f.push([${chunkType},${JSON.stringify(
          scrubProjectData(decoded, nextProject, projectIds, runtimeProjects),
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
  const project = homeContent.projects.items.find(
    (project: HomeProject) => project.uid === uid,
  );
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  const nextProject = getNextProject(homeContent.projects.items, uid);
  const projectIds = getUniqueProjectIds(homeContent.projects.items);
  const runtimeProjects = getRuntimeProjects(homeContent.projects.items);

  const templatePath = path.join(
    process.cwd(),
    "public",
    "work",
    uid,
    "index.html",
  );

  let template: string;
  try {
    template = await readFile(templatePath, "utf8");
  } catch {
    return NextResponse.json(
      { message: "Template not found for project" },
      { status: 404 },
    );
  }

  // RSC requests (Next.js client-side navigation) send RSC: 1 header.
  // Return the extracted flight stream so the router can transition without a full reload.
  const isRscRequest = request.headers.get("RSC") === "1";
  if (isRscRequest) {
    return new NextResponse(scrubProjectData(extractRscStream(template), nextProject, projectIds, runtimeProjects), {
      headers: {
        "content-type": "text/x-component",
        "cache-control": "no-store, max-age=0",
      },
    });
  }

  const rewrittenTemplate = rewriteFlightPayloads(
    template,
    nextProject,
    projectIds,
    runtimeProjects,
  );

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
