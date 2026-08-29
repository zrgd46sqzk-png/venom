import { NextRequest } from "next/server";
import { getReplicate, VIDEO_MODEL } from "@/lib/replicate";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const prompt = body?.prompt as string | undefined;

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  let replicate;
  try {
    replicate = getReplicate();
  } catch {
    return Response.json({ error: "Server is missing REPLICATE_API_TOKEN" }, { status: 500 });
  }

  const input: Record<string, unknown> = {
    prompt,
    duration: body?.duration ?? 5,
    resolution: body?.resolution ?? "720p",
    aspect_ratio: body?.aspectRatio ?? "16:9",
  };
  if (body?.image) input.image = body.image;

  try {
    const prediction = await replicate.predictions.create({
      model: VIDEO_MODEL,
      input,
    });
    return Response.json({ id: prediction.id, status: prediction.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Video generation failed to start";
    return Response.json({ error: message }, { status: 502 });
  }
}
