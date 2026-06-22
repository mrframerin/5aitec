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

// The work-page snapshots were captured from the source studio's site
// (shader.se), so their <head> meta (canonical, og:url, og:image, twitter:image),
// JSON-LD (@id, image, publisher logo) and visible <title>/og:title still name
// shader.se / "Shader Development Studio". Once this site is crawled on its own
// domain that hands Google a competitor's URLs and brand. Rewrite the host and
// brand strings to 5aitec at serve time (one place, fully reversible) so every
// work page presents itself as 5aitec.
//
// All swapped URLs resolve here: /api/mux-image is proxied locally and /work/<uid>
// are real routes. The two JSON-LD asset URLs that 5aitec does not host
// (dark-colored.png publisher logo, /og website image) are repointed to a real
// 5aitec brand logo so the structured-data images don't 404.
const CANONICAL_ORIGIN = "https://5aitec.com";
const SHADER_ORIGIN = "https://www.shader.se";
const BRAND_LOGO_URL = `${CANONICAL_ORIGIN}/textures/brand-logos/5aitec-03-vector.png`;

// Flight payloads (self.__next_f.push([...])) carry RSC text chunks with exact
// byte-length prefixes, so any length-changing edit inside them corrupts
// hydration and crashes the renderer. They are runtime data only and never
// crawled, so rebranding must skip them and touch only the static HTML.
const FLIGHT_PUSH = /<script>self\.__next_f\.push\(\[[\s\S]*?\]\)<\/script>/g;

function rebrandText(text: string): string {
  return (
    text
      // Repoint the two JSON-LD asset URLs that 5aitec does not host to a real
      // 5aitec logo (must run before the bare-host swap below).
      .split(`${SHADER_ORIGIN}/dark-colored.png`)
      .join(BRAND_LOGO_URL)
      .split(`${SHADER_ORIGIN}/og`)
      .join(BRAND_LOGO_URL)
      // Swap the studio host in every form it appears (plain or slash-escaped):
      // the bare host is always literal regardless of surrounding escaping.
      .split("www.shader.se")
      .join("5aitec.com")
      // Social profiles (JSON-LD sameAs): shader.se's handles → 5aitec's.
      .split("instagram.com/shadersweden")
      .join("instagram.com/5aitec")
      .split("linkedin.com/company/shadersweden")
      .join("linkedin.com/in/5aitec")
      .split("x.com/shadersweden")
      .join("x.com/5aitec")
      .split("shadersweden")
      .join("5aitec")
      // Brand, contact and legal strings that still name the source studio.
      .split("hello@shader.se")
      .join("hello@5aitec.com")
      .split("Shader Development Studio")
      .join("5aitec")
      .split("Shader Sweden AB")
      .join("5aitec")
      .split("Shader Sweden")
      .join("5aitec")
      // Any remaining standalone "Shader" brand mention (JSON-LD alternateName,
      // a11y labels), at any JSON escaping level. Must run AFTER the multi-word
      // names above so they collapse to "5aitec" rather than leaving fragments
      // like "5aitec Development Studio". The technical WebGL term "shader" is
      // lowercase and lives only in the JS chunks, never in these snapshots.
      .split("Shader")
      .join("5aitec")
  );
}

// Rebrand shader.se → 5aitec across the crawlable surface (head <meta>,
// <link rel=canonical>, JSON-LD <script>) while leaving every RSC flight push
// byte-for-byte intact, so the page still hydrates and renders.
function rebrandSnapshot(html: string): string {
  let out = "";
  let last = 0;
  let match: RegExpExecArray | null;
  FLIGHT_PUSH.lastIndex = 0;
  while ((match = FLIGHT_PUSH.exec(html)) !== null) {
    out += rebrandText(html.slice(last, match.index));
    out += match[0];
    last = match.index + match[0].length;
  }
  out += rebrandText(html.slice(last));
  return out;
}

