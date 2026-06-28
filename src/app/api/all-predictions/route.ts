import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ParticipantState } from "@/lib/bracket-data";

export async function GET() {
  const { data, error } = await supabase
    .from("participants")
    .select("name, predictions")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const participants: ParticipantState[] = (data || []).map((row) => ({
    name: row.name,
    predictions: row.predictions,
  }));

  return NextResponse.json({ participants });
}
