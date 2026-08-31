import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

/**
 * The partner's fertile-window view — the web half of the share link that
 * mobile/src/lib/partnerShare.ts has always generated.
 *
 * This page did not exist until now, which is what the TODO(founder) in that
 * file was warning about: the link it builds points at rovehealth.in, so
 * without a page here it only ever resolved for a partner who already had the
 * Rove app installed (Expo Router serving the same route as a deep link) —
 * i.e. almost never, for the one person it was built for.
 *
 * Mirrors mobile/src/app/fertility/[token].tsx deliberately: same narrow
 * subset, same wording, same refusal to distinguish a revoked token from one
 * that never existed.
 */

export const metadata: Metadata = {
  title: "Shared from Rove",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  insufficient_data: "Not tracking yet",
  monitoring: "Cycle in progress",
  fertile_window: "In the fertile window",
  ovulation_likely: "Ovulation likely soon",
  ovulation_confirmed: "Ovulation confirmed",
};

const STATUS_COLOR: Record<string, string> = {
  insufficient_data: "#a8a29e",
  monitoring: "#a8a29e",
  fertile_window: "#d4a25f",
  ovulation_likely: "#d4a25f",
  ovulation_confirmed: "#5c8a6e",
};

function formatDay(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function SharedFertilityPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // get_shared_fertility_status is the only path from a token to any data —
  // it returns a minimal display subset and nothing else, so this page can
  // render for a signed-out visitor without exposing her account.
  const { data } = await supabase.rpc("get_shared_fertility_status", { p_token: token });
  const row = Array.isArray(data) ? data[0] : null;

  if (!row) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-8">
        <div className="max-w-xs text-center">
          <h1 className="font-serif text-2xl text-rove-charcoal">This link isn&apos;t active</h1>
          <p className="mt-2 text-sm text-taupe-dark">
            It may have been turned off, or nothing has been tracked yet.
          </p>
        </div>
      </div>
    );
  }

  const windowStart = formatDay(row.fertile_window_start);
  const windowEnd = formatDay(row.fertile_window_end);
  const confirmed = formatDay(row.confirmed_date);
  const predicted = formatDay(row.predicted_date);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-8">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-taupe-dark">Rove</div>
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: STATUS_COLOR[row.status] ?? "#a8a29e" }}
        />
        <h1 className="font-serif text-2xl text-rove-charcoal">
          {STATUS_LABEL[row.status] ?? "Cycle in progress"}
        </h1>

        {windowStart && windowEnd ? (
          <p className="text-sm text-taupe-dark">
            Fertile window: {windowStart} – {windowEnd}
          </p>
        ) : null}

        {confirmed ? (
          <p className="text-sm text-taupe-dark">Ovulation confirmed around {confirmed}</p>
        ) : predicted ? (
          <p className="text-sm text-taupe-dark">Ovulation expected around {predicted}</p>
        ) : null}

        <p className="mt-4 text-[11px] leading-relaxed text-taupe">
          This is a read-only summary shared from Rove. It doesn&apos;t show daily logs, symptoms, or
          anything else in her account.
        </p>
      </div>
    </div>
  );
}
