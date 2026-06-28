import { NextRequest, NextResponse } from "next/server";
import { redis, slugify } from "@/lib/redis";
import { ParticipantState } from "@/lib/bracket-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const slug = slugify(name);
  const data = await redis.get<ParticipantState>(`participant:${slug}`);
  if (!data) {
    return NextResponse.json({ found: false }, { status: 200 });
  }
  return NextResponse.json({ found: true, state: data });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const slug = slugify(name);
  const body = (await req.json()) as ParticipantState;

  if (!body.name || slugify(body.name) !== slug) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }

  const stateToSave: ParticipantState = {
    name: body.name,
    predictions: body.predictions || {},
    updatedAt: Date.now(),
  };

  await redis.set(`participant:${slug}`, stateToSave);
  // Keep an index of all participant slugs for admin views
  await redis.sadd("participant-index", slug);

  return NextResponse.json({ ok: true });
}
