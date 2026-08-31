"use client";

import { useState } from "react";
import { ReportView } from "./ReportView";
import { ReplyForm, type DoctorAction } from "./ReplyForm";
import type { DoctorSnapshot } from "./snapshot";

/**
 * Orchestrates the clinician's three steps: enter the code the patient read
 * out, read the record, write one line back.
 *
 * The snapshot is only fetched once the code is correct, so nothing about her
 * record reaches the browser before then — the gate is a real boundary, not a
 * screen over already-loaded data.
 */

type ViewState =
  | { kind: "gate" }
  | { kind: "loading" }
  | { kind: "report"; snapshot: DoctorSnapshot; patientLabel: string | null; sharedAt: string | null; alreadyReplied: boolean }
  | { kind: "sent"; patientLabel: string | null }
  | { kind: "dead"; reason: "not_found" | "locked" };

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/doctor-share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, statusCode: res.status, data: await res.json().catch(() => null) };
}

export function DoctorReportClient({ token }: { token: string }) {
  const [state, setState] = useState<ViewState>({ kind: "gate" });
  const [passcode, setPasscode] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const openReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 4) return;

    setGateError(null);
    setState({ kind: "loading" });

    const { statusCode, data } = await post({ action: "view", token, passcode });

    if (statusCode === 429) {
      setState({ kind: "gate" });
      setGateError("Too many attempts from this network. Wait a few minutes and try again.");
      return;
    }

    switch (data?.status) {
      case "ok":
        setState({
          kind: "report",
          snapshot: data.snapshot as DoctorSnapshot,
          patientLabel: data.patientLabel ?? null,
          sharedAt: data.sharedAt ?? null,
          alreadyReplied: !!data.alreadyReplied,
        });
        return;
      case "bad_passcode":
        setState({ kind: "gate" });
        setGateError(
          `That code isn't right. ${data.attemptsLeft} attempt${data.attemptsLeft === 1 ? "" : "s"} left before this link locks itself.`,
        );
        return;
      case "locked":
        setState({ kind: "dead", reason: "locked" });
        return;
      case "not_found":
        setState({ kind: "dead", reason: "not_found" });
        return;
      default:
        setState({ kind: "gate" });
        setGateError("Something went wrong. Please try again in a moment.");
    }
  };

  const sendReply = async (payload: {
    doctorName: string;
    doctorClinic: string;
    doctorRegistration: string;
    noteText: string;
    actions: DoctorAction[];
  }) => {
    setSubmitting(true);
    setReplyError(null);

    const { statusCode, data } = await post({ action: "reply", token, passcode, ...payload });
    setSubmitting(false);

    if (statusCode === 429) {
      setReplyError("Too many requests from this network. Wait a few minutes and try again.");
      return;
    }

    switch (data?.status) {
      case "ok":
        setState((prev) => ({
          kind: "sent",
          patientLabel: prev.kind === "report" ? prev.patientLabel : null,
        }));
        return;
      case "too_many_notes":
        setReplyError("This link has already received the maximum number of notes.");
        return;
      case "invalid":
        setReplyError("Please add your name and a note before sending.");
        return;
      case "locked":
      case "not_found":
        setState({ kind: "dead", reason: data.status });
        return;
      default:
        setReplyError("Could not send that. Please try again in a moment.");
    }
  };

  if (state.kind === "gate" || state.kind === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-taupe-dark">Rove</div>
            <h1 className="mt-3 font-serif text-3xl text-rove-charcoal">A patient has shared her health record with you</h1>
            <p className="mt-3 text-sm leading-relaxed text-taupe-dark">
              Enter the 4-digit code she gave you. No account, no app.
            </p>
          </div>

          <form onSubmit={openReport} className="mt-8">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              autoFocus
              maxLength={4}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, "").slice(0, 4));
                setGateError(null);
              }}
              disabled={state.kind === "loading"}
              className="w-full rounded-2xl border border-taupe/50 bg-white py-5 text-center font-serif text-4xl tracking-[0.5em] text-rove-charcoal outline-none focus:border-rove-charcoal disabled:opacity-50"
              aria-label="4-digit code"
            />

            {gateError ? <p className="mt-3 text-center text-sm text-rove-red">{gateError}</p> : null}

            <button
              type="submit"
              disabled={passcode.length !== 4 || state.kind === "loading"}
              className="mt-5 w-full rounded-xl bg-rove-charcoal px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              {state.kind === "loading" ? "Opening…" : "Open the record"}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-taupe-dark">
            This is a frozen copy of what she recorded, shared deliberately by her. It is not a live
            view of her account, and it expires on its own.
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "dead") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-5 py-12">
        <div className="max-w-sm text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-taupe-dark">Rove</div>
          <h1 className="mt-3 font-serif text-2xl text-rove-charcoal">
            {state.reason === "locked" ? "This link has locked itself" : "This link isn't active"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-taupe-dark">
            {state.reason === "locked"
              ? "It received too many incorrect codes and closed itself as a precaution. Ask your patient to send a new link from her Rove app."
              : "It may have expired, been turned off, or never existed. Ask your patient to send a new one from her Rove app."}
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "sent") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-paper px-5 py-12">
        <div className="max-w-sm text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-taupe-dark">Rove</div>
          <h1 className="mt-3 font-serif text-2xl text-rove-charcoal">Your note is on its way</h1>
          <p className="mt-3 text-sm leading-relaxed text-taupe-dark">
            {state.patientLabel ? `${state.patientLabel} will` : "She will"} be asked to confirm it came
            from you, and it will then sit at the top of her plan — with any follow-up dates you set
            turned into reminders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-paper">
      <ReportView
        snapshot={state.snapshot}
        patientLabel={state.patientLabel}
        sharedAt={state.sharedAt}
      />

      <div className="no-print mx-auto max-w-3xl px-5">
        <button
          type="button"
          onClick={() => window.print()}
          className="w-full rounded-xl border border-taupe/50 px-4 py-3 text-sm font-semibold text-rove-charcoal"
        >
          Print or save as PDF
        </button>
      </div>

      {state.alreadyReplied ? (
        <div className="mx-auto mt-6 max-w-3xl px-5">
          <p className="rounded-xl bg-taupe-light px-4 py-3 text-sm text-rove-charcoal">
            A note has already been sent through this link. You can add another below if you need to.
          </p>
        </div>
      ) : null}

      <ReplyForm onSubmit={sendReply} submitting={submitting} error={replyError} />
    </div>
  );
}
