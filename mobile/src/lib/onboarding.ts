import { supabase } from './supabase';
import { API_URL } from './api';
import { ONBOARDING_FLOW_VERSION } from '@shared/onboarding/constants';
import { onboardingSubmissionSchema } from '@shared/onboarding/schemas';
import type { OnboardingSubmissionV2 } from '@shared/onboarding/types';

export type OnboardingActionResult = {
  ok: boolean;
  code?: string;
  message?: string;
  errors?: Record<string, string>;
};

export async function fetchOnboardingCompleted(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();
  if (error) return true;
  return Boolean(data?.onboarding_completed);
}

export async function trackOnboardingEvent(
  eventName: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/onboarding-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, payload }),
    });
  } catch {
    // Ignore telemetry errors to avoid affecting user flow.
  }
}

function mapZodErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errorMap: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'form';
    if (!errorMap[key]) {
      errorMap[key] = issue.message;
    }
  }
  return errorMap;
}

export async function submitOnboardingV2(
  input: OnboardingSubmissionV2
): Promise<OnboardingActionResult> {
  const parsed = onboardingSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_FAILED',
      message: 'Please review the highlighted fields.',
      errors: mapZodErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      code: 'UNAUTHENTICATED',
      message: 'Please log in and try again.',
    };
  }

  const { error: rpcError } = await supabase.rpc('complete_onboarding_v2', {
    p_name: data.name,
    p_goals: data.goals,
    p_conditions: data.conditions,
    p_symptoms: data.symptoms,
    p_last_period_start: data.lastPeriodStart,
    p_cycle_length_days: data.cycleLength,
    p_period_length_days: data.periodLength,
    p_is_irregular: data.isIrregular,
    p_period_history: data.periodHistory,
  });

  if (rpcError) {
    console.error('Onboarding RPC error:', rpcError);
    return {
      ok: false,
      code: 'ONBOARDING_SAVE_FAILED',
      message: 'Could not save onboarding. Please try again.',
    };
  }

  if (data.heightCm || data.weightKg || data.dietPreference) {
    await supabase.from('user_lifestyle').upsert(
      {
        user_id: user.id,
        height_cm: data.heightCm ?? null,
        weight_kg: data.weightKg ?? null,
        diet_preference: data.dietPreference || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }

  if (data.dateOfBirth) {
    await supabase
      .from('user_onboarding')
      .update({ date_of_birth: data.dateOfBirth, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  }

  await supabase
    .from('profiles')
    .update({
      onboarding_flow_version: ONBOARDING_FLOW_VERSION,
      onboarding_status: 'onboarding_complete',
      onboarding_step: 4,
      onboarding_completed: true,
      privacy_consented_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      full_name: data.name,
      onboarding_completed: true,
    },
  });

  if (authUpdateError) {
    console.error('Session metadata update failed:', authUpdateError);
  }

  return { ok: true };
}
