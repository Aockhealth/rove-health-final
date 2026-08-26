import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { TTC_GUIDANCE, type TtcSession } from '@shared/content/ttc-guidance';
import type { OvulationSignal } from '@shared/cycle/ttc';
import { deriveTtcState, getTtcStateMetaByKey } from '../../lib/ttcEngine';
import { getLocalizedFontFamily, getLocalizedTracking } from '../../lib/fonts';
import { Card, Bullet, ACCENT } from './ttcCardKit';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/Dialog';

function sessionEmoji(title: string) {
  const t = title.toLowerCase();
  if (t.includes('yoga') || t.includes('pranayama')) return '🧘';
  if (t.includes('walk')) return '🚶';
  if (t.includes('strength')) return '🏋️';
  return '😌';
}

/**
 * TTC mode's Move tab. Same shape as cycle-sync's Move tab — a tappable
 * 2-column session grid where cycle-sync has "Best For This Phase", then the
 * AI Rove Coach card (added in plan/index.tsx) — just fed the weekly TTC
 * session list instead of phase-based exercise picks, since TTC's movement
 * guidance is steady week-to-week rather than tied to today's phase. The one
 * state-driven line is the intro sentence, sourced from `ttcEngine.ts` so it
 * stays consistent with what Home/Plan's Guide tab say about this cycle.
 */
export function TtcMoveSection({ hasPcos, signal }: { hasPcos: boolean; signal: OvulationSignal | null }) {
  const { t, i18n } = useTranslation();
  const g = TTC_GUIDANCE;
  const moveIntro = signal ? getTtcStateMetaByKey(deriveTtcState(signal), t).moveIntro : t('plan.move.defaultIntro');
  const [expanded, setExpanded] = useState<TtcSession | null>(null);

  return (
    <View className="mb-2">
      <Text className="mb-4 px-1 text-[12px] leading-[18px] text-rove-stone">{moveIntro}</Text>

      <View className="flex-row items-center mb-4 px-1">
        <View className="w-6 h-0.5 rounded-full mr-2" style={{ backgroundColor: ACCENT }} />
        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-charcoal/80">{t('plan.moveSection.thisWeeksSessions')}</Text>
      </View>

      <View className="flex-row flex-wrap mb-8" style={{ marginHorizontal: -5 }}>
        {g.sessions.map((s) => (
          <View key={s.title} className="w-[50%] px-[5px] mb-[10px]">
            <Pressable
              onPress={() => setExpanded(s)}
              className="rounded-[22px] overflow-hidden relative border border-white/40"
              style={{ aspectRatio: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: Platform.OS === 'ios' ? 3 : 0 }}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
              )}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: `${ACCENT}12` }]} />
              <LinearGradient
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View className="flex-1 p-4 justify-between">
                <View className="flex-row items-start justify-between">
                  <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>{t('plan.moveSection.thisWeekBadge')}</Text>
                  <Text className="text-2xl opacity-80">{sessionEmoji(s.title)}</Text>
                </View>
                <View>
                  <Text className="text-[16px] text-rove-charcoal leading-tight mb-2" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{s.title}</Text>
                  <View className="flex-row items-center">
                    <View className="px-2 py-1 rounded-md bg-white/50 border border-white/80 flex-row items-center" style={{ shadowColor: ACCENT, shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                      <Feather name="clock" size={9} color={ACCENT} style={{ marginRight: 4 }} />
                      <Text className="text-[9px] font-bold tracking-wider" style={{ color: ACCENT }}>{s.length}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      <Card icon="help-circle" title={t('plan.move.howHard')} delay={100}>
        {g.moveNotes.map((n) => (
          <Bullet key={n} text={n} />
        ))}

        {hasPcos ? (
          <View className="mt-4 rounded-2xl bg-white/60 p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Feather name="info" size={13} color={ACCENT} />
              <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                {t('plan.move.withPcos')}
              </Text>
            </View>
            <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{g.movePcosNote}</Text>
          </View>
        ) : null}

        <Text className="mt-4 text-[11px] leading-[17px] text-rove-stone">
          {t('plan.move.disclaimer')}
        </Text>
      </Card>

      <Dialog open={expanded !== null} onOpenChange={(o) => !o && setExpanded(null)}>
        <DialogContent>
          {expanded ? (
            <View className="py-2">
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${ACCENT}15` }}>
                  <Text className="text-4xl opacity-90">{sessionEmoji(expanded.title)}</Text>
                </View>
                <DialogTitle className="text-center text-2xl">{expanded.title}</DialogTitle>
                <View className="flex-row items-center gap-2 mt-3">
                  <View className="px-3 py-1 rounded-full flex-row items-center" style={{ backgroundColor: `${ACCENT}15` }}>
                    <Feather name="clock" size={10} color={ACCENT} style={{ marginRight: 4 }} />
                    <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>{expanded.length}</Text>
                  </View>
                </View>
              </View>
              <View className="bg-white/50 rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-[10px] font-bold uppercase text-rove-stone mb-2" style={{ letterSpacing: getLocalizedTracking(2, i18n.language) }}>{t('plan.moveSection.whyItsHere')}</Text>
                <DialogDescription className="text-rove-charcoal/80 leading-5">{expanded.desc}</DialogDescription>
              </View>
            </View>
          ) : null}
        </DialogContent>
      </Dialog>
    </View>
  );
}
