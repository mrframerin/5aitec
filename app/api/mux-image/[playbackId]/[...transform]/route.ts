import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import projectThumbnails from "../../../../../modules/home/content/project-thumbnails.json";

type RouteContext = {
  params: Promise<{
    playbackId: string;
    transform: string[];
  }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  const { playbackId } = await context.params;
  const match = playbackId.match(/^local-project-(\d+)$/);
  const localIndex =
    projectThumbnails.playbackIdToIndex[
      playbackId as keyof typeof projectThumbnails.playbackIdToIndex
    ];

  if (!match && localIndex == null) {
    const sourceUrl = new URL(request.url);
    const remoteUrl = new URL(sourceUrl.pathname + sourceUrl.search, "https://www.shader.se");
    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return NextResponse.json({ message: "Image not found" }, { status: response.status });
    }

    return new NextResponse(response.body, {
      headers: {
        "cache-control": response.headers.get("cache-control") ?? "public, max-age=3600",
        "content-type": response.headers.get("content-type") ?? "image/jpeg",
      },
    });
  }

  const imagePath = path.join(
    process.cwd(),
    "public",
    "textures",
    "projects",
    `project_thumb_${match?.[1] ?? localIndex}.jpg`,
  );
  const image = await readFile(imagePath);

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "cache-control": "no-store, max-age=0",
      "content-type": "image/jpeg",
    },
  });
}
