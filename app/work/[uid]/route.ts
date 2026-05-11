import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { HomeContent } from "../../../modules/home/components/types";

type RouteContext = {
  params: Promise<{
    uid: string;
  }>;
};

const templatePath = path.join(
  process.cwd(),
  "public",
  "work",
  "ehealth-arena",
  "index.html",
);
const contentPath = path.join(
  process.cwd(),
  "modules",
  "home",
  "content",
  "home.json",
);

const original = {
  uid: "ehealth-arena",
  url: "/work/ehealth-arena",
  absoluteUrl: "https://www.shader.se/work/ehealth-arena",
  title: "eHealth Arena",
  subtitle: "3D Showroom",
  description:
    "We created an interactive 3D platform that explores how the latest e-health solutions work in practice. From the patient's home to hospital environments and care providers' workplaces. Users can follow real care journeys, and understand how it all connects to create safer, more efficient care.",
  descriptionHtml:
    "We created an interactive 3D platform that explores how the latest e-health solutions work in practice. From the patient&#x27;s home to hospital environments and care providers&#x27; workplaces. Users can follow real care journeys, and understand how it all connects to create safer, more efficient care.",
  siteUrl: "https://www.ehealtharena.se/digitalt-showroom",
  collaborator: "Markus Reklambyrå",
  nextTitle: "Select Concept",
  nextSubtitle: "3D Interior Designer",
  nextUrl: "/work/select-concept",
};

function replaceAll(input: string, search: string, replacement: string) {
  return input.split(search).join(replacement);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function truncate(value: string, maxLength = 178) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

async function loadHomeContent() {
  return JSON.parse(await readFile(contentPath, "utf8")) as HomeContent;
}

function getProject(homeContent: HomeContent, uid: string) {
  const projects = homeContent.projects.items;
  const index = projects.findIndex((project) => project.uid === uid);

  if (index === -1) {
    return null;
  }

  return {
    index,
    project: projects[index],
    nextIndex: (index + 1) % projects.length,
    nextProject: projects[(index + 1) % projects.length],
  };
}

function getLocalPlaybackId(index: number) {
  return `local-project-${index}`;
}

function customizeTemplate(template: string, homeContent: HomeContent, uid: string) {
  const match = getProject(homeContent, uid);

  if (!match) {
    return null;
  }

  const { index, nextIndex, project, nextProject } = match;
  const siteUrl = project.siteUrl || homeContent.document.canonical;
  const absoluteUrl = `${homeContent.document.canonical}${project.url}`;
  const title = `Work: ${project.title} | Saitec`;
  const shortDescription = truncate(`${project.subtitle}. ${project.description}`);
  const htmlDescription = escapeHtml(project.description);
  const localPlaybackId = getLocalPlaybackId(index);
  const localNextPlaybackId = getLocalPlaybackId(nextIndex);

  let html = template;

  const replacements: Array<[string, string]> = [
    ["Shader Development Studio", "Saitec"],
    ["Shader Sweden AB", "Saitec"],
    ["hello@shader.se", homeContent.contact.email],
    ["https://www.shader.se", homeContent.document.canonical],
    [original.absoluteUrl, absoluteUrl],
    [original.url, project.url],
    [original.uid, project.uid],
    [original.title, project.title],
    [original.subtitle, project.subtitle],
    [original.description, project.description],
    [original.descriptionHtml, htmlDescription],
    [truncate(`${original.subtitle}, in collaboration with ${original.collaborator}. ${original.description}`), shortDescription],
    [original.siteUrl, siteUrl],
    [original.collaborator, "Saitec"],
    [original.nextTitle, nextProject.title],
    [original.nextSubtitle, nextProject.subtitle],
    [original.nextUrl, nextProject.url],
    ["Y7HzOsrmhjd7M00Ib6JYF861ME00I3ZqicLcr4V9vhoXU", localPlaybackId],
    ["gyP026f00GygEUVxzl6e4xG1hTvyPyf9DUFTMEok02FvDk", localPlaybackId],
    ["8jgvDY37uHSMjcWjV59G2hcnBAw01WOs7rbtsid6veoU", localPlaybackId],
    ["M5WUYh6JnUN454BfB02Q01VfDA4VHCSi7ASLwsQm9Tn1w", localPlaybackId],
    ["29xq00NijxLTofeMmyr1hvjJjStsZbMzzOBnP8JN24NM", localNextPlaybackId],
    ["h344B28uehxF4mUqnTW6tOURAZRB3MJ5r8LRWFo6iEw", localNextPlaybackId],
    ["M55yk01Z5rPltnIoTS01025MhFaUHjGO43nCkL2Zi1WLP8", localNextPlaybackId],
    ["VOkEARnsJsYOyePubj67h6Us7LtBkdH601M28mKhUWc00", localNextPlaybackId],
    ["Work: eHealth Arena | Saitec", title],
    ["Work: eHealth Arena | Shader Development Studio", title],
    ["eHealth Arena – 3D Showroom", `${project.title} - ${project.subtitle}`],
    ["Visit eHealth Arena website, opens in new tab", `Visit ${project.title} website, opens in new tab`],
    ["Continue to next project: Select Concept", `Continue to next project: ${nextProject.title}`],
    ["Shader logo, go to home page", "Saitec logo, go to home page"],
    ["Shader — Home", "Saitec - Home"],
    ["Shader � Home", "Saitec - Home"],
  ];

  for (const [search, replacement] of replacements) {
    html = replaceAll(html, search, replacement);
    html = replaceAll(html, escapeHtml(search), escapeHtml(replacement));
    html = replaceAll(
      html,
      JSON.stringify(search).slice(1, -1),
      JSON.stringify(replacement).slice(1, -1),
    );
  }

  html = replaceAll(html, "/work-static-chunks/", "/work-static-chunks/");
  html = replaceAll(html, "/api/mux-image/", "/api/mux-image/");
  html = replaceAll(html, "<title>Work: eHealth Arena | Saitec</title>", `<title>${escapeHtml(title)}</title>`);

  return html;
}

export async function GET(_request: Request, context: RouteContext) {
  const { uid } = await context.params;
  const [template, homeContent] = await Promise.all([
    readFile(templatePath, "utf8"),
    loadHomeContent(),
  ]);
  const html = customizeTemplate(template, homeContent, uid);

  if (!html) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
