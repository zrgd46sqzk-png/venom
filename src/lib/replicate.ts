import Replicate from "replicate";

let client: Replicate | null = null;

export function getReplicate(): Replicate {
  if (!client) {
    const auth = process.env.REPLICATE_API_TOKEN;
    if (!auth) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }
    client = new Replicate({ auth });
  }
  return client;
}

// ByteDance's Seedance model hosted on Replicate.
// https://replicate.com/bytedance/seedance-1-lite
export const VIDEO_MODEL = "bytedance/seedance-1-lite";
