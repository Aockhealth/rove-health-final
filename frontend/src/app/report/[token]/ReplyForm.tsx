"use client";

import { useState } from "react";

/**
 * The write-back — the half that makes this a loop rather than an export.
 *
 * Built for a clinician with about ninety seconds: name and one sentence are
 * the only required fields, and the structured follow-ups are optional
 * checkboxes rather than a form to fill in. His sentence is stored and shown
 * to the patient verbatim; the tags underneath only become reminders on her
 * phone, and never replace or paraphrase what he wrote.
 */

export type DoctorAction =
  | { type: "recheck"; test: string; inWeeks: number }
  | { type: "followup"; inWeeks: number }
  | { type: "supplement"; product: string; action: "start" | "continue" | "stop" };

const COMMON_TESTS = ["TSH", "Testosterone", "AMH", "Prolactin", "Fasting insulin", "Vitamin D", "Ferritin"];

const fieldClass =
  "w-full rounded-xl border border-taupe/40 bg-white px-3 py-2.5 text-sm text-rove-charcoal outline-none placeholder:text-taupe focus:border-rove-charcoal";

const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-taupe-dark";

export function ReplyForm({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (payload: {
    doctorName: string;
    doctorClinic: string;
    doctorRegistration: string;
    noteText: string;
    actions: DoctorAction[];
  }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [doctorName, setDoctorName] = useState("");
  const [doctorClinic, setDoctorClinic] = useState("");
  const [doctorRegistration, setDoctorRegistration] = useState("");
  const [noteText, setNoteText] = useState("");

  const [recheckOn, setRecheckOn] = useState(false);
  const [recheckTest, setRecheckTest] = useState(COMMON_TESTS[0]);
  const [recheckWeeks, setRecheckWeeks] = useState(8);

  const [followupOn, setFollowupOn] = useState(false);
  const [followupWeeks, setFollowupWeeks] = useState(12);

  const [supplementOn, setSupplementOn] = useState(false);
  const [supplementProduct, setSupplementProduct] = useState("");
  const [supplementAction, setSupplementAction] = useState<"start" | "continue" | "stop">("continue");

  const canSubmit = doctorName.trim().length > 0 && noteText.trim().length > 0 && !submitting;

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const actions: DoctorAction[] = [];
    if (recheckOn && recheckTest.trim()) {
      actions.push({ type: "recheck", test: recheckTest.trim(), inWeeks: recheckWeeks });
    }
    if (followupOn) actions.push({ type: "followup", inWeeks: followupWeeks });
    if (supplementOn && supplementProduct.trim()) {
      actions.push({ type: "supplement", product: supplementProduct.trim(), action: supplementAction });
    }

    onSubmit({
      doctorName: doctorName.trim(),
      doctorClinic: doctorClinic.trim(),
      doctorRegistration: doctorRegistration.trim(),
      noteText: noteText.trim(),
      actions,
    });
  };

  return (
    <form onSubmit={handle} className="reply-form mx-auto mt-2 max-w-3xl px-5 pb-16">
      <div className="rounded-2xl border border-taupe/40 bg-white p-5">
        <h2 className="font-serif text-2xl text-rove-charcoal">Write back to her</h2>
        <p className="mt-1 text-sm leading-relaxed text-taupe-dark">
          One line is enough. It appears in her Rove app exactly as you write it, attributed to you,
          once she confirms it came from you.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className={labelClass} htmlFor="doctorName">
              Your name *
            </label>
            <input
              id="doctorName"
              className={fieldClass}
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr …"
              maxLength={120}
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelClass} htmlFor="doctorClinic">
              Clinic or hospital
            </label>
            <input
              id="doctorClinic"
              className={fieldClass}
              value={doctorClinic}
              onChange={(e) => setDoctorClinic(e.target.value)}
              maxLength={160}
            />
          </div>
          <div className="sm:col-span-1">
            <label className={labelClass} htmlFor="doctorRegistration">
              Registration no.
            </label>
            <input
              id="doctorRegistration"
              className={fieldClass}
              value={doctorRegistration}
              onChange={(e) => setDoctorRegistration(e.target.value)}
              maxLength={60}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="noteText">
            Your note *
          </label>
          <textarea
            id="noteText"
            className={`${fieldClass} min-h-[110px] resize-y`}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Continue Balance. Recheck TSH in 8 weeks. Cycles are lengthening — review after two more."
            maxLength={2000}
            required
          />
          <p className="mt-1 text-right text-[11px] text-taupe">{noteText.length}/2000</p>
        </div>

        {/* Optional, and visibly optional. A clinician who ignores this
            entirely still gets a complete, useful reply out the door. */}
        <fieldset className="mt-4 rounded-xl bg-taupe-light/60 p-4">
          <legend className="px-1 text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
            Turn any of these into a reminder for her (optional)
          </legend>

          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-rove-charcoal">
              <input
                type="checkbox"
                id="recheckOn"
                checked={recheckOn}
                onChange={(e) => setRecheckOn(e.target.checked)}
                className="h-4 w-4 accent-rove-charcoal"
              />
              <label htmlFor="recheckOn">Recheck</label>
              <input
                className="w-40 rounded-lg border border-taupe/40 bg-white px-2 py-1 text-sm outline-none focus:border-rove-charcoal"
                list="common-tests"
                value={recheckTest}
                onChange={(e) => setRecheckTest(e.target.value)}
                disabled={!recheckOn}
                maxLength={60}
              />
              <datalist id="common-tests">
                {COMMON_TESTS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <span>in</span>
              <input
                type="number"
                min={1}
                max={104}
                className="w-16 rounded-lg border border-taupe/40 bg-white px-2 py-1 text-sm outline-none focus:border-rove-charcoal"
                value={recheckWeeks}
                onChange={(e) => setRecheckWeeks(Number(e.target.value))}
                disabled={!recheckOn}
              />
              <span>weeks</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-rove-charcoal">
              <input
                type="checkbox"
                id="followupOn"
                checked={followupOn}
                onChange={(e) => setFollowupOn(e.target.checked)}
                className="h-4 w-4 accent-rove-charcoal"
              />
              <label htmlFor="followupOn">Follow-up appointment in</label>
              <input
                type="number"
                min={1}
                max={104}
                className="w-16 rounded-lg border border-taupe/40 bg-white px-2 py-1 text-sm outline-none focus:border-rove-charcoal"
                value={followupWeeks}
                onChange={(e) => setFollowupWeeks(Number(e.target.value))}
                disabled={!followupOn}
              />
              <span>weeks</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-rove-charcoal">
              <input
                type="checkbox"
                id="supplementOn"
                checked={supplementOn}
                onChange={(e) => setSupplementOn(e.target.checked)}
                className="h-4 w-4 accent-rove-charcoal"
              />
              <select
                className="rounded-lg border border-taupe/40 bg-white px-2 py-1 text-sm outline-none focus:border-rove-charcoal"
                value={supplementAction}
                onChange={(e) => setSupplementAction(e.target.value as "start" | "continue" | "stop")}
                disabled={!supplementOn}
              >
                <option value="start">Start</option>
                <option value="continue">Continue</option>
                <option value="stop">Stop</option>
              </select>
              <input
                className="w-48 rounded-lg border border-taupe/40 bg-white px-2 py-1 text-sm outline-none focus:border-rove-charcoal"
                placeholder="supplement or medication"
                value={supplementProduct}
                onChange={(e) => setSupplementProduct(e.target.value)}
                disabled={!supplementOn}
                maxLength={80}
              />
            </div>
          </div>
        </fieldset>

        {error ? <p className="mt-4 text-sm text-rove-red">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 w-full rounded-xl bg-rove-charcoal px-4 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {submitting ? "Sending…" : "Send to her Rove app"}
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-taupe-dark">
          Your note is stored as written and cannot be edited afterwards. Rove does not verify
          medical credentials — she is shown your name as you entered it, and asked to confirm she
          recognises you before your note appears in her plan.
        </p>
      </div>
    </form>
  );
}
