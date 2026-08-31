import type { Metadata } from "next";
import { DoctorReportClient } from "./DoctorReportClient";

/**
 * The clinician's entry point — a passcode-gated, read-only snapshot of a
 * patient's Rove health report, openable in any browser with no account and
 * no app. See supabase/migrations/20260829000000_add_doctor_share.sql for the
 * access model, and mobile/src/lib/doctorShare.ts for the publishing side.
 */

export const metadata: Metadata = {
  title: "Health report · Rove",
  // A medical record must never end up in an index, and the share token sits
  // in the path — so no referrer either, or the token travels to whatever the
  // clinician clicks next.
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

// The snapshot is fetched client-side behind the passcode, so there is
// nothing to prerender and nothing to cache at the edge.
export const dynamic = "force-dynamic";

export default async function DoctorReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <DoctorReportClient token={token} />;
}
