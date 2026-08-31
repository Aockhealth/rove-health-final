import {
  PHASE_ORDER,
  formatDate,
  num,
  type Counted,
  type DoctorSnapshot,
  type Observed,
  type SymptomRow,
} from "./snapshot";

/**
 * The clinician's read of a published snapshot.
 *
 * Ordered for a seven-minute consultation: everything that might change a
 * decision is above the fold, and the full record is underneath in native
 * <details> sections — which cost no JavaScript, survive a clinic PC with a
 * dead network, and expand automatically when the page is printed.
 *
 * Nothing here is computed. Every number was calculated on the patient's
 * phone by mobile/src/lib/healthReport.ts and frozen at share time, so what
 * her doctor reads and what she read are the same figures by construction.
 */

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-taupe/30 bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">{label}</div>
      <div className="mt-1 font-serif text-2xl text-rove-charcoal">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] leading-tight text-taupe-dark">{hint}</div> : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="report-section group border-t border-taupe/30 py-4">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-rove-charcoal">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-taupe-dark">{subtitle}</p> : null}
        </div>
        <span className="shrink-0 text-xs font-semibold text-taupe-dark group-open:hidden">Show</span>
        <span className="hidden shrink-0 text-xs font-semibold text-taupe-dark group-open:inline">Hide</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function ObservedRow({ label, value, unit, observed }: { label: string; value: string; unit?: string; observed: Observed }) {
  return (
    <tr className="border-b border-taupe/20 last:border-0">
      <td className="py-2 pr-4 text-sm text-rove-charcoal">{label}</td>
      <td className="py-2 pr-4 text-sm font-semibold text-rove-charcoal">
        {value}
        {unit}
      </td>
      <td className="py-2 text-xs text-taupe-dark">over {observed.daysLogged} logged days</td>
    </tr>
  );
}

