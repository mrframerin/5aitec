import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

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

export async function GET(_request: Request, context: RouteContext) {
  const { uid } = await context.params;

  // Whitelist: uid must exist in home.json projects to be servable.
  const homeContent = await loadHomeContent();
  const project = homeContent.projects.items.find(
    (project: { uid: string }) => project.uid === uid,
  );
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

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

  return new NextResponse(template, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, max-age=0",
    },
  });
}
