import type { Counted, HealthReport } from './healthReport';

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
  return `
    <table class="bars">
      ${items
        .map(
          (i) => `
        <tr>
          <td class="bar-name">${escapeHtml(i.name)}</td>
          <td class="bar-track"><span style="width:${Math.round((i.count / max) * 100)}%"></span></td>
          <td class="bar-count">${i.count}</td>
        </tr>`,
        )
        .join('')}
    </table>`;
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

  table.bars { width: 100%; border-collapse: collapse; }
  table.bars td { padding: 2.5px 0; vertical-align: middle; font-size: 9.5pt; }
  .bar-name { width: 38%; padding-right: 8px; }
  .bar-track { width: 52%; background: #F3F4F6; border-radius: 4px; height: 9px; }
  .bar-track span { display: block; height: 9px; background: ${ACCENT}; border-radius: 4px; opacity: 0.75; }
  .bar-count { width: 10%; text-align: right; color: ${MUTED}; font-size: 9pt; padding-left: 8px; }

  .flag { border-left: 3px solid #B45309; background: #FFFBEB; padding: 7px 11px; margin-bottom: 6px; border-radius: 0 5px 5px 0; }
  .flag b { display: block; font-size: 10pt; }
  .flag span { color: ${MUTED}; font-size: 9pt; }

  .sug { border: 1px solid ${RULE}; border-radius: 7px; padding: 9px 11px; margin-bottom: 7px; }
  .sug-area { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1px; color: ${ACCENT}; }
  .sug b { display: block; margin: 2px 0 3px; font-weight: 600; }
  .sug span { color: ${MUTED}; font-size: 9.5pt; }

  .cols { display: flex; gap: 20px; }
  .col { flex: 1; }
  .empty { color: ${MUTED}; font-style: italic; font-size: 9.5pt; }
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

  <h2>Daily measures</h2>
  <div class="metrics">
    ${metric('Sleep', r.sleep.average !== null ? `${r.sleep.average.toFixed(1)} h` : '—', `${r.sleep.daysLogged} nights logged`)}
    ${metric('Hydration', r.hydration.average !== null ? `${Math.round(r.hydration.average)} ml` : '—', `${r.hydration.daysLogged} days logged`)}
    ${metric('Activity', r.exercise.weeklyAverage !== null ? `${Math.round(r.exercise.weeklyAverage)} min/wk` : '—', `${r.exercise.daysLogged} sessions`)}
    ${metric('Log coverage', `${coverage.completenessPct}%`, `${coverage.daysWithAnyLog} of ${r.windowDays} days`)}
  </div>

  <h2>Symptoms</h2>
  <div class="cols">
    <div class="col">
      <h3>Most frequently logged</h3>
      ${countedList(r.symptoms.top, 'No symptoms logged in this period.')}
    </div>
    <div class="col">
      <h3>Mood</h3>
      ${countedList(r.moods, 'No moods logged in this period.')}
    </div>
  </div>

  <h3>By cycle phase</h3>
  <div class="cols">
    ${phaseOrder
      .map(
        (phase) => `
      <div class="col">
        <div class="sub" style="font-weight:600;color:${INK}">${phase}</div>
        ${countedList(r.symptoms.byPhase[phase] || [], '—')}
      </div>`,
      )
      .join('')}
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