/** A symptom × phase table. `peakPhase` is emphasised because "where it clusters" is the clinically interesting part, not the raw total. */
function PhaseMatrix({ rows, emptyLabel }: { rows: SymptomRow[]; emptyLabel: string }) {
  if (!rows?.length) return <p className="text-sm text-taupe-dark">{emptyLabel}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-taupe/40">
            <th className="py-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
              Entry
            </th>
            {PHASE_ORDER.map((p) => (
              <th key={p} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
                {p.slice(0, 4)}
              </th>
            ))}
            <th className="py-2 pl-2 text-right text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
              Clusters in
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-taupe/20 last:border-0">
              <td className="py-2 pr-4 text-rove-charcoal">{row.name}</td>
              {PHASE_ORDER.map((p) => (
                <td key={p} className="px-2 py-2 text-center tabular-nums text-taupe-dark">
                  {row.byPhase?.[p] || "·"}
                </td>
              ))}
              <td className="py-2 pl-2 text-right text-xs font-semibold text-rove-charcoal">
                {row.peakPhase ?? <span className="font-normal text-taupe-dark">even spread</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountedList({ items, empty }: { items: Counted[]; empty: string }) {
  if (!items?.length) return <p className="text-sm text-taupe-dark">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((c) => (
        <li key={c.name} className="rounded-full border border-taupe/40 px-3 py-1 text-xs text-rove-charcoal">
          {c.name} <span className="text-taupe-dark">×{c.count}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReportView({
  snapshot,
  patientLabel,
  sharedAt,
}: {
  snapshot: DoctorSnapshot;
  patientLabel: string | null;
  sharedAt: string | null;
}) {
  const s = snapshot;
  const cycle = s.cycle;
  const name = patientLabel || s.person?.name || "This patient";

  return (
    <article className="mx-auto max-w-3xl px-5 pb-10">
      {/* ── Identity and provenance ─────────────────────────────────────── */}
      <header className="border-b border-taupe/40 pb-5 pt-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-taupe-dark">Rove</div>
        <h1 className="mt-2 font-serif text-3xl text-rove-charcoal">{name}</h1>
        <p className="mt-1 text-sm text-taupe-dark">
          Self-tracked record · {formatDate(s.windowStart)} to {formatDate(s.windowEnd)} ({s.windowDays} days)
        </p>
        <p className="mt-0.5 text-xs text-taupe-dark">
          Shared {formatDate(sharedAt)} · generated on the patient&apos;s device {formatDate(s.generatedAt)}
        </p>

        {/* The honesty line. A clinician's first question about self-reported
            data is how much of it there actually is — so it is answered before
            anything derived from it is shown, not in a footnote. */}
        <p className="mt-4 rounded-xl bg-taupe-light px-4 py-3 text-xs leading-relaxed text-rove-charcoal">
          Logged on <strong>{s.coverage?.daysWithAnyLog ?? 0} of {s.windowDays} days</strong> (
          {Math.round(s.coverage?.completenessPct ?? 0)}%). Every average below is computed only across days
          with an entry — never across missing days. This is patient-recorded data, not clinical measurement.
        </p>

        {(s.person?.conditions?.length ||
          s.person?.bmi ||
          s.person?.activityLevel ||
          s.person?.dietPreference) ? (
          <p className="mt-3 text-xs text-taupe-dark">
            {[
              s.person?.bmi ? `BMI ${num(s.person.bmi)}` : null,
              s.person?.heightCm ? `${num(s.person.heightCm)} cm` : null,
              s.person?.weightKg ? `${num(s.person.weightKg)} kg` : null,
              s.person?.activityLevel,
              s.person?.dietPreference,
              s.person?.conditions?.length ? `Reported: ${s.person.conditions.join(", ")}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </header>

      {/* ── At a glance ─────────────────────────────────────────────────── */}
      <section className="py-6">
        {s.clinicalFlags?.length ? (
          <div className="mb-6 rounded-2xl border border-rove-red/30 bg-rove-red/5 p-4">
            <h2 className="font-serif text-lg text-rove-charcoal">Worth reviewing</h2>
            <p className="mt-0.5 text-[11px] text-taupe-dark">
              Descriptive observations from her logs. Not diagnoses, and not ranked by severity.
            </p>
            <ul className="mt-3 space-y-3">
              {s.clinicalFlags.map((f) => (
                <li key={f.finding}>
                  <p className="text-sm font-semibold text-rove-charcoal">{f.finding}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-taupe-dark">{f.why}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border border-taupe/30 bg-white p-4">
            <p className="text-sm text-rove-charcoal">
              Nothing in this window met the thresholds Rove flags for review.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Cycle length"
            value={num(cycle?.averageLength, "d")}
            hint={
              cycle?.shortestLength && cycle?.longestLength
                ? `range ${cycle.shortestLength}–${cycle.longestLength}`
                : `${cycle?.observedCycles?.length ?? 0} observed`
            }
          />
          <Stat
            label="Variation"
            value={num(cycle?.variationDays, "d")}
            hint={cycle?.markedIrregular ? "self-reported irregular" : "standard deviation"}
          />
          <Stat
            label="Period length"
            value={num(cycle?.averagePeriodLength, "d")}
            hint={cycle?.longestPeriodLength ? `longest ${cycle.longestPeriodLength}d` : undefined}
          />
          <Stat
            label="PCOS indicators"
            value={
              s.pmosScore
                ? `${s.pmosScore.flaggedCount}/${s.pmosScore.assessableCount}`
                : "—"
            }
            hint={s.pmosScore ? "of those assessable" : "not assessed"}
          />
        </div>

        {s.symptoms?.matrix?.length ? (
          <p className="mt-4 text-sm leading-relaxed text-rove-charcoal">
            <span className="text-taupe-dark">Most frequent:</span>{" "}
            {s.symptoms.matrix.slice(0, 3).map((row, i) => (
              <span key={row.name}>
                {i > 0 ? "; " : ""}
                <strong>{row.name}</strong> ×{row.total}
                {row.peakPhase ? `, clustering in the ${row.peakPhase.toLowerCase()} phase` : ""}
              </span>
            ))}
            .
          </p>
        ) : null}
      </section>

      {/* ── The full record ─────────────────────────────────────────────── */}
      <Section title="Cycle detail" subtitle={`${cycle?.observedCycles?.length ?? 0} cycles observed in this window`}>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-taupe/20">
              <td className="py-2 pr-4 text-sm text-rove-charcoal">Observed cycle lengths</td>
              <td className="py-2 text-sm font-semibold tabular-nums text-rove-charcoal">
                {cycle?.observedCycles?.length ? cycle.observedCycles.join(", ") : "—"}
              </td>
            </tr>
            <tr className="border-b border-taupe/20">
              <td className="py-2 pr-4 text-sm text-rove-charcoal">Observed period lengths</td>
              <td className="py-2 text-sm font-semibold tabular-nums text-rove-charcoal">
                {cycle?.observedPeriodLengths?.length ? cycle.observedPeriodLengths.join(", ") : "—"}
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-sm text-rove-charcoal">Her app settings</td>
              <td className="py-2 text-sm text-taupe-dark">
                {cycle?.settingsCycleLength}d cycle / {cycle?.settingsPeriodLength}d period
                {cycle?.markedIrregular ? " · marked irregular" : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {s.cycleAnomalies?.length ? (
          <div className="mt-5">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
              Cycles unusual against her own history
            </h3>
            <ul className="mt-2 space-y-2">
              {s.cycleAnomalies.map((a) => (
                <li key={a.start} className="text-sm text-rove-charcoal">
                  <strong>{formatDate(a.start)}</strong> — {a.length} days vs her mean of {num(a.personalMean)} (
                  {a.zScore > 0 ? "+" : ""}
                  {num(a.zScore)} SD)
                  {a.likelyExplanation ? (
                    <span className="text-taupe-dark"> · she tagged {a.likelyExplanation} that cycle</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      {s.pmosScore?.indicators?.length ? (
        <Section
          title="PCOS pattern indicators"
          subtitle="Educational pattern count from her logs — not a diagnostic instrument"
        >
          <ul className="space-y-3">
            {s.pmosScore.indicators.map((ind) => (
              <li key={ind.key} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: !ind.assessable ? "#c4b0a3" : ind.flagged ? "#af6b6b" : "#8daa9d",
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-rove-charcoal">
                    {ind.label}
                    {!ind.assessable ? (
                      <span className="ml-2 text-xs font-normal text-taupe-dark">not enough data</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-taupe-dark">{ind.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        title="Symptoms by cycle phase"
        subtitle={`On ${s.symptoms?.daysWithSymptoms ?? 0} of ${s.coverage?.daysWithAnyLog ?? 0} logged days`}
      >
        <PhaseMatrix rows={s.symptoms?.matrix ?? []} emptyLabel="No symptoms logged in this window." />
      </Section>

      <Section title="Mood by cycle phase">
        <PhaseMatrix rows={s.moodMatrix ?? []} emptyLabel="No moods logged in this window." />
      </Section>

      <Section title="Sleep, hydration and movement">
        <table className="w-full border-collapse">
          <tbody>
            <ObservedRow label="Sleep" value={num(s.sleep?.average)} unit=" hrs/night" observed={s.sleep ?? { average: null, daysLogged: 0 }} />
            <ObservedRow label="Water" value={num(s.hydration?.average)} unit=" ml/day" observed={s.hydration ?? { average: null, daysLogged: 0 }} />
            <ObservedRow label="Exercise" value={num(s.exercise?.weeklyAverage)} unit=" mins/week" observed={s.exercise ?? { average: null, daysLogged: 0 }} />
          </tbody>
        </table>
        {s.exercise?.topTypes?.length ? (
          <div className="mt-4">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">Activity types</h3>
            <CountedList items={s.exercise.topTypes} empty="—" />
          </div>
        ) : null}
        {s.sleepDisruptors?.length ? (
          <div className="mt-4">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">Sleep disruptors tagged</h3>
            <CountedList items={s.sleepDisruptors} empty="—" />
          </div>
        ) : null}
      </Section>

      {s.labs?.length || s.medications?.length ? (
        <Section title="Labs and medication" subtitle="Entered by the patient from her own reports" defaultOpen>
          {s.labs?.length ? (
            <table className="w-full border-collapse">
              <tbody>
                {s.labs.map((lab) => (
                  <tr key={lab.id} className="border-b border-taupe/20 last:border-0">
                    <td className="py-2 pr-4 text-sm text-rove-charcoal">{lab.testName}</td>
                    <td className="py-2 pr-4 text-sm font-semibold tabular-nums text-rove-charcoal">
                      {lab.value ?? "—"} {lab.unit ?? ""}
                    </td>
                    <td className="py-2 pr-4 text-xs text-taupe-dark">{formatDate(lab.date)}</td>
                    <td className="py-2 text-xs text-taupe-dark">{lab.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-taupe-dark">No lab values entered.</p>
          )}

          {s.medications?.length ? (
            <div className="mt-4">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
                Fertility medication logged
              </h3>
              <ul className="space-y-1">
                {s.medications.map((m) => (
                  <li key={`${m.date}-${m.name}`} className="text-sm text-rove-charcoal">
                    {formatDate(m.date)} — {m.name}
                    {m.dose ? ` (${m.dose})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      {s.ttc?.cycles?.length ? (
        <Section title="Ovulation tracking" subtitle="From her basal temperature and ovulation tests">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-taupe/40">
                {["Cycle start", "Status", "Confirmed", "Method", "Confidence"].map((h) => (
                  <th key={h} className="py-2 pr-4 text-left text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.ttc.cycles.map((c) => (
                <tr key={c.cycleStart} className="border-b border-taupe/20 last:border-0">
                  <td className="py-2 pr-4 text-rove-charcoal">
                    {formatDate(c.cycleStart)}
                    {c.isOngoing ? <span className="text-taupe-dark"> (ongoing)</span> : null}
                  </td>
                  <td className="py-2 pr-4 text-rove-charcoal">{c.status?.replace(/_/g, " ")}</td>
                  <td className="py-2 pr-4 text-taupe-dark">{c.confirmedDate ? formatDate(c.confirmedDate) : "—"}</td>
                  <td className="py-2 pr-4 text-taupe-dark">{c.method?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="py-2 text-taupe-dark">{c.confidence ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {s.ttc.pcosPatterns?.length ? (
            <ul className="mt-4 space-y-2">
              {s.ttc.pcosPatterns.map((p) => (
                <li key={p.reason} className="text-sm text-rove-charcoal">
                  <strong>{p.title}</strong>{" "}
                  <span className="text-taupe-dark">
                    — {p.count} of {p.totalCycles} scored cycles
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      {s.nutrition ? (
        <Section title="Nutrition" subtitle={`${s.nutrition.mealsLogged} meals across ${s.nutrition.daysLogged} days`}>
          <table className="w-full border-collapse">
            <tbody>
              <ObservedRow label="Calories" value={num(s.nutrition.calories?.average)} unit=" kcal/day" observed={s.nutrition.calories} />
              <ObservedRow label="Protein" value={num(s.nutrition.proteinG?.average)} unit=" g/day" observed={s.nutrition.proteinG} />
              <ObservedRow label="Carbohydrate" value={num(s.nutrition.carbsG?.average)} unit=" g/day" observed={s.nutrition.carbsG} />
              <ObservedRow label="Fat" value={num(s.nutrition.fatG?.average)} unit=" g/day" observed={s.nutrition.fatG} />
              <ObservedRow label="Sugar" value={num(s.nutrition.sugarG?.average)} unit=" g/day" observed={s.nutrition.sugarG} />
            </tbody>
          </table>
          {s.nutrition.avgGlycemicIndex !== null ? (
            <p className="mt-3 text-sm text-rove-charcoal">
              Mean glycaemic index of estimated meals: <strong>{num(s.nutrition.avgGlycemicIndex)}</strong>
            </p>
          ) : null}
        </Section>
      ) : null}

      {s.wearable ? (
        <Section title="Wearable signals" subtitle="Synced from Apple Health or Health Connect — informational only">
          <table className="w-full border-collapse">
            <tbody>
              <ObservedRow label="Resting heart rate" value={num(s.wearable.restingHeartRate?.average)} unit=" bpm" observed={s.wearable.restingHeartRate} />
              <ObservedRow label="HRV" value={num(s.wearable.hrv?.average)} unit=" ms" observed={s.wearable.hrv} />
              <ObservedRow label="Steps" value={num(s.wearable.steps?.average)} unit="/day" observed={s.wearable.steps} />
              <ObservedRow label="Skin temp deviation" value={num(s.wearable.skinTempDelta?.average)} unit=" °C" observed={s.wearable.skinTempDelta} />
            </tbody>
          </table>
        </Section>
      ) : null}

      {/* Kept last and visually separated on purpose — the app's own advice to
          the patient must never be mistaken for a clinical finding. This is
          the same separation the printed PDF makes by putting it on its own
          page. */}
      {s.suggestions?.length ? (
        <Section title="What Rove suggested to her" subtitle="App-generated guidance for the patient — not clinical findings">
          <ul className="space-y-3">
            {s.suggestions.map((sug) => (
              <li key={sug.finding} className="rounded-xl bg-taupe-light/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-taupe-dark">{sug.area}</p>
                <p className="mt-1 text-sm text-rove-charcoal">{sug.finding}</p>
                <p className="mt-0.5 text-xs text-taupe-dark">{sug.action}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </article>
  );
}