// Byte-accurate rebrand of a decoded RSC flight stream. Rows are "<id>:<data>";
// a row of the form "<id>:T<hexByteLen>,<body>" carries an exact UTF-8 byte
// length (its body may even contain newlines), so we read each chunk by byte
// length and recompute the prefix after rebranding. Changing a chunk body
// without fixing its length prefix corrupts hydration and crashes the renderer.
function rebrandFlightStream(stream: string): string {
  const buf = Buffer.from(stream, "utf8");
  const out: Buffer[] = [];
  const NL = 0x0a;
  const COLON = 0x3a;
  const COMMA = 0x2c;
  const T = 0x54;
  let i = 0;
  while (i < buf.length) {
    const colon = buf.indexOf(COLON, i);
    if (colon === -1) {
      out.push(Buffer.from(rebrandText(buf.subarray(i).toString("utf8")), "utf8"));
      break;
    }
    const idPart = buf.subarray(i, colon + 1); // "<id>:"
    const p = colon + 1;
    if (buf[p] === T) {
      const comma = buf.indexOf(COMMA, p + 1);
      const len = parseInt(buf.subarray(p + 1, comma).toString("latin1"), 16);
      const textEnd = comma + 1 + len;
      const body = Buffer.from(
        rebrandText(buf.subarray(comma + 1, textEnd).toString("utf8")),
        "utf8",
      );
      out.push(idPart);
      out.push(Buffer.from(`T${body.length.toString(16)},`, "latin1"));
      out.push(body);
      i = textEnd;
      if (buf[i] === NL) {
        out.push(Buffer.from([NL]));
        i++;
      }
    } else {
      let nl = buf.indexOf(NL, p);
      if (nl === -1) nl = buf.length;
      out.push(Buffer.from(rebrandText(buf.subarray(i, nl).toString("utf8")), "utf8"));
      if (nl < buf.length) {
        out.push(Buffer.from([NL]));
        i = nl + 1;
      } else {
        i = nl;
      }
    }
  }
  return Buffer.concat(out).toString("utf8");
}

// The snapshots ship the source studio's Umami analytics (analytics.shader.build),
// which would send 5aitec's visitor data to that studio. Strip its preload link
// and its __next_s loader push from the served HTML so it never loads.
function stripSourceStudioAnalytics(html: string): string {
  return html
    .replace(
      /<link[^>]*href="https:\/\/analytics\.shader\.build\/[^"]*"[^>]*>/g,
      "",
    )
    .replace(
      /<script>\(self\.__next_s=self\.__next_s\|\|\[\]\)\.push\(\["https:\/\/analytics\.shader\.build\/[^\]]*\]\)<\/script>/g,
      "",
    );
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
  // Flight chunks (and even individual RSC text-chunk bodies) split across
  // separate self.__next_f.push([1,…]) calls, so we must operate on the whole
  // concatenated stream rather than per push. Concatenate every type-1 payload,
  // apply the project-data scrub, then the byte-accurate shader→5aitec rebrand
  // (last, so RSC text-chunk length prefixes are recomputed against final
  // content), and re-emit as a single consolidated push in place of the
  // originals. __next_f just concatenates pushed strings, so one push is
  // equivalent to many.
  const pushPattern = /<script>self\.__next_f\.push\(\[1,([\s\S]*?)\]\)<\/script>/g;
  const matches = [...html.matchAll(pushPattern)];
  if (matches.length === 0) return html;

  let stream = "";
  for (const match of matches) {
    try {
      const decoded = JSON.parse(match[1]);
      if (typeof decoded === "string") stream += decoded;
    } catch {
      // ignore a malformed payload; it simply won't reach the consolidated push
    }
  }

  stream = rebrandFlightStream(
    scrubProjectData(stream, nextProject, projectIds, runtimeProjects, currentProject, options),
  );

  const consolidated = `<script>self.__next_f.push([1,${JSON.stringify(stream)}])</script>`;
  let seen = 0;
  return html.replace(pushPattern, () => (seen++ === 0 ? consolidated : ""));
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

  // Re-brand shader.se → 5aitec in the static HTML (head meta + JSON-LD).
  // The RSC flight payloads are rebranded separately, byte-accurately, in
  // rewriteFlightPayloads / the RSC path below (see rebrandFlightStream).
  template = stripSourceStudioAnalytics(rebrandSnapshot(template));

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
    return new NextResponse(rebrandFlightStream(scrubProjectData(extractRscStream(template), nextProject, projectIds, runtimeProjects, currentProject, scrubOptions)), {
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
