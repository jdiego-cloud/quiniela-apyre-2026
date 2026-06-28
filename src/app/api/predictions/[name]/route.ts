import { NextRequest, NextResponse } from "next/server";
import { supabase, slugify } from "@/lib/supabase";
import { ParticipantState } from "@/lib/bracket-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const slug = slugify(name);

  const { data, error } = await supabase
    .from("participants")
    .select("name, predictions")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ found: false }, { status: 200 });
  }
  return NextResponse.json({
    found: true,
    state: { name: data.name, predictions: data.predictions } as ParticipantState,
  });
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

  const { error } = await supabase.from("participants").upsert({
    slug,
    name: body.name,
    predictions: body.predictions || {},
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
