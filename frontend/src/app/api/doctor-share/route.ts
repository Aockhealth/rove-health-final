import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@/utils/supabase/server";

/**
 * The clinician's only server-side surface: read a shared health-report
 * snapshot, or write one line back to it.
 *
 * Proxied through the server rather than called from the browser so the
 * passcode never appears in a client-side network call a screen-sharing
 * clinic PC would show, and so attempts can be rate-limited per IP on top of
 * the hard per-link lock the database already enforces (ten wrong codes and
 * the link is dead — see doctor_share_check).
 *
 * Both operations run as the anon role against SECURITY DEFINER functions
 * that are themselves the access-control boundary; there is no path from here
 * into any other table.
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Deliberately tighter than the AI routes: a clinician opens a link a handful
// of times in a consultation, and anything faster is someone working through
// passcodes. The database lock is the real control; this only slows the walk
// up to it, and keeps one bad actor from burning another patient's link fast.
const doctorShareLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(12, "5 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/doctor-share",
    })
  : null;

type Body = {
  action?: "view" | "reply";
  token?: string;
  passcode?: string;
  doctorName?: string;
  doctorClinic?: string;
  doctorRegistration?: string;
  noteText?: string;
  actions?: unknown;
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const token = body?.token?.trim();
  const passcode = body?.passcode?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  if (doctorShareLimiter) {
    const { success } = await doctorShareLimiter.limit(`${clientIp(request)}:${token}`);
    if (!success) {
      return NextResponse.json({ status: "rate_limited" }, { status: 429 });
    }
  }

  const supabase = await createClient();

  if (body?.action === "reply") {
    const { data, error } = await supabase.rpc("submit_doctor_note", {
      p_token: token,
      p_passcode: passcode,
      p_doctor_name: body.doctorName ?? "",
      p_note_text: body.noteText ?? "",
      p_doctor_clinic: body.doctorClinic ?? null,
      p_doctor_registration: body.doctorRegistration ?? null,
      p_actions: Array.isArray(body.actions) ? body.actions : [],
    });

    if (error) {
      console.error("[doctor-share] submit failed:", error.message);
      return NextResponse.json({ status: "failed" }, { status: 500 });
    }
    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ status: row?.status ?? "failed", attemptsLeft: row?.attempts_left ?? 0 });
  }

  const { data, error } = await supabase.rpc("get_doctor_share", {
    p_token: token,
    p_passcode: passcode,
  });

  if (error) {
    console.error("[doctor-share] view failed:", error.message);
    return NextResponse.json({ status: "failed" }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ status: "not_found" });

  // Only the snapshot crosses this boundary — never the row's internals.
  return NextResponse.json({
    status: row.status,
    patientLabel: row.patient_label ?? null,
    snapshot: row.snapshot ?? null,
    snapshotVersion: row.snapshot_version ?? null,
    sharedAt: row.shared_at ?? null,
    expiresAt: row.expires_at ?? null,
    attemptsLeft: row.attempts_left ?? 0,
    alreadyReplied: !!row.already_replied,
  });
}
