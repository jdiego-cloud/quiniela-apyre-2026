import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { ParticipantState } from "@/lib/bracket-data";

export async function GET() {
  const slugs = await redis.smembers("participant-index");
  if (!slugs || slugs.length === 0) {
    return NextResponse.json({ participants: [] });
  }

  const keys = slugs.map((s) => `participant:${s}`);
  const results = await redis.mget<ParticipantState[]>(...keys);

  const participants = results.filter(Boolean);
  return NextResponse.json({ participants });
}
