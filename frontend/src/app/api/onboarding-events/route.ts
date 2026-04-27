import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type EventPayload = {
  eventName?: string;
  payload?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as EventPayload | null;
  const eventName = body?.eventName?.trim();

  if (!eventName) {
    return NextResponse.json({ ok: false, error: "eventName is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("onboarding_events").insert({
    user_id: user?.id ?? null,
    event_name: eventName,
    payload: body?.payload ?? {},
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
