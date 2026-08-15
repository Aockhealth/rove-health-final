import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TTC_GUIDANCE } from '@shared/content/ttc-guidance';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { deriveTtcState, TTC_STATE_META } from '../../lib/ttcEngine';
import { Card, Bullet, ACCENT } from './ttcCardKit';

const SESSION_BADGES = ['YOG', 'WLK', 'STR', 'RST'];

/**
 * TTC mode's Move tab — replaces ExerciseOrb/WorkoutHistory (both cycle-phase
 * framed) since TTC's movement guidance is steady week-to-week, not tied to
 * today's phase. The one state-driven line is the intro sentence, sourced
 * from `ttcEngine.ts` so it stays consistent with what Home/Plan's Guide tab
 * say about this cycle.
 */
export function TtcMoveSection({ hasPcos, signal }: { hasPcos: boolean; signal: OvulationSignal | null }) {
  const g = TTC_GUIDANCE;
  const moveIntro = signal ? TTC_STATE_META[deriveTtcState(signal)].moveIntro : 'Moderate, steady movement — nothing here needs to change day to day.';

  return (
    <View className="mb-2">
      <Card icon="activity" title="Movement this week">
        <Text className="mb-4 text-[12px] leading-[18px] text-rove-stone">{moveIntro}</Text>
        <View className="gap-2.5">
          {g.sessions.map((s, i) => (
            <View
              key={s.title}
              className="flex-row items-center gap-3 rounded-2xl border border-black/[0.06] px-3.5 py-2.5"
            >
              <View className="h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: `${ACCENT}18` }}>
                <Text className="text-[9px] font-extrabold" style={{ color: ACCENT }}>
                  {SESSION_BADGES[i] || '•'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-bold leading-tight text-rove-charcoal">{s.title}</Text>
                <Text className="mt-0.5 text-[11.5px] leading-tight text-rove-stone">{s.desc}</Text>
              </View>
              <Text className="text-[11px] font-extrabold" style={{ color: ACCENT }}>
                {s.length}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card icon="help-circle" title="How hard to push" delay={100}>
        {g.moveNotes.map((n) => (
          <Bullet key={n} text={n} />
        ))}

        {hasPcos ? (
          <View className="mt-4 rounded-2xl bg-white/60 p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="info" size={13} color={ACCENT} />
              <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                With PCOS
              </Text>
            </View>
            <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{g.movePcosNote}</Text>
          </View>
        ) : null}

        <Text className="mt-4 text-[11px] leading-[17px] text-rove-stone">
          General educational information, not medical advice. If you're being treated for infertility or have been
          told to limit activity, follow your doctor's guidance over this.
        </Text>
      </Card>
    </View>
  );
}
