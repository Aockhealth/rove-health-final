import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TTC_GUIDANCE } from '@shared/content/ttc-guidance';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { deriveTtcState, getTtcStateMetaByKey } from '../../lib/ttcEngine';
import { Card, Bullet, Label, ACCENT } from './ttcCardKit';
import { TtcWeekStrip } from './TtcWeekStrip';

/**
 * TTC's answer to the cycle-sync Guide tab's "The Science" card — same
 * header-strip-plus-badge shell (see ttcCardKit's Card), but the badge and
 * accent color track the fertility state instead of a fixed phase, and the
 * body is either the state's timing guidance (once there's a signal) or a
 * neutral "still gathering data" framing (before there's enough history to
 * say anything day-specific). Always renders — like the Science card always
 * has hormone content — so the Guide tab isn't missing its second block
 * before a signal exists.
 */
export function TtcTimingCard({ signal, hasPcos }: { signal: OvulationSignal | null; hasPcos: boolean }) {
  const { t } = useTranslation();

  if (!signal) {
    return (
      <Card icon="activity" title={t('plan.timing.gettingStarted')} kicker={t('plan.timing.yourFertility')} accentColor={ACCENT} delay={0}>
        <View className="rounded-2xl bg-white/60 p-3.5 border border-white/60">
          <Text className="mb-1 text-[9.5px] font-extrabold uppercase tracking-wide text-rove-stone">
            {t('plan.timing.notOnYetTitle')}
          </Text>
          <Text className="text-xs font-medium leading-relaxed text-rove-charcoal">
            {t('plan.timing.notOnYetBody')}
          </Text>
        </View>
        {hasPcos ? (
          <View className="mt-4 rounded-2xl bg-white/60 p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="info" size={13} color={ACCENT} />
              <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                {t('plan.move.withPcos')}
              </Text>
            </View>
            <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{TTC_GUIDANCE.pcosNote}</Text>
          </View>
        ) : null}

        <View className="mt-4">
          <Label text={TTC_GUIDANCE.clinical.title} />
          {TTC_GUIDANCE.clinical.points.map((p) => (
            <Bullet key={p} text={p} />
          ))}
        </View>

        <Text className="mt-4 text-[11px] leading-[17px] text-rove-stone">{TTC_GUIDANCE.disclaimer}</Text>
      </Card>
    );
  }

  const stateKey = deriveTtcState(signal);
  const meta = getTtcStateMetaByKey(stateKey, t);

  return (
    <Card icon="activity" title={t('plan.timing.cardTitle')} kicker={t('plan.timing.yourFertility')} badge={meta.timingKicker} accentColor={meta.color} delay={0}>
      <Text className="text-[12px] leading-[18px] text-rove-stone italic">"{TTC_GUIDANCE.intro}"</Text>

      <Text className="mt-4 mb-2.5 text-[9px] font-bold uppercase tracking-widest" style={{ color: meta.colorText }}>
        {t('plan.timing.whatMattersNow')}
      </Text>
      <View className="gap-2">
        {meta.focus.map((f) => (
          <View key={f} className="flex-row items-start gap-2.5">
            <View className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full" style={{ backgroundColor: meta.colorText }} />
            <Text className="flex-1 text-[12.5px] font-semibold leading-tight text-rove-charcoal">{f}</Text>
          </View>
        ))}
      </View>

      {meta.gated ? (
        <View className="mt-4 rounded-2xl bg-white/60 p-3.5 border border-white/60">
          <Text className="mb-1 text-[9.5px] font-extrabold uppercase tracking-wide text-rove-stone">
            {t('plan.timing.paused')}
          </Text>
          <Text className="text-xs font-medium leading-relaxed text-rove-charcoal">
            {t('plan.timing.pausedBody', { reason: meta.gateReason })}
          </Text>
        </View>
      ) : (
        <TtcWeekStrip stateKey={stateKey} signal={signal} />
      )}

      {hasPcos ? (
        <View className="mt-4 rounded-2xl bg-white/60 p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="info" size={13} color={meta.colorText} />
            <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: meta.colorText }}>
              {t('plan.move.withPcos')}
            </Text>
          </View>
          <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{TTC_GUIDANCE.pcosNote}</Text>
        </View>
      ) : null}

      <View className="mt-4">
        <Label text={TTC_GUIDANCE.clinical.title} />
        {TTC_GUIDANCE.clinical.points.map((p) => (
          <Bullet key={p} text={p} />
        ))}
      </View>

      <Text className="mt-4 text-[11px] leading-[17px] text-rove-stone">{TTC_GUIDANCE.disclaimer}</Text>
    </Card>
  );
}
