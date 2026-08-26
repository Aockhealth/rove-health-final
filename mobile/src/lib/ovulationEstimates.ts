/**
 * Persists the latest computed ovulation read for a cycle — an audit trail
 * for "why did the app say day 15 last month," not something any screen
 * reads back today. Recomputed and upserted on every new signal event
 * (i.e. every time fetchDashboardData runs in TTC mode), never batched.
 *
 * @module mobile/src/lib/ovulationEstimates
 */
import { supabase } from './supabase';
import { ALGORITHM_VERSION, contributingSignalsFromMethod, type OvulationSignal } from '@shared/cycle/ttc';

export async function persistOvulationEstimate(
  userId: string,
  cycleStart: string,
  signal: OvulationSignal
): Promise<void> {
  // Best-effort — a failed audit write should never block or crash the
  // dashboard the user is actually looking at.
  try {
    const { error } = await supabase.from('ovulation_estimates').upsert(
      {
        user_id: userId,
        cycle_start: cycleStart,
        status: signal.status,
        method: signal.method,
        confirmed_date: signal.confirmedDate,
        predicted_date: signal.predictedDate,
        fertile_window_start: signal.fertileWindowStart,
        fertile_window_end: signal.fertileWindowEnd,
        confidence: signal.confidence,
        contributing_signals: contributingSignalsFromMethod(signal.method),
        anovulatory_detected: signal.anovulatory?.detected ?? false,
        anovulatory_reasons: signal.anovulatory?.reasons ?? [],
        periovulatory_nsaid_flag: signal.periovulatoryNsaidFlag,
        explanation: signal.explanation,
        signal_snapshot: signal,
        algorithm_version: ALGORITHM_VERSION,
        computed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, cycle_start' }
    );
    if (error) console.error('[ovulationEstimates] upsert failed:', error.message);
  } catch (err) {
    console.error('[ovulationEstimates] upsert threw:', err);
  }
}
