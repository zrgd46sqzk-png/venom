import { getReplicate } from "@/lib/replicate";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/video/[id]">) {
  const { id } = await ctx.params;

  let replicate;
  try {
    replicate = getReplicate();
  } catch {
    return Response.json({ error: "Server is missing REPLICATE_API_TOKEN" }, { status: 500 });
  }

  try {
    const prediction = await replicate.predictions.get(id);
    return Response.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not fetch prediction status";
    return Response.json({ error: message }, { status: 502 });
  }
}
