import type { Counted, HealthReport, TtcReportCycle, TtcReportData } from './healthReport';
import type { OpkResult, OvulationSignal } from '@shared/cycle/ttc';

/**
 * Renders the health report as print-ready HTML for expo-print.
 *
 * Layout intent: page one is the clinical summary — objective figures, ordered so
 * a doctor can scan it in under a minute. Page two is the member's own guidance.
 * The two audiences are kept visually distinct so neither has to read the other's
 * half, and so suggestions are never mistaken for clinical findings.
 */

const ACCENT = '#4338CA';
const INK = '#1F2937';
const MUTED = '#6B7280';
const RULE = '#E5E7EB';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function metric(label: string, value: string, note?: string): string {
  return `
    <div class="metric">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${escapeHtml(value)}</div>
      ${note ? `<div class="metric-note">${escapeHtml(note)}</div>` : ''}
    </div>`;
}

function countedList(items: Counted[], emptyText: string): string {
  if (items.length === 0) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  const max = Math.max(...items.map((i) => i.count));
  // Flex rows rather than a table: WebKit's print renderer collapses the height of
  // a background-filled <td>, which silently dropped the bars from the PDF.
  return `
    <div class="bars">
      ${items
        .map(
          (i) => `
        <div class="bar-row">
          <div class="bar-name">${escapeHtml(i.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.max(4, Math.round((i.count / max) * 100))}%"></div></div>
          <div class="bar-count">${i.count}</div>
        </div>`,
        )
        .join('')}
    </div>`;
}

const STATUS_LABEL: Record<OvulationSignal['status'], string> = {
  insufficient_data: 'Not enough data',
  monitoring: 'Monitoring',
  fertile_window: 'Fertile window',
  ovulation_likely: 'Ovulation likely',
  ovulation_confirmed: 'Ovulation confirmed',
};

const METHOD_LABEL: Record<OvulationSignal['method'], string> = {
  combined: 'Temperature + test',
  bbt_only: 'Temperature only',
  opk_only: 'Ovulation test only',
  date_math: 'Cycle dates',
};

const OPK_COLORS: Record<OpkResult, string> = {
  negative: '#E5E7EB',
  low: '#C7C2F0',
  high: '#8B7FE0',
  peak: ACCENT,
};

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function dayOffset(cycleStart: string, dateStr: string): number {
  const start = new Date(`${cycleStart}T00:00:00`).getTime();
  const target = new Date(`${dateStr}T00:00:00`).getTime();
  return Math.round((target - start) / 86400000) + 1;
}

/**
 * Static inline SVG for the most recent cycle's temperature/test readings —
 * same shape as the in-app chart (shared/cycle/ttc.ts's model), redrawn here
 * as plain markup since expo-print renders a static document, not a live
 * React tree.
 */
function renderTtcChart(chart: NonNullable<TtcReportData['chart']>): string {
  const { cycleStart, bbt, opk, coverline } = chart;
  const width = 520;
  const height = 150;
  const padLeft = 34;
  const padRight = 10;
  const padTop = 10;
  const opkRowHeight = 22;
  const plotHeight = height - padTop - opkRowHeight;
  const plotBottom = padTop + plotHeight;

  const lastDay = Math.max(1, ...bbt.map((r) => dayOffset(cycleStart, r.date)), ...opk.map((r) => dayOffset(cycleStart, r.date)));
  const span = Math.max(lastDay - 1, 1);
  const plotWidth = width - padLeft - padRight;

  const temps = bbt.map((r) => r.value);
  const values = coverline !== null ? [...temps, coverline] : temps;
  const rawMin = values.length ? Math.min(...values) : 36.0;
  const rawMax = values.length ? Math.max(...values) : 37.0;
  const mid = (rawMin + rawMax) / 2;
  const tempSpan = Math.max(rawMax - rawMin, 0.6);
  const minTemp = mid - tempSpan / 2 - 0.05;
  const maxTemp = mid + tempSpan / 2 + 0.05;

  const x = (dateStr: string) => padLeft + ((dayOffset(cycleStart, dateStr) - 1) / span) * plotWidth;
  const y = (value: number) => padTop + ((maxTemp - value) / (maxTemp - minTemp)) * plotHeight;

  // Break the line wherever a day was missed, matching the in-app chart —
  // an unlogged stretch shouldn't be drawn as a measured trend.
  const segments: typeof bbt[] = [];
  bbt.forEach((r, i) => {
    const prev = bbt[i - 1];
    if (!prev || dayOffset(cycleStart, r.date) - dayOffset(cycleStart, prev.date) > 1) segments.push([r]);
    else segments[segments.length - 1].push(r);
  });
  const linePath = (segment: typeof bbt) =>
    segment.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(r.date).toFixed(1)},${y(r.value).toFixed(1)}`).join(' ');

  const gridLines = [maxTemp, minTemp]
    .map(
      (v) => `
      <text x="0" y="${(y(v) + 3).toFixed(1)}" font-size="8" fill="${MUTED}">${v.toFixed(1)}</text>
      <line x1="${padLeft}" y1="${y(v).toFixed(1)}" x2="${width - padRight}" y2="${y(v).toFixed(1)}" stroke="${RULE}" stroke-width="0.75" />`,
    )
    .join('');

  const coverlineSvg =
    coverline !== null
      ? `<line x1="${padLeft}" y1="${y(coverline).toFixed(1)}" x2="${width - padRight}" y2="${y(coverline).toFixed(1)}" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 3" />
         <text x="${width - padRight}" y="${(y(coverline) - 4).toFixed(1)}" font-size="8" fill="${MUTED}" text-anchor="end">coverline</text>`
      : '';

  const linesSvg = segments
    .map((seg) => `<path d="${linePath(seg)}" stroke="${ACCENT}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />`)
    .join('');
  const dotsSvg = bbt
    .map((r) => `<circle cx="${x(r.date).toFixed(1)}" cy="${y(r.value).toFixed(1)}" r="2.6" fill="${ACCENT}" />`)
    .join('');
  const opkSvg = opk
    .map(
      (r) =>
        `<rect x="${(x(r.date) - 4).toFixed(1)}" y="${plotBottom + 6}" width="8" height="9" rx="2" fill="${OPK_COLORS[r.value]}" />`,
    )
    .join('');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${gridLines}
      ${coverlineSvg}
      ${linesSvg}
      ${dotsSvg}
      ${opkSvg}
      <text x="0" y="${plotBottom + 15}" font-size="8" fill="${MUTED}">test</text>
    </svg>`;
}

function renderTtcSection(ttc: TtcReportData, personFirstName: string): string {
  const rows = ttc.cycles
    .map((c: TtcReportCycle) => {
      const range = c.isOngoing ? `${shortDate(c.cycleStart)} – ongoing` : `${shortDate(c.cycleStart)} – ${shortDate(c.cycleEnd)}`;
      return `
      <tr>
        <td class="m-name">${escapeHtml(range)}</td>
        <td>${escapeHtml(STATUS_LABEL[c.status])}</td>
        <td>${c.confirmedDate ? escapeHtml(shortDate(c.confirmedDate)) : '—'}</td>
        <td>${escapeHtml(METHOD_LABEL[c.method])}</td>
      </tr>`;
    })
    .join('');

  return `
  <h2>Fertility Signals</h2>
  ${
    ttc.chart
      ? `<p class="sub" style="margin-bottom:6px">Current cycle — basal body temperature and ovulation test readings, from ${shortDate(ttc.chart.cycleStart)}.</p>
         ${renderTtcChart(ttc.chart)}`
      : `<p class="empty">No temperature or ovulation test readings logged this cycle.</p>`
  }

  <h3 style="margin-top:14px">Ovulation history</h3>
  <table class="matrix">
    <thead>
      <tr>
        <th class="m-name">Cycle</th>
        <th>Status</th>
        <th>Ovulation</th>
        <th>Detected from</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="sub" style="margin-top:8px">
    "Detected from" shows which of ${escapeHtml(personFirstName)}'s own readings the status is based on —
    temperature, ovulation tests, or cycle-date estimates when neither was logged that cycle.
    These are descriptive readings from self-logged data, not a fertility diagnosis.
  </p>`;
}

export function renderHealthReportHtml(r: HealthReport): string {
  const { person, cycle, coverage } = r;

  const bodyLine = [
    person.heightCm ? `${person.heightCm} cm` : null,
    person.weightKg ? `${person.weightKg} kg` : null,
    person.bmi ? `BMI ${person.bmi}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const phaseOrder = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'];

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: ${INK};
    font-size: 10.5pt;
    line-height: 1.45;
    margin: 0;
  }
  h1 { font-size: 19pt; margin: 0 0 2px; letter-spacing: -0.3px; }
  h2 {
    font-size: 10pt; text-transform: uppercase; letter-spacing: 1.2px;
    color: ${ACCENT}; margin: 22px 0 8px; padding-bottom: 5px;
    border-bottom: 1.5px solid ${RULE};
  }
  h3 { font-size: 10pt; margin: 14px 0 5px; color: ${INK}; }
  p { margin: 0 0 8px; }
  .sub { color: ${MUTED}; font-size: 9.5pt; }
  .header { border-bottom: 2.5px solid ${ACCENT}; padding-bottom: 10px; margin-bottom: 4px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { font-size: 9pt; letter-spacing: 2.5px; color: ${ACCENT}; text-transform: uppercase; }

  .idblock { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px 26px; font-size: 9.5pt; }
  .idblock div span { color: ${MUTED}; }

  .metrics { display: flex; flex-wrap: wrap; gap: 8px; }
  .metric {
    flex: 1 1 22%; min-width: 110px; border: 1px solid ${RULE};
    border-radius: 7px; padding: 8px 10px;
  }
  .metric-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.8px; color: ${MUTED}; }
  .metric-value { font-size: 15pt; font-weight: 600; margin-top: 2px; }
  .metric-note { font-size: 8pt; color: ${MUTED}; margin-top: 1px; }

  .bars { width: 100%; }
  .bar-row { display: flex; align-items: center; gap: 8px; padding: 2.5px 0; font-size: 9.5pt; }
  .bar-name { flex: 0 0 40%; }
  .bar-track { flex: 1 1 auto; background: #F3F4F6; border-radius: 4px; height: 9px; overflow: hidden; }
  .bar-fill { height: 9px; background: ${ACCENT}; border-radius: 4px; opacity: 0.75; }
  .bar-count { flex: 0 0 18px; text-align: right; color: ${MUTED}; font-size: 9pt; }

  .flag { border-left: 3px solid #B45309; background: #FFFBEB; padding: 7px 11px; margin-bottom: 6px; border-radius: 0 5px 5px 0; }
  .flag b { display: block; font-size: 10pt; }
  .flag span { color: ${MUTED}; font-size: 9pt; }

  .sug { border: 1px solid ${RULE}; border-radius: 7px; padding: 9px 11px; margin-bottom: 7px; }
  .sug-area { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1px; color: ${ACCENT}; }
  .sug b { display: block; margin: 2px 0 3px; font-weight: 600; }
  .sug span { color: ${MUTED}; font-size: 9.5pt; }

  table.matrix { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  table.matrix th {
    font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.7px; color: ${MUTED};
    font-weight: 600; text-align: center; padding: 0 4px 5px; border-bottom: 1px solid ${RULE};
  }
  table.matrix td { text-align: center; padding: 4px; border-bottom: 1px solid #F3F4F6; color: ${MUTED}; }
  table.matrix th.m-name, table.matrix td.m-name { text-align: left; width: 30%; color: ${INK}; }
  table.matrix td.peak { background: rgba(67,56,202,0.10); color: ${ACCENT}; font-weight: 700; border-radius: 3px; }
  table.matrix th.m-total, table.matrix td.m-total { color: ${INK}; font-weight: 600; width: 12%; }

  .cols { display: flex; gap: 20px; }
  .col { flex: 1; }
  .empty { color: ${MUTED}; font-style: italic; font-size: 9.5pt; }
  /* Keep a heading with its content and stop rows splitting mid-table. */
  h2 { page-break-after: avoid; }
  h3 { page-break-after: avoid; }
  table.matrix tr, .bar-row, .metric, .flag, .sug { page-break-inside: avoid; }
  .pagebreak { page-break-before: always; }
  .note {
    margin-top: 20px; padding: 9px 11px; background: #F9FAFB;
    border: 1px solid ${RULE}; border-radius: 7px; font-size: 8.5pt; color: ${MUTED};
  }
</style>
</head>
<body>

  <div class="header">
    <div class="header-row">
      <div>
        <div class="brand">Rove Health</div>
        <h1>Cycle &amp; Wellbeing Summary</h1>
        <div class="sub">${formatLongDate(r.windowStart)} – ${formatLongDate(r.windowEnd)} · ${r.windowDays} days</div>
      </div>
      <div class="sub" style="text-align:right">
        Generated<br />${r.generatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </div>
    <div class="idblock">
      <div><span>Name</span> ${escapeHtml(person.name)}</div>
      ${bodyLine ? `<div><span>Body</span> ${escapeHtml(bodyLine)}</div>` : ''}
      ${person.conditions.length ? `<div><span>Conditions</span> ${escapeHtml(person.conditions.join(', '))}</div>` : ''}
      ${person.dietPreference ? `<div><span>Diet</span> ${escapeHtml(person.dietPreference)}</div>` : ''}
      ${person.activityLevel ? `<div><span>Activity</span> ${escapeHtml(person.activityLevel)}</div>` : ''}
    </div>
  </div>

  <h2>Cycle</h2>
  <div class="metrics">
    ${metric('Avg cycle', cycle.averageLength ? `${cycle.averageLength} d` : '—', cycle.observedCycles.length ? `${cycle.observedCycles.length} observed` : 'not enough data')}
    ${metric('Range', cycle.shortestLength && cycle.longestLength ? `${cycle.shortestLength}–${cycle.longestLength} d` : '—', 'shortest to longest')}
    ${metric('Variation', cycle.variationDays !== null ? `±${cycle.variationDays.toFixed(1)} d` : '—', 'std. deviation')}
    ${metric('Avg bleed', cycle.averagePeriodLength ? `${cycle.averagePeriodLength} d` : '—', cycle.longestPeriodLength ? `longest ${cycle.longestPeriodLength} d` : undefined)}
  </div>
  <p class="sub" style="margin-top:8px">
    Figures are derived from logged period days over the reporting window, not from the
    member's saved averages${cycle.markedIrregular ? '. Cycles are self-reported as irregular' : ''}.
    ${cycle.observedCycles.length < 2 ? 'Fewer than two complete cycles were recorded, so cycle-length statistics are indicative only.' : ''}
  </p>

  ${r.ttc ? renderTtcSection(r.ttc, person.name.split(' ')[0]) : ''}

  <h2>Daily measures</h2>
  <div class="metrics">
    ${metric('Sleep', r.sleep.average !== null ? `${r.sleep.average.toFixed(1)} h` : '—', `${r.sleep.daysLogged} nights logged`)}
    ${metric('Hydration', r.hydration.average !== null ? `${Math.round(r.hydration.average)} ml` : '—', `${r.hydration.daysLogged} days logged`)}
    ${metric('Activity', r.exercise.weeklyAverage !== null ? `${Math.round(r.exercise.weeklyAverage)} min/wk` : '—', `${r.exercise.daysLogged} sessions`)}
    ${metric('Log coverage', `${coverage.completenessPct}%`, `${coverage.daysWithAnyLog} of ${r.windowDays} days`)}
  </div>

  ${
    r.nutrition
      ? `
  <h2>Nutrition</h2>
  <div class="metrics">
    ${metric('Calories', r.nutrition.calories.average !== null ? `${Math.round(r.nutrition.calories.average)} kcal` : '—', `${r.nutrition.daysLogged} days logged`)}
    ${metric('Protein', r.nutrition.proteinG.average !== null ? `${Math.round(r.nutrition.proteinG.average)} g` : '—')}
    ${metric('Carbs', r.nutrition.carbsG.average !== null ? `${Math.round(r.nutrition.carbsG.average)} g` : '—')}
    ${metric('Fat', r.nutrition.fatG.average !== null ? `${Math.round(r.nutrition.fatG.average)} g` : '—')}
    ${metric('Sugar', r.nutrition.sugarG.average !== null ? `${Math.round(r.nutrition.sugarG.average)} g` : '—', r.nutrition.avgGlycemicIndex !== null ? `avg GI ${r.nutrition.avgGlycemicIndex}` : undefined)}
  </div>
  <p class="sub" style="margin-top:8px">
    Daily averages from ${r.nutrition.mealsLogged} logged meal${r.nutrition.mealsLogged === 1 ? '' : 's'} across ${r.nutrition.daysLogged} day${r.nutrition.daysLogged === 1 ? '' : 's'}.
    Macros and glycemic index are AI-estimated from what was typed in when logged, not a lab measurement.
  </p>
  ${r.nutrition.topFoods.length ? `<h3 style="margin-top:12px">Most frequently logged</h3>${countedList(r.nutrition.topFoods, '')}` : ''}
  `
      : ''
  }

  ${
    r.wearable
      ? `
  <h2>Wearable Signals</h2>
  <div class="metrics">
    ${metric('Resting HR', r.wearable.restingHeartRate.average !== null ? `${Math.round(r.wearable.restingHeartRate.average)} bpm` : '—', `${r.wearable.restingHeartRate.daysLogged} days`)}
    ${metric('HRV', r.wearable.hrv.average !== null ? `${Math.round(r.wearable.hrv.average)} ms` : '—', `${r.wearable.hrv.daysLogged} days`)}
    ${metric('Steps', r.wearable.steps.average !== null ? Math.round(r.wearable.steps.average).toLocaleString('en-IN') : '—', `${r.wearable.steps.daysLogged} days`)}
    ${metric('Skin temp', r.wearable.skinTempDelta.average !== null ? `${r.wearable.skinTempDelta.average >= 0 ? '+' : ''}${r.wearable.skinTempDelta.average.toFixed(2)} °C` : '—', `vs. own baseline · ${r.wearable.skinTempDelta.daysLogged} days`)}
  </div>
  <p class="sub" style="margin-top:8px">
    Synced from Apple Health / Health Connect. Informational only — never used to detect ovulation, and not a medical-grade measurement.
  </p>
  `
      : ''
  }

  <h2>Symptoms</h2>
  ${
    r.symptoms.matrix.length === 0
      ? `<p class="empty">No symptoms logged in this period.</p>`
      : `
    <p class="sub" style="margin-bottom:8px">
      Recorded on ${r.symptoms.daysWithSymptoms} of the ${r.coverage.daysWithAnyLog} days logged.
      Shaded cells mark the phase where each symptom occurred most.
    </p>
    <table class="matrix">
      <thead>
        <tr>
          <th class="m-name">Symptom</th>
          ${phaseOrder.map((p) => `<th>${p}</th>`).join('')}
          <th class="m-total">Total</th>
        </tr>
      </thead>
      <tbody>
        ${r.symptoms.matrix
          .map(
            (row) => `
          <tr>
            <td class="m-name">${escapeHtml(row.name)}</td>
            ${phaseOrder
              .map((p) => {
                const v = row.byPhase[p] || 0;
                const isPeak = row.peakPhase === p && v > 0;
                return `<td class="${isPeak ? 'peak' : ''}">${v || '·'}</td>`;
              })
              .join('')}
            <td class="m-total">${row.total}</td>
          </tr>`,
          )
          .join('')}
      </tbody>
    </table>`
  }

  <div class="cols" style="margin-top:16px">
    <div class="col">
      <h3>Most frequently logged</h3>
      ${countedList(r.symptoms.top, 'None recorded.')}
    </div>
    <div class="col">
      <h3>Mood</h3>
      ${countedList(r.moods, 'None recorded.')}
    </div>
  </div>

  ${
    r.sleepDisruptors.length
      ? `<h2>Reported sleep disruptors</h2>${countedList(r.sleepDisruptors, '')}`
      : ''
  }

  ${
    r.clinicalFlags.length
      ? `<h2>Observations for review</h2>
         ${r.clinicalFlags
           .map(
             (f) => `<div class="flag"><b>${escapeHtml(f.finding)}</b><span>${escapeHtml(f.why)}</span></div>`,
           )
           .join('')}
         <p class="sub">These are descriptive observations from self-reported data, not diagnoses.</p>`
      : ''
  }

  <div class="pagebreak"></div>
  <h2>For ${escapeHtml(person.name.split(' ')[0])} — where to focus</h2>
  <p class="sub">
    Suggestions generated from your own logs against widely used general-health targets.
    They are not medical advice, and they are kept separate from the clinical summary on purpose.
  </p>
  ${
    r.suggestions.length
      ? r.suggestions
          .map(
            (s) => `
      <div class="sug">
        <div class="sug-area">${escapeHtml(s.area)}</div>
        <b>${escapeHtml(s.finding)}</b>
        <span>${escapeHtml(s.action)}</span>
      </div>`,
          )
          .join('')
      : `<p class="empty">Nothing stood out against the general targets we check. Keep logging — the more days recorded, the more useful this section becomes.</p>`
  }

  <div class="note">
    <b>How this was made.</b> Every figure and suggestion in this report was calculated on
    ${escapeHtml(person.name.split(' ')[0])}'s own device from data they logged themselves.
    No health information was sent to an AI service or any third party to produce it.
    Averages are taken only across days that were actually logged, so a low log coverage
    figure means the averages rest on fewer days.
  </div>

</body>
</html>`;
}
