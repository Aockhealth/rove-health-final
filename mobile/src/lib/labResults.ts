/**
 * Manually logged lab values — testosterone, AMH, TSH, prolactin, LH:FSH
 * ratio, ultrasound notes — shown on the Clinical tab. Irregular, one value
 * at a time, never read by detectOvulation.
 *
 * @module mobile/src/lib/labResults
 */
import { supabase } from './supabase';

export interface LabResult {
  id: string;
  date: string;
  testName: string;
  value: number | null;
  unit: string | null;
  notes: string | null;
  loggedAt: string;
}

/** Common tests worth offering as quick picks — she can still type anything else. */
export const COMMON_LAB_TESTS = [
  { name: 'Testosterone', unit: 'ng/dL' },
  { name: 'AMH', unit: 'ng/mL' },
  { name: 'TSH', unit: 'mIU/L' },
  { name: 'Prolactin', unit: 'ng/mL' },
  { name: 'LH:FSH Ratio', unit: '' },
  { name: 'Fasting Insulin', unit: 'μIU/mL' },
] as const;

function mapRow(row: any): LabResult {
  return {
    id: row.id,
    date: row.date,
    testName: row.test_name,
    value: row.value,
    unit: row.unit,
    notes: row.notes,
    loggedAt: row.logged_at,
  };
}

export async function logLabResult(entry: {
  date: string;
  testName: string;
  value?: number | null;
  unit?: string | null;
  notes?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated' };

  const { error } = await supabase.from('lab_results').insert({
    user_id: user.id,
    date: entry.date,
    test_name: entry.testName.trim(),
    value: entry.value ?? null,
    unit: entry.unit ?? null,
    notes: entry.notes ?? null,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteLabResult(id: string): Promise<boolean> {
  const { error } = await supabase.from('lab_results').delete().eq('id', id);
  return !error;
}

/** Most recent first — a feed, not a form. */
export async function fetchLabResults(limit = 30): Promise<LabResult[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('lab_results')
    .select('id, date, test_name, value, unit, notes, logged_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapRow);
}
