import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    playbackId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { playbackId } = await context.params;
  const match = playbackId.match(/^local-project-(\d+)$/);

  if (!match) {
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
    `project_thumb_${match[1]}.jpg`,
  );
  const image = await readFile(imagePath);

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "cache-control": "no-store, max-age=0",
      "content-type": "image/jpeg",
    },
  });
}
