import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, TextInput, ActivityIndicator, Alert, StyleSheet , Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, withSpring, withTiming, withDelay, Easing, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { fetchPlanPageDataFast, savePlanSettings } from '../../../lib/plan';
import { writeWeightLog } from '../../../lib/weightLog';
import { phaseThemes } from '../../../data/home-content';
import { getLocalizedFontFamily, getLocalizedTracking } from '../../../lib/fonts';
import { useFocusEffect, Link } from 'expo-router';
import { WorkoutHistory } from '../../../components/plan/WorkoutHistory';
import { ExerciseOrb } from '../../../components/plan/ExerciseOrb';
import { ExerciseBuilder } from '../../../components/plan/ExerciseBuilder';
import { GuidedSessionPlayer } from '../../../components/plan/GuidedSessionPlayer';
import { getPhaseData } from '@shared/content/phase-data';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { RoveChef } from '../../../components/plan/RoveChef';
import { MacroFuelGauge } from '../../../components/plan/MacroFuelGauge';
import { NutritionTrackerCard } from '../../../components/plan/NutritionTrackerCard';
import { ActiveDaysDots } from '../../../components/plan/ActiveDaysDots';
import { SymptomDecoder } from '../../../components/plan/SymptomDecoder';
import { DietCheatSheet } from '../../../components/plan/DietCheatSheet';
import { ActivitiesWidget } from '../../../components/plan/ActivitiesWidget';
import { SectionHeader } from '../../../components/plan/SectionHeader';
import { FocusForYou } from '../../../components/plan/FocusForYou';
import { TtcGuidanceSection } from '../../../components/plan/TtcGuidanceSection';
import { TtcNourishSection } from '../../../components/plan/TtcNourishSection';
import { TtcMoveSection } from '../../../components/plan/TtcMoveSection';
import { deriveTtcState, getTtcStateMetaByKey } from '../../../lib/ttcEngine';
import { ACCENT } from '../../../components/plan/ttcCardKit';
import { TTC_GUIDANCE } from '@shared/content/ttc-guidance';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { RiverTrack, iconMap, type RiverItem } from '../../../components/home/RiverTrack';
import { Circle as CircleIcon } from 'lucide-react-native';
import ProfileAvatar from '../../../components/home/ProfileAvatar';
import { DIET_RECOMMENDATIONS } from '../../../data/diet-recommendations';

// Standard safe weight-loss pace guidance (CDC/NHS): losing faster than this
// isn't offered as a selectable outcome — the wizard clamps to it instead.
const MIN_SAFE_WEEKLY_RATE_KG = 0.5;
const MAX_SAFE_WEEKLY_RATE_KG = 1.0;
const AVG_WEEKS_PER_MONTH = 4.345;
const GOAL_MONTH_OPTIONS = [1, 2, 3, 6, 9, 12];

// Older records (e.g. written from a different entry point, like the profile
// page's "moderate" default) may not exactly match one of the three chip
// labels below — map anything unrecognized to the closest tier instead of
// leaving every chip unselected.
function normalizeActivityLevel(raw?: string | null): 'Sedentary' | 'Active' | 'Highly Active' {
  const v = (raw || '').toLowerCase();
  if (v.includes('sedentary') || v.includes('inactive') || v.includes('low')) return 'Sedentary';
  if (v.includes('high') || v.includes('very')) return 'Highly Active';
  return 'Active';
}

const PLAN_TAB_IDS = [
  { id: 'guide' as const, icon: 'compass' as const },
  { id: 'diet' as const, icon: 'coffee' as const },
  { id: 'exercise' as const, icon: 'activity' as const },
];

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const PLAN_TABS = PLAN_TAB_IDS.map((tb) => ({ ...tb, label: t(`plan.index.tabs.${tb.id}`) }));
  // Display labels for values persisted as plain English enums (activity
  // level, fitness goal, diet preference) — the underlying value saved to
  // the DB must stay in English; only what's shown on screen is localized.
  const ACTIVITY_LABELS: Record<string, string> = {
    Sedentary: t('plan.index.activityOptions.sedentary'),
    Active: t('plan.index.activityOptions.active'),
    'Highly Active': t('plan.index.activityOptions.highlyActive'),
  };
  const GOAL_LABELS: Record<string, string> = {
    weight_loss: t('plan.index.goalOptions.weightLoss'),
    maintenance: t('plan.index.goalOptions.maintenance'),
    muscle_gain: t('plan.index.goalOptions.muscleGain'),
  };
  const DIET_LABELS: Record<string, string> = {
    Veg: t('plan.index.dietOptions.veg'),
    'Non-Veg': t('plan.index.dietOptions.nonVeg'),
    Vegan: t('plan.index.dietOptions.vegan'),
    Jain: t('plan.index.dietOptions.jain'),
  };
  const monthsLabel = (m: number) => t('plan.index.monthsCount', { count: m });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [hasPlanSetup, setHasPlanSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Setup states
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('60');
  const [activity, setActivity] = useState('Active');
  const [fitnessGoal, setFitnessGoal] = useState('weight_loss');
  const [targetWeight, setTargetWeight] = useState('55');
  const [desiredMonths, setDesiredMonths] = useState(3);
  const [diet, setDiet] = useState('Veg');

  // Weight Goal widget — edit-in-place state, mirrors the web's
  // isEditingGoal/tempGoalData/handleSaveGoal in cycle-sync/plan/page.tsx.
  // Without this there was no way to log a new current weight once the
  // one-time setup wizard above was done.
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  // The pencil used to always open the full setup form — height, activity,
  // diet, fitness goal, pace — even for someone who already finished setup
  // and just wants to log today's weight. Once a goal exists, the pencil now
  // opens a plain weight stepper by default; this flag is how she reaches the
  // full form on purpose, from a link inside that stepper.
  const [isEditingFullPlan, setIsEditingFullPlan] = useState(false);
  const [isSavingQuickWeight, setIsSavingQuickWeight] = useState(false);
  const [tempGoalData, setTempGoalData] = useState({ current: 0, target: 0, start: 0 });
  // Everything else the one-time setup wizard collects, editable from the
  // same pencil icon instead of only the three weight numbers.
  const [tempHeight, setTempHeight] = useState('165');
  const [tempActivity, setTempActivity] = useState('Active');
  const [tempFitnessGoal, setTempFitnessGoal] = useState('weight_loss');
  const [tempDiet, setTempDiet] = useState('Veg');
  const [tempDesiredMonths, setTempDesiredMonths] = useState(3);

  useEffect(() => {
    if (data?.weightGoal) {
      setTempGoalData({
        current: parseFloat(data.weightGoal.currentWeight) || 0,
        target: parseFloat(data.weightGoal.targetWeight) || 0,
        start: parseFloat(data.weightGoal.startWeight) || 0,
      });
    } else if (data?.lifestyle?.weight_kg) {
      // No goal row yet (see the weight card's hasGoal note) — seed the editor
      // from her known current weight so the "Set Your Goal" form opens on real
      // numbers instead of 0/0/0, which would make every +/- tap a chore and
      // would compute a nonsense pace.
      const known = parseFloat(data.lifestyle.weight_kg) || 0;
      setTempGoalData({ current: known, target: known, start: known });
    }
    if (data?.lifestyle) {
      setTempHeight(String(data.lifestyle.height_cm || '165'));
      setTempActivity(normalizeActivityLevel(data.lifestyle.activity_level));
      setTempDiet(data.lifestyle.diet_preference || 'Veg');
      setTempFitnessGoal(data.lifestyle.fitness_goal || 'weight_loss');
    }
  }, [data?.weightGoal, data?.lifestyle]);

  // Whether a weight goal already exists decides which weight fields the form
  // offers at all (see the editor below): setting a goal for the first time
  // asks for Start and Goal, since "now" and "start" are the same number that
  // day and asking for both invites contradicting answers. Afterwards Start is
  // history and Goal is the target, so the number she comes back to change is
  // her current weight.
  const hasGoal = !!data?.weightGoal;
  // Before a goal exists, "now" IS the start weight — the pace maths below has
  // to read it from there, or the first save computes a rate from an untouched
  // 0 and lands on a nonsense timeline.
  const effectiveCurrentWeight = hasGoal ? tempGoalData.current : tempGoalData.start;

  // Same safe-pace derivation as the setup wizard (see MAX_SAFE_WEEKLY_RATE_KG
  // above) — kept in sync here since this edit form now also sets the pace.
  const editTotalToLoseKg = Math.abs(effectiveCurrentWeight - tempGoalData.target);
  const editWeeksAvailable = tempDesiredMonths * AVG_WEEKS_PER_MONTH;
  const editRawWeeklyRateKg = editWeeksAvailable > 0 ? editTotalToLoseKg / editWeeksAvailable : 0;
  const editSafeWeeklyRateKg = Math.min(Math.max(editRawWeeklyRateKg, 0), MAX_SAFE_WEEKLY_RATE_KG);
  const editPaceTooFast = editRawWeeklyRateKg > MAX_SAFE_WEEKLY_RATE_KG;
  const editPaceIsGentle = editRawWeeklyRateKg > 0 && editRawWeeklyRateKg < MIN_SAFE_WEEKLY_RATE_KG;
  const editSafeMonthsNeeded = editTotalToLoseKg > 0 ? (editTotalToLoseKg / MAX_SAFE_WEEKLY_RATE_KG) / AVG_WEEKS_PER_MONTH : 0;

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    try {
      await savePlanSettings({
        height_cm: parseFloat(tempHeight),
        weight_kg: effectiveCurrentWeight,
        activity_level: tempActivity,
        diet_preference: tempDiet,
        fitness_goal: tempFitnessGoal,
        target_weight_kg: tempGoalData.target,
        weekly_rate_kg: editSafeWeeklyRateKg,
      });
      setIsEditingGoal(false);
      setIsEditingFullPlan(false);
      await loadData(true);
    } catch (e) {
      // Surface the underlying DB error, not just a generic string: these
      // writes fail for schema/RLS reasons (a missing column, a missing UPDATE
      // policy) that are indistinguishable from the outside otherwise, and
      // savePlanSettings used to swallow them entirely.
      const detail = e instanceof Error ? e.message : String(e);
      console.error('[plan] savePlanSettings (goal edit) failed:', detail);
      Alert.alert(t('plan.index.errorTitle'), `${t('plan.index.errorUpdatePlan')}\n\n${detail}`);
    }
    setIsSavingGoal(false);
  };

  // The default action once a goal exists: just her weight today, nothing
  // else touched. writeWeightLog only writes weight_logs/user_lifestyle/
  // user_weight_goals.current_weight_kg — height, activity, diet, target and
  // pace all stay exactly as they were, unlike handleSaveGoal above which
  // resends every field from form state on every save.
  const handleQuickLogWeight = async () => {
    setIsSavingQuickWeight(true);
    const res = await writeWeightLog(tempGoalData.current);
    setIsSavingQuickWeight(false);
    if (res.success) {
      setIsEditingGoal(false);
      await loadData(true);
    } else {
      Alert.alert(t('plan.index.errorTitle'), res.error || t('plan.index.errorUpdatePlan'));
    }
  };

  const [activeTab, setActiveTab] = useState<'guide' | 'diet' | 'exercise'>('guide');
  const [exerciseView, setExerciseView] = useState<'coach' | 'history'>('coach');
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null);
  // Detail popup for a tapped food card in the "Eat More"/"Power Foods" river
  // tracks — RiverCard only renders the chevron/press state when both
  // onCardClick is passed AND the item has a `detail` string (see
  // RiverTrack.tsx's `clickable`), which is why these cards silently didn't
  // respond to taps before this was wired up.
  const [expandedFoodItem, setExpandedFoodItem] = useState<RiverItem | null>(null);
  // Bumped whenever the orb's floating Rove Coach button is pressed, so
  // ExerciseBuilder can jump straight into its fullscreen builder instead of
  // just scrolling to the (about to be covered) card.
  const [coachOpenSignal, setCoachOpenSignal] = useState(0);
  const [guidedSessionOpen, setGuidedSessionOpen] = useState(false);

  // Lets the "Rove Chef"/"Rove Coach" floating buttons actually scroll to
  // their sections instead of doing nothing — each target's Y offset is
  // captured via onLayout since content is conditionally rendered per tab.
  const scrollRef = useRef<any>(null);
  const [chefSectionY, setChefSectionY] = useState(0);

  // Animated sliding indicator for the Guide/Nourish/Move tab bar
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabIndicatorPos = useSharedValue(0);
  const tabScale = useSharedValue(1);

  const handleTabPress = useCallback((tabId: 'guide' | 'diet' | 'exercise') => {
    if (tabId === activeTab) return;
    const idx = PLAN_TABS.findIndex((t) => t.id === tabId);
    // Smooth sliding pill with a satisfying spring
    tabIndicatorPos.value = withSpring(idx, { damping: 18, stiffness: 160, mass: 0.8 });
    // Quick scale bounce on the pill for a tactile feel
    tabScale.value = withSpring(0.92, { damping: 12, stiffness: 400 }, () => {
      tabScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    });
    setActiveTab(tabId);
  }, [activeTab]);

  // Parallax for the Daily Fuel ring — drifts slower than the scroll, same
  // treatment as the phase orb on Home
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const tabIndicatorStyle = useAnimatedStyle(() => {
    const slotWidth = tabBarWidth / 3;
    return {
      width: slotWidth,
      transform: [
        { translateX: tabIndicatorPos.value * slotWidth },
        { scaleX: tabScale.value },
        { scaleY: tabScale.value },
      ],
    };
  });

  const loadData = async (isMounted: boolean) => {
    if (isMounted) setLoading(true);
    try {
      const fetched = await fetchPlanPageDataFast();
      if (fetched && isMounted) {
        setData(fetched);
        if (fetched.lifestyle) {
          setHasPlanSetup(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
    if (isMounted) setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      loadData(isMounted);
      return () => {
        isMounted = false;
      };
    }, [])
  );

  // Derives a safe weekly pace from "how much" (target vs. current weight) and
  // "by when" (desiredMonths), instead of letting someone type in any rate —
  // capped at the standard 0.5-1 kg/week safe range so the wizard can never
  // save/display an unsafe goal.
  const totalToLoseKg = Math.abs((parseFloat(weight) || 0) - (parseFloat(targetWeight) || 0));
  const weeksAvailable = desiredMonths * AVG_WEEKS_PER_MONTH;
  const rawWeeklyRateKg = weeksAvailable > 0 ? totalToLoseKg / weeksAvailable : 0;
  const safeWeeklyRateKg = Math.min(Math.max(rawWeeklyRateKg, 0), MAX_SAFE_WEEKLY_RATE_KG);
  const paceTooFast = rawWeeklyRateKg > MAX_SAFE_WEEKLY_RATE_KG;
  const paceIsGentle = rawWeeklyRateKg > 0 && rawWeeklyRateKg < MIN_SAFE_WEEKLY_RATE_KG;
  const safeMonthsNeeded = totalToLoseKg > 0 ? (totalToLoseKg / MAX_SAFE_WEEKLY_RATE_KG) / AVG_WEEKS_PER_MONTH : 0;

  const handleSaveSetup = async () => {
    setIsSaving(true);
    try {
      await savePlanSettings({
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        activity_level: activity,
        diet_preference: diet,
        fitness_goal: fitnessGoal,
        target_weight_kg: parseFloat(targetWeight),
        weekly_rate_kg: safeWeeklyRateKg
      });
      await loadData(true);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      console.error('[plan] savePlanSettings (setup wizard) failed:', detail);
      Alert.alert(t('plan.index.errorTitle'), `${t('plan.index.errorSavePlan')}\n\n${detail}`);
    }
    setIsSaving(false);
  };

  if (loading && !data) {
    return <LoadingScreen />;
  }

  const phaseName = data?.phase || 'Menstrual';
  const theme = phaseThemes[phaseName as keyof typeof phaseThemes] || phaseThemes['Menstrual'];

  // TTC users see cycle-phase language ("Follicular") nowhere else on this
  // screen — the Guide/Nourish/Move tabs all speak in fertility-signal terms
  // (see TtcGuidanceSection etc.), so the header has to match or it reads as
  // if the mode switch didn't take. Colors/theme stay phase-based on purpose
  // (see TtcGuidanceSection's own comment on this) — only the header label
  // swaps to the TTC state name.
  const ttcStateKey = data?.trackerMode === 'ttc' ? (data?.ovulation ? deriveTtcState(data.ovulation) : 'insufficient') : null;
  const headerTitle = ttcStateKey ? getTtcStateMetaByKey(ttcStateKey, t).orbTitle : phaseName;

  // Setup Wizard
  if (!hasPlanSetup) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF9F6]">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <Text className="text-3xl text-rove-charcoal mb-2 mt-4" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
            {t('plan.index.buildYourPlan')}
          </Text>
          <Text className="text-sm text-rove-stone mb-8">
            {t('plan.index.stepOf5', { step: setupStep })}
          </Text>

          {setupStep === 1 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">{t('plan.index.biometricsQuestion')}</Text>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">{t('plan.index.heightCm')}</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">{t('plan.index.weightKg')}</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
            </View>
          )}

          {setupStep === 2 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">{t('plan.index.activityQuestion')}</Text>
              {['Sedentary', 'Active', 'Highly Active'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setActivity(opt)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${activity === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${activity === opt ? 'text-white' : 'text-rove-charcoal'}`}>{ACTIVITY_LABELS[opt]}</Text>
                  {activity === opt && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {setupStep === 3 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">{t('plan.index.primaryGoalQuestion')}</Text>
              {[{ id: 'weight_loss' }, { id: 'maintenance' }, { id: 'muscle_gain' }].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setFitnessGoal(opt.id)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${fitnessGoal === opt.id ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${fitnessGoal === opt.id ? 'text-white' : 'text-rove-charcoal'}`}>{GOAL_LABELS[opt.id]}</Text>
                  {fitnessGoal === opt.id && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {setupStep === 4 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">{t('plan.index.targetWeightPace')}</Text>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">{t('plan.index.targetWeightKg')}</Text>
                <TextInput
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
              {totalToLoseKg > 0 && (
                <View className="mb-4">
                  <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">{t('plan.index.desiredMonth')}</Text>
                  <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                    {GOAL_MONTH_OPTIONS.map((m) => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setDesiredMonths(m)}
                        className={`px-4 py-2.5 rounded-xl border mb-2 mx-1 ${desiredMonths === m ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                      >
                        <Text className={`font-bold ${desiredMonths === m ? 'text-white' : 'text-rove-charcoal'}`}>{monthsLabel(m)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Safety feedback — 0.5-1 kg/week is the standard safe weight-loss
                      range; anything faster gets clamped and the person is told the
                      realistic, safe timeline instead. */}
                  <View className={`mt-2 p-4 rounded-xl border ${paceTooFast ? 'bg-rove-red/5 border-rove-red/20' : 'bg-[#5B9A8B]/10 border-[#5B9A8B]/20'}`}>
                    {paceTooFast ? (
                      <Text className="text-rove-charcoal text-sm font-semibold leading-relaxed">
                        {t('plan.index.paceTooFast', {
                          totalKg: totalToLoseKg.toFixed(1),
                          months: monthsLabel(desiredMonths),
                          rate: rawWeeklyRateKg.toFixed(2),
                          cappedMonths: Math.ceil(safeMonthsNeeded),
                        })}
                      </Text>
                    ) : (
                      <Text className="text-rove-charcoal text-sm font-semibold leading-relaxed">
                        {t('plan.index.paceOk', { rate: safeWeeklyRateKg.toFixed(2) })}
                        {paceIsGentle ? t('plan.index.paceGentleSuffix') : t('plan.index.paceRangeSuffix')}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {setupStep === 5 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">{t('plan.index.dietaryPreference')}</Text>
              {['Veg', 'Non-Veg', 'Vegan', 'Jain'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setDiet(opt)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${diet === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${diet === opt ? 'text-white' : 'text-rove-charcoal'}`}>{DIET_LABELS[opt]}</Text>
                  {diet === opt && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="flex-row justify-between mt-8">
            {setupStep > 1 ? (
              <TouchableOpacity onPress={() => setSetupStep(s => s - 1)} className="py-4">
                <Text className="text-rove-stone font-bold">{t('common.buttons.back')}</Text>
              </TouchableOpacity>
            ) : <View />}

            {setupStep < 5 ? (
              <TouchableOpacity onPress={() => setSetupStep(s => s + 1)} className="bg-rove-charcoal px-8 py-4 rounded-2xl">
                <Text className="text-white font-bold">{t('plan.index.next')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSaveSetup} disabled={isSaving} className="bg-rove-charcoal px-8 py-4 rounded-2xl">
                {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">{t('plan.index.generatePlan')}</Text>}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const bp = data?.blueprint;

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9F6]">
      {/* Header — fixed outside scroll */}
      <View className="px-5 pb-2 pt-2 flex-row items-center justify-between">
        <TouchableOpacity className="p-2 -ml-2">
          <Feather name="chevron-left" size={24} color="#A8A29E" />
        </TouchableOpacity>
        
        <Link href={`/plan/${phaseName}`} asChild>
          <TouchableOpacity className="items-center">
            <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Regular', i18n.language), color: theme.textColor }}>{headerTitle}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mt-1">{t('plan.index.dayOfCycle', { day: data.day })}</Text>
          </TouchableOpacity>
        </Link>

        <ProfileAvatar />
      </View>

      {/* Tab Selector — fixed outside scroll */}
      <View className="px-5 pb-4 pt-2 items-center">
        <View
          onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width - 12)}
          className="flex-row p-[6px] bg-white rounded-full shadow-sm w-full border border-rove-stone/5"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: Platform.OS === 'ios' ? 2 : 0 }}
        >
          {tabBarWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                { position: 'absolute', top: 6, bottom: 6, left: 6, borderRadius: 9999, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: Platform.OS === 'ios' ? 5 : 0, overflow: 'hidden' },
                tabIndicatorStyle,
              ]}
            >
              <LinearGradient
                colors={[theme.color, theme.color + 'E6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          )}

          {PLAN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                hitSlop={12}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 9999 }}
              >
                <Feather name={tab.icon} size={14} color={isActive ? 'white' : '#A8A29E'} />
                <Text className={`text-[10px] font-bold uppercase tracking-widest ml-2 ${isActive ? 'text-white' : 'text-rove-stone'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Scrollable Tab Content */}
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 120 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Tabs Content */}
        {activeTab === 'guide' && (
          <View>
            {/* TTC users see conception-prep content before anything tied to
                today's cycle phase — this tab should read as "getting ready
                for a baby", not "syncing with today's hormones". */}
            {data?.trackerMode === 'ttc' && (
              <TtcGuidanceSection hasPcos={!!data?.hasPcos} signal={data?.ovulation ?? null} />
            )}

            {/* Focus Banner — "today's phase focus" framing, which is exactly
                the cycle-sync framing TTC mode replaces above. Hidden only
                for TTC; unaffected for every other tracker mode. */}
            {data?.trackerMode !== 'ttc' && (
              <Animated.View entering={FadeInUp.duration(500)} className="mb-8 rounded-[28px]" style={{ shadowColor: theme.color, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: Platform.OS === 'ios' ? 6 : 0 }}>
                <LinearGradient
                  colors={[theme.color + 'E6', theme.color]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 28, padding: 24, overflow: 'hidden' }}
                >
                  {/* Decorative blur orb */}
                  <View style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <View className="z-10 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white/70 uppercase tracking-widest text-[10px] font-bold mb-2">{t('plan.index.currentFocus')}</Text>
                      <Text className="text-white text-[28px] leading-tight" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{bp?.rituals?.focus}</Text>
                    </View>
                    <View className="w-12 h-12 rounded-full border border-white/20 items-center justify-center bg-white/10 ml-4">
                      <Feather name="compass" size={20} color="rgba(255,255,255,0.6)" />
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Weight Goal Widget */}
            {(data?.weightGoal || data?.lifestyle) && (() => {
              // A missing user_weight_goals row used to hide this entire card —
              // and with it the edit pencil, which is the ONLY route to
              // (re)entering a goal once the one-time setup wizard is behind you
              // (hasPlanSetup only checks user_lifestyle). So anyone whose goal
              // write failed — e.g. the silently-swallowed DB CHECK-constraint
              // rejection fixed in savePlanSettings (lib/plan.ts) — was left
              // with no weight card AND no way to ever create one. The card now
              // also renders in an empty "no goal yet" state whenever the plan
              // is set up, keeping the goal always reachable.
              const goalKey = data.weightGoal?.fitnessGoal ?? data.lifestyle?.fitness_goal ?? 'weight_loss';
              const startW = parseFloat(data.weightGoal?.startWeight) || 0;
              const currentW = parseFloat(data.weightGoal?.currentWeight) || 0;
              const targetW = parseFloat(data.weightGoal?.targetWeight) || 0;
              const totalDiff = Math.abs(startW - targetW);
              const currentDiff = Math.abs(startW - currentW);
              const progressPct = totalDiff === 0 ? 0 : Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100));
              const lostText = t('plan.index.kgLost', { value: Math.abs(startW - currentW).toFixed(1) });
              const togoText = t('plan.index.kgToGo', { value: Math.abs(currentW - targetW).toFixed(1) });
              
              return (
                <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-8 rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 0 }}>
                  {Platform.OS === 'ios' ? (
                    <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                  )}
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 0.7 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View className="p-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-[14px] items-center justify-center mr-3 border border-white/50" style={{ backgroundColor: `${theme.color}15` }}>
                          <Feather name="target" size={16} color={theme.color} />
                        </View>
                        <View>
                          <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.textColor }}>{t('plan.index.yourJourney')}</Text>
                          <Text className="text-rove-charcoal text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{t('plan.index.yourGoal')}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-2">
                        {!isEditingGoal && (
                          <TouchableOpacity
                            onPress={() => setIsEditingGoal(true)}
                            className="p-1.5 rounded-full"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather name="edit-2" size={14} color="#A8A29E" />
                          </TouchableOpacity>
                        )}
                        <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.color }}>
                          <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                            {GOAL_LABELS[goalKey] ?? goalKey?.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isEditingGoal && hasGoal && !isEditingFullPlan ? (
                      /* The default view once a goal exists: her weight
                         today, nothing else. The full form below (height,
                         activity, diet, fitness goal, pace) is real
                         information she can't always usefully see or change
                         in the moment she's just stepping on a scale — it's
                         one tap away via the link, not the first thing shown. */
                      <Animated.View entering={FadeInUp.duration(300)}>
                        <View className="flex-row items-center justify-between p-3 rounded-2xl border border-white/40 bg-white/60 mb-3">
                          <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{t('plan.index.nowLabel')}</Text>
                          <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                              onPress={() => setTempGoalData((p) => ({ ...p, current: Math.max(0, p.current - 0.5) }))}
                              className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                            >
                              <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>−</Text>
                            </TouchableOpacity>
                            <View style={{ minWidth: 56 }}>
                              <Text className="text-xl text-center text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                                {tempGoalData.current}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => setTempGoalData((p) => ({ ...p, current: p.current + 0.5 }))}
                              className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                            >
                              <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => setIsEditingFullPlan(true)} className="mb-4 self-start">
                          <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textColor }}>
                            {t('plan.index.editFullPlanSettings')} →
                          </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-end gap-3">
                          <TouchableOpacity onPress={() => setIsEditingGoal(false)} className="px-3 py-2">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{t('common.buttons.cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleQuickLogWeight}
                            disabled={isSavingQuickWeight}
                            className="px-5 py-2 rounded-full"
                            style={{ backgroundColor: theme.color, opacity: isSavingQuickWeight ? 0.6 : 1 }}
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-white">
                              {isSavingQuickWeight ? '...' : t('common.buttons.save')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    ) : isEditingGoal && (!hasGoal || isEditingFullPlan) ? (
                      <Animated.View entering={FadeInUp.duration(300)}>
                        {/* Setting a goal for the first time asks only for
                            Start and Goal — on day one "now" and "start" are
                            the same weight, and asking for both lets her enter
                            two different numbers for one fact. Once the goal
                            exists, Start is history and Goal is the target, so
                            the field she returns to change is her weight today;
                            the other two stay visible as context. */}
                        {(hasGoal
                          ? [
                              { label: t('plan.index.startLabel'), key: 'start' as const, editable: false },
                              { label: t('plan.index.nowLabel'), key: 'current' as const, editable: true },
                              { label: t('plan.index.goalLabel'), key: 'target' as const, editable: false },
                            ]
                          : [
                              { label: t('plan.index.startLabel'), key: 'start' as const, editable: true },
                              { label: t('plan.index.goalLabel'), key: 'target' as const, editable: true },
                            ]
                        ).map(({ label, key, editable }) => (
                          <View
                            key={key}
                            className="flex-row items-center justify-between p-3 rounded-2xl border border-white/40 bg-white/60 mb-3"
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{label}</Text>
                            {editable ? (
                              <View className="flex-row items-center gap-3">
                                <TouchableOpacity
                                  onPress={() => setTempGoalData((p) => ({ ...p, [key]: Math.max(0, p[key] - 0.5) }))}
                                  className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                                >
                                  <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>−</Text>
                                </TouchableOpacity>
                                <View style={{ minWidth: 56 }}>
                                  <Text className="text-xl text-center text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                                    {tempGoalData[key]}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => setTempGoalData((p) => ({ ...p, [key]: p[key] + 0.5 }))}
                                  className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                                >
                                  <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>+</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={{ minWidth: 56 }}>
                                <Text
                                  className="text-xl text-center text-rove-stone"
                                  style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}
                                >
                                  {tempGoalData[key]}
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}

                        {/* Height */}
                        <View className="flex-row items-center justify-between p-3 rounded-2xl border border-white/40 bg-white/60 mb-3">
                          <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{t('plan.index.heightCm')}</Text>
                          <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                              onPress={() => setTempHeight((h) => String(Math.max(100, (parseFloat(h) || 0) - 1)))}
                              className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                            >
                              <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>−</Text>
                            </TouchableOpacity>
                            <View style={{ minWidth: 56 }}>
                              <Text className="text-xl text-center text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                                {tempHeight}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => setTempHeight((h) => String((parseFloat(h) || 0) + 1))}
                              className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                            >
                              <Text className="text-rove-stone text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Activity Level */}
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">{t('plan.index.activityLevel')}</Text>
                        <View className="flex-row flex-wrap mb-3" style={{ marginHorizontal: -4 }}>
                          {['Sedentary', 'Active', 'Highly Active'].map((opt) => (
                            <TouchableOpacity
                              key={opt}
                              onPress={() => setTempActivity(opt)}
                              className={`px-4 py-2.5 rounded-xl border mb-2 mx-1 ${tempActivity === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                            >
                              <Text className={`font-bold text-xs ${tempActivity === opt ? 'text-white' : 'text-rove-charcoal'}`}>{ACTIVITY_LABELS[opt]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Fitness Goal */}
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">{t('plan.index.primaryGoal')}</Text>
                        <View className="flex-row flex-wrap mb-3" style={{ marginHorizontal: -4 }}>
                          {[{ id: 'weight_loss' }, { id: 'maintenance' }, { id: 'muscle_gain' }].map((opt) => (
                            <TouchableOpacity
                              key={opt.id}
                              onPress={() => setTempFitnessGoal(opt.id)}
                              className={`px-4 py-2.5 rounded-xl border mb-2 mx-1 ${tempFitnessGoal === opt.id ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                            >
                              <Text className={`font-bold text-xs ${tempFitnessGoal === opt.id ? 'text-white' : 'text-rove-charcoal'}`}>{GOAL_LABELS[opt.id]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Desired Month / safe pace — same 0.5-1kg/week clamp as the setup wizard */}
                        {editTotalToLoseKg > 0 && (
                          <View className="mb-3">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">{t('plan.index.desiredMonth')}</Text>
                            <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                              {GOAL_MONTH_OPTIONS.map((m) => (
                                <TouchableOpacity
                                  key={m}
                                  onPress={() => setTempDesiredMonths(m)}
                                  className={`px-4 py-2.5 rounded-xl border mb-2 mx-1 ${tempDesiredMonths === m ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                                >
                                  <Text className={`font-bold text-xs ${tempDesiredMonths === m ? 'text-white' : 'text-rove-charcoal'}`}>{monthsLabel(m)}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            <View className={`mt-2 p-3 rounded-xl border ${editPaceTooFast ? 'bg-rove-red/5 border-rove-red/20' : 'bg-[#5B9A8B]/10 border-[#5B9A8B]/20'}`}>
                              {editPaceTooFast ? (
                                <Text className="text-rove-charcoal text-xs font-semibold leading-relaxed">
                                  {t('plan.index.editPaceTooFast', { rate: editRawWeeklyRateKg.toFixed(2), cappedMonths: Math.ceil(editSafeMonthsNeeded) })}
                                </Text>
                              ) : (
                                <Text className="text-rove-charcoal text-xs font-semibold leading-relaxed">
                                  {t('plan.index.editPaceOk', { rate: editSafeWeeklyRateKg.toFixed(2) })}
                                  {editPaceIsGentle ? t('plan.index.paceGentleSuffix') : t('plan.index.paceRangeSuffix')}
                                </Text>
                              )}
                            </View>
                          </View>
                        )}

                        {/* Dietary Preference */}
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mb-2">{t('plan.index.dietaryPreference')}</Text>
                        <View className="flex-row flex-wrap mb-1" style={{ marginHorizontal: -4 }}>
                          {['Veg', 'Non-Veg', 'Vegan', 'Jain'].map((opt) => (
                            <TouchableOpacity
                              key={opt}
                              onPress={() => setTempDiet(opt)}
                              className={`px-4 py-2.5 rounded-xl border mb-2 mx-1 ${tempDiet === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                            >
                              <Text className={`font-bold text-xs ${tempDiet === opt ? 'text-white' : 'text-rove-charcoal'}`}>{DIET_LABELS[opt]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <View className="flex-row justify-end gap-3 mt-2">
                          <TouchableOpacity
                            onPress={() => (isEditingFullPlan ? setIsEditingFullPlan(false) : setIsEditingGoal(false))}
                            className="px-3 py-2"
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{t('common.buttons.cancel')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSaveGoal}
                            disabled={isSavingGoal}
                            className="px-5 py-2 rounded-full"
                            style={{ backgroundColor: theme.color, opacity: isSavingGoal ? 0.6 : 1 }}
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-white">
                              {isSavingGoal ? '...' : t('common.buttons.save')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    ) : !hasGoal ? (
                      /* No goal row yet — the empty state that keeps the goal
                         reachable instead of hiding the whole card. */
                      <View className="items-center py-2">
                        <Text className="text-center text-[13px] leading-5 text-rove-stone mb-4">
                          {t('plan.index.noGoalBody')}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIsEditingGoal(true);
                          }}
                          className="px-6 py-3 rounded-full"
                          style={{ backgroundColor: theme.color }}
                        >
                          <Text className="text-[10px] font-bold uppercase tracking-widest text-white">
                            {t('plan.index.noGoalCta')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        {/* Weight Dashboard */}
                        <View className="flex-row items-center justify-between mb-6 p-4 rounded-[20px] border border-white/40 bg-white/30">
                          <View className="items-center flex-1">
                            <Text className="text-lg text-rove-charcoal/70" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{startW}<Text className="text-xs text-rove-stone">kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest text-rove-stone mt-0.5">{t('plan.index.startLabel')}</Text>
                          </View>
                          <Text className="text-rove-stone/30 text-lg mx-1">→</Text>
                          <View className="items-center flex-1 px-4 py-2 rounded-[14px]" style={{ backgroundColor: `${theme.color}15` }}>
                            <Text className="text-xl" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language), color: theme.textColor }}>{currentW}<Text className="text-xs" style={{ opacity: 0.6 }}>kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: theme.textColor, opacity: 0.7 }}>{t('plan.index.nowLabel')}</Text>
                          </View>
                          <Text className="text-rove-stone/30 text-lg mx-1">→</Text>
                          <View className="items-center flex-1">
                            <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{targetW}<Text className="text-xs text-rove-stone">kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest text-rove-stone mt-0.5">{t('plan.index.goalLabel')}</Text>
                          </View>
                        </View>

                        {/* Progress Bar */}
                        <View className="w-full h-2 rounded-full bg-white/40 overflow-hidden mb-2">
                          <View className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: theme.color }} />
                        </View>
                        <Text className="text-center text-[11px] text-rove-stone font-medium">
                          {lostText} • {togoText}
                        </Text>
                      </>
                    )}
                  </View>
                </Animated.View>
              );
            })()}

            {/* The Science / ActivitiesWidget — menstrual-phase hormone
                education and phase-ritual self-care, both cycle-sync framing
                that TTC mode's three cards above replace. Hidden only for
                TTC; every other tracker mode is untouched. */}
            {data?.trackerMode !== 'ttc' && (
            <>
            <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-10">
              <SectionHeader icon="book-open" title={t('plan.index.theScience')} color={theme.color} />

              <View className="rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 0 }}>
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                )}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.7, y: 0.7 }}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Phase-colored header strip */}
                <LinearGradient
                  colors={[theme.color + 'CC', theme.color + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                      <Feather name="zap" size={14} color="white" />
                    </View>
                    <View>
                      <Text className="text-white/70 text-[9px] font-bold uppercase tracking-widest">{t('plan.index.yourBiology')}</Text>
                      <Text className="text-white text-lg" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{t('plan.index.hormonesNow')}</Text>
                    </View>
                  </View>
                  <View className="px-3 py-1 rounded-full bg-white/20">
                    <Text className="text-white text-[9px] font-bold uppercase tracking-widest">{phaseName}</Text>
                  </View>
                </LinearGradient>

                <View className="p-6">
                  {/* Summary */}
                  <Text className="text-rove-charcoal font-bold text-[15px] leading-6 mb-3">{bp?.hormones?.summary}</Text>
                  <Text className="text-rove-stone text-[13px] leading-[22px] mb-6 italic">
                    "{bp?.hormones?.desc}"
                  </Text>

                  {/* Symptom Label */}
                  <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.textColor }}>{t('plan.index.whatYouMayFeel')}</Text>

                  {/* Symptoms as individual cards */}
                  <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                    {bp?.hormones?.symptoms?.map((sym: string, i: number) => {
                      const symptomIcons: Record<string, string> = {
                        'fatigue': 'battery', 'energy': 'zap', 'bloating': 'cloud', 'cramps': 'alert-circle',
                        'mood': 'smile', 'focus': 'eye', 'sleep': 'moon', 'anxiety': 'wind',
                        'cravings': 'coffee', 'libido': 'heart', 'skin': 'sun', 'headache': 'alert-triangle',
                        'appetite': 'trending-up', 'motivation': 'star', 'confidence': 'award',
                      };
                      const iconKey = Object.keys(symptomIcons).find(k => sym.toLowerCase().includes(k));
                      const icon = iconKey ? symptomIcons[iconKey] : (['star', 'circle', 'disc', 'hexagon'][i % 4]);
                      
                      return (
                        <View key={sym} className="w-[48%] mb-3 mx-[1%]">
                          <View className="flex-row items-center p-3 rounded-[16px] bg-white/50 border border-white/60" style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                            <View className="w-8 h-8 rounded-xl items-center justify-center mr-2.5" style={{ backgroundColor: `${theme.color}12` }}>
                              <Feather name={icon as any} size={13} color={theme.color} />
                            </View>
                            <Text className="text-rove-charcoal text-[11px] font-bold flex-1" numberOfLines={2}>{sym}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* PCOS note — TTC mode gets this inside TtcTimingCard; cycle-sync
                users who've flagged PCOS in onboarding get the equivalent
                here, since it's just as relevant outside TTC mode. */}
            {!!data?.hasPcos && (
              <Animated.View entering={FadeInUp.delay(250).duration(500)} className="mb-8 rounded-2xl bg-white/60 p-4 border border-white/60">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="info" size={13} color={theme.color} />
                  <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>
                    {t('plan.index.pcosNoteTitle')}
                  </Text>
                </View>
                <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{t('plan.index.pcosNoteBody')}</Text>
              </Animated.View>
            )}

            <Animated.View entering={FadeInUp.delay(300).duration(500)} className="mb-16">
              <ActivitiesWidget practices={bp?.rituals?.practices || []} themeColor={theme.color} />
            </Animated.View>
            </>
            )}

            <FocusForYou
              goals={data?.onboarding?.goals || []}
              hasWeightGoal={!!data?.weightGoal}
              themeColor={theme.color}
            />
          </View>
        )}

        {activeTab === 'diet' && data?.trackerMode === 'ttc' && (
          <View>
            {/* Same sequence cycle-sync's Nourish tab uses (macro tracker →
                recommended-fuel carousel → [meal ideas replaces the
                symptom-decoder slot, since TTC has no per-symptom food map] →
                focus/avoid → AI chef), just fed TTC's guidance content. Only
                the visible copy is TTC-worded on the shared components; the
                real phase/theme stay underneath so colors and the AI's
                context still match the rest of the app. */}
            {bp?.nutrition_guide?.macro_fuel ? (
              <Animated.View entering={FadeInUp.delay(50).duration(500)}>
                <MacroFuelGauge
                  phase={phaseName}
                  data={bp?.nutrition_guide?.macro_fuel}
                  scrollY={scrollY}
                  onScrollToChef={() => scrollRef.current?.scrollTo({ y: chefSectionY, animated: true })}
                />
              </Animated.View>
            ) : null}
            {bp?.nutrition_guide?.macro_fuel ? (
              <Animated.View entering={FadeInUp.delay(75).duration(500)}>
                <NutritionTrackerCard
                  targets={{
                    calories: bp.nutrition_guide.macro_fuel.calories ?? 2000,
                    protein: bp.nutrition_guide.macro_fuel.protein,
                    carbs: bp.nutrition_guide.macro_fuel.carbs,
                    fats: bp.nutrition_guide.macro_fuel.fats,
                    // Computed from her own calorie target now, so it tightens
                    // on a weight-loss goal instead of always sitting at the
                    // card's flat WHO-10% fallback.
                    sugar: bp.nutrition_guide.macro_fuel.sugar,
                    earnedCalories: bp.nutrition_guide.macro_fuel.earnedCalories,
                  }}
                  theme={theme}
                />
              </Animated.View>
            ) : null}

            {(() => {
              const getFoodIcon = (label: string) => {
                const l = label.toLowerCase();
                if (l.includes('leafy') || l.includes('greens')) return 'Leaf';
                if (l.includes('lentil') || l.includes('dal')) return 'Bean';
                if (l.includes('grain') || l.includes('millet')) return 'Wheat';
                if (l.includes('nut') || l.includes('seed')) return 'Nut';
                if (l.includes('dairy') || l.includes('paneer') || l.includes('curd') || l.includes('milk')) return 'Milk';
                if (l.includes('fruit')) return 'Cherry';
                if (l.includes('fish') || l.includes('egg')) return 'Fish';
                return 'Leaf';
              };
              const splitFoodItem = (raw: string) => {
                const m = raw.match(/^([^,(—]+)[,(—]?\s*(.*)$/);
                const title = (m?.[1] || raw).replace(/\)$/, '').trim();
                const desc = (m?.[2] || '').replace(/\)$/, '').trim();
                return { title, desc };
              };
              const riverItems = TTC_GUIDANCE.emphasize.map((raw) => {
                const { title, desc } = splitFoodItem(raw);
                return { title, desc, detail: desc, icon: getFoodIcon(raw), bg: `${ACCENT}18`, color: ACCENT };
              });
              const half = Math.ceil(riverItems.length / 2);
              const row1 = riverItems.slice(0, half);
              const row2 = riverItems.slice(half);
              return (
                <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-10">
                  <SectionHeader icon="coffee" title={t('plan.index.recommendedFuel')} color={ACCENT} />
                  <View className="-mx-5">
                    <RiverTrack label={t('plan.index.eatMore')} items={row1} speed={40} direction="left" onCardClick={setExpandedFoodItem} />
                    <View className="mt-4">
                      <RiverTrack label={t('plan.index.alsoGood')} items={row2} speed={40} direction="right" onCardClick={setExpandedFoodItem} />
                    </View>
                  </View>
                </Animated.View>
              );
            })()}

            <TtcNourishSection />

            <Animated.View entering={FadeInUp.delay(250).duration(500)}>
              <DietCheatSheet
                phase={phaseName}
                data={{
                  focus: { title: t('plan.index.focusTitle'), items: TTC_GUIDANCE.emphasize },
                  avoid: { title: t('plan.index.avoidTitle'), items: TTC_GUIDANCE.limit },
                }}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(350).duration(500)}
              className="pb-16"
              onLayout={(e) => setChefSectionY(e.nativeEvent.layout.y)}
            >
              <RoveChef
                phase={phaseName}
                diet={data?.lifestyle?.diet_preference || "Veg"}
                fitnessGoal={data?.lifestyle?.fitness_goal}
                contextLabel={t('plan.index.fertilityNutrition')}
                contextNote={t('plan.index.chooseProtocolTtc')}
              />
            </Animated.View>
          </View>
        )}

        {activeTab === 'diet' && data?.trackerMode !== 'ttc' && (
          <View>
            <Animated.View entering={FadeInUp.delay(50).duration(500)}>
              <MacroFuelGauge
                phase={phaseName}
                data={bp?.nutrition_guide?.macro_fuel}
                scrollY={scrollY}
                onScrollToChef={() => scrollRef.current?.scrollTo({ y: chefSectionY, animated: true })}
              />
            </Animated.View>
            {bp?.nutrition_guide?.macro_fuel ? (
              <Animated.View entering={FadeInUp.delay(75).duration(500)}>
                <NutritionTrackerCard
                  targets={{
                    calories: bp.nutrition_guide.macro_fuel.calories ?? 2000,
                    protein: bp.nutrition_guide.macro_fuel.protein,
                    carbs: bp.nutrition_guide.macro_fuel.carbs,
                    fats: bp.nutrition_guide.macro_fuel.fats,
                    // Computed from her own calorie target now, so it tightens
                    // on a weight-loss goal instead of always sitting at the
                    // card's flat WHO-10% fallback.
                    sugar: bp.nutrition_guide.macro_fuel.sugar,
                    earnedCalories: bp.nutrition_guide.macro_fuel.earnedCalories,
                  }}
                  theme={theme}
                />
              </Animated.View>
            ) : null}
            {/* River Tracks for Recommended Fuel */}
            {(() => {
              const phaseMap: Record<string, 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'> = {
                "Menstrual": "menstrual", "Follicular": "follicular",
                "Ovulatory": "ovulatory", "Luteal": "luteal"
              };
              const phaseKey = phaseMap[phaseName] || "menstrual";
              const phaseData = DIET_RECOMMENDATIONS.phases[phaseKey]?.diet_types;

              if (!phaseData) return null;

              const userDietPref = data?.lifestyle?.diet_preference?.toLowerCase() || 'veg';
              let categories: ('non_veg' | 'vegetarian' | 'vegan' | 'jain')[] = [];
              if (userDietPref === 'non-veg') categories = ['non_veg', 'vegetarian', 'vegan', 'jain'];
              else if (userDietPref === 'veg' || userDietPref === 'vegetarian') categories = ['vegetarian', 'vegan', 'jain'];
              else if (userDietPref === 'vegan') categories = ['vegan', 'jain'];
              else if (userDietPref === 'jain') categories = ['jain'];

              const allItems = categories.flatMap(cat => phaseData[cat] || []);
              const seen = new Set();
              const uniqueItems = allItems.filter(item => {
                const key = item.title.trim().toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              const styledItems = uniqueItems.map(item => ({
                ...item,
                desc: item.description,
                detail: item.description,
                bg: theme.iconBg,
                color: theme.iconColor
              }));

              const half = Math.ceil(styledItems.length / 2);
              const row1 = styledItems.slice(0, half);
              const row2 = styledItems.slice(half);

              return (
                <Animated.View entering={FadeInUp.delay(150).duration(500)} className="mb-10">
                  <SectionHeader icon="coffee" title={t('plan.index.recommendedFuel')} color={theme.color} />
                  <View className="-mx-5">
                    <RiverTrack label={t('plan.index.eatMore')} items={row1} speed={40} direction="left" onCardClick={setExpandedFoodItem} />
                    <View className="mt-4">
                      <RiverTrack label={t('plan.index.powerFoods')} items={row2} speed={40} direction="right" onCardClick={setExpandedFoodItem} />
                    </View>
                  </View>
                </Animated.View>
              );
            })()}

            <Animated.View entering={FadeInUp.delay(250).duration(500)}>
              <SymptomDecoder phase={phaseName} data={bp?.nutrition_guide?.symptom_decoder} />
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(350).duration(500)}>
              <DietCheatSheet phase={phaseName} data={{ focus: { title: t('plan.index.focusTitle'), items: bp?.diet?.core_needs || [] }, avoid: { title: t('plan.index.avoidTitle'), items: bp?.diet?.avoid || [] } }} />
            </Animated.View>

            {/* The Rove Chef */}
            <Animated.View
              entering={FadeInUp.delay(450).duration(500)}
              className="pb-16"
              onLayout={(e) => setChefSectionY(e.nativeEvent.layout.y)}
            >
              <RoveChef phase={phaseName} diet={data?.lifestyle?.diet_preference || "Veg"} fitnessGoal={data?.lifestyle?.fitness_goal} />
            </Animated.View>
          </View>
        )}

        {activeTab === 'exercise' && data?.trackerMode === 'ttc' && (
          <View>
            <TtcMoveSection hasPcos={!!data?.hasPcos} signal={data?.ovulation ?? null} />

            {/* Same active-days guide cycle-sync shows — activeDaysPerWeek is
                computed from lifestyle/pace, not tied to cycle phase, so it's
                just as valid here. */}
            {!!bp?.exercise?.activeDaysPerWeek && (
              <Animated.View
                entering={FadeInUp.delay(50).duration(500)}
                className="flex-row items-center p-4 rounded-[20px] border border-white/40 mb-8"
                style={{ backgroundColor: `${ACCENT}12` }}
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 border border-white/50 bg-white/50">
                  <Feather name="calendar" size={16} color={ACCENT} />
                </View>
                <View className="flex-1">
                  <Text className="text-rove-charcoal text-xs font-semibold leading-relaxed">
                    {t('plan.index.aimForActiveDaysPrefix')}<Text style={{ color: ACCENT, fontWeight: '800' }}>{t('plan.index.activeDaysCount', { count: bp.exercise.activeDaysPerWeek })}</Text>{t('plan.index.aimForActiveDaysSuffix')}
                  </Text>
                  <View className="mt-2">
                    <ActiveDaysDots completed={bp.exercise.activeDaysThisWeek ?? 0} target={bp.exercise.activeDaysPerWeek} color={ACCENT} />
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Same AI workout builder + session log sync mode gets — only the
                visible "Optimized for"/"Completion by Phase" copy is
                TTC-worded; the phase/theme underneath stay real. */}
            <Animated.View entering={FadeInUp.delay(150).duration(500)} className="mb-16">
              <SectionHeader icon="barbell" iconFamily="Ionicons" title={t('plan.exerciseBuilder.roveCoachHeader')} color={theme.color} />

              <View className="rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 0 }}>
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                )}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.7, y: 0.7 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View className="p-5">
                  {/* Coach / History Toggle */}
                  <View className="flex-row bg-white/40 p-1 rounded-xl border border-white/60 mb-5" style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                    <Pressable
                      onPress={() => setExerciseView('coach')}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(exerciseView === 'coach' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                    >
                      <Feather name="zap" size={13} color={exerciseView === 'coach' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                      <Text className={`text-[11px] font-bold ${exerciseView === 'coach' ? 'text-white' : 'text-rove-stone'}`}>{t('plan.exerciseBuilder.workoutCoachTab')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setExerciseView('history')}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(exerciseView === 'history' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                    >
                      <Feather name="bar-chart-2" size={13} color={exerciseView === 'history' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                      <Text className={`text-[11px] font-bold ${exerciseView === 'history' ? 'text-white' : 'text-rove-stone'}`}>{t('plan.exerciseBuilder.sessionLogTab')}</Text>
                    </Pressable>
                  </View>

                  {/* Conditional View */}
                  {exerciseView === 'coach' ? (
                    <ExerciseBuilder
                      phase={phaseName}
                      openSignal={coachOpenSignal}
                      activityLevel={data?.lifestyle?.activity_level}
                      fitnessGoal={data?.lifestyle?.fitness_goal}
                      defaultDuration={`${bp?.exercise?.time || 30}m`}
                      contextLabel={t('plan.index.optimizedForCycle')}
                      insightsLabel={t('plan.index.recentSessions')}
                    />
                  ) : (
                    <WorkoutHistory phase={phaseName} insightsLabel={t('plan.index.recentSessions')} />
                  )}
                </View>
              </View>
            </Animated.View>
          </View>
        )}

        {activeTab === 'exercise' && data?.trackerMode !== 'ttc' && (
          <View>
            {/* Exercise Orb */}
            <Animated.View entering={FadeInUp.duration(500)}>
              <ExerciseOrb
                phase={phaseName}
                metrics={{
                  time: bp?.exercise?.time,
                  unit: bp?.exercise?.unit,
                  intensity: bp?.exercise?.intensity,
                  type: bp?.exercise?.type,
                }}
                onPressCoach={() => {
                  setExerciseView('coach');
                  setCoachOpenSignal((s) => s + 1);
                }}
              />
            </Animated.View>

            {/* Active-days guide — ties the pace chosen in Nourish's goal setup
                to a rough weekly workout frequency, capped by activity level. */}
            {!!bp?.exercise?.activeDaysPerWeek && (
              <Animated.View
                entering={FadeInUp.delay(50).duration(500)}
                className="flex-row items-center p-4 rounded-[20px] border border-white/40 mb-8"
                style={{ backgroundColor: theme.cardTint }}
              >
                <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 border border-white/50 bg-white/50">
                  <Feather name="calendar" size={16} color={theme.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-rove-charcoal text-xs font-semibold leading-relaxed">
                    {t('plan.index.aimForActiveDaysPrefix')}<Text style={{ color: theme.textColor, fontWeight: '800' }}>{t('plan.index.activeDaysCount', { count: bp.exercise.activeDaysPerWeek })}</Text>{t('plan.index.aimForActiveDaysSuffix')}
                  </Text>
                  <View className="mt-2">
                    <ActiveDaysDots completed={bp.exercise.activeDaysThisWeek ?? 0} target={bp.exercise.activeDaysPerWeek} color={theme.textColor} />
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Best For This Phase — Snapshot Card Grid */}
            <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-0.5 rounded-full mr-2" style={{ backgroundColor: theme.color }} />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-charcoal/80">{t('plan.index.bestForThisPhase')}</Text>
              </View>

              <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
                {bp?.exercise?.best?.slice(0, 4).map((ex: any, i: number) => {
                  const getEmoji = (title: string) => {
                    const t = title.toLowerCase();
                    if (t.includes('yoga') || t.includes('stretch')) return '🧘';
                    if (t.includes('walk') || t.includes('stroll')) return '🚶';
                    if (t.includes('hiit') || t.includes('interval')) return '🔥';
                    if (t.includes('spin') || t.includes('cardio') || t.includes('cycling')) return '🚴';
                    if (t.includes('lift') || t.includes('strength') || t.includes('weight')) return '🏋️';
                    if (t.includes('swim')) return '🏊';
                    if (t.includes('pilates')) return '🤸';
                    if (t.includes('dance')) return '💃';
                    if (t.includes('run') || t.includes('jog')) return '🏃';
                    if (t.includes('breath')) return '🌬️';
                    return '💪';
                  };

                  return (
                    <View key={i} className="w-[50%] px-[5px] mb-[10px]">
                      <Pressable
                        onPress={() => setExpandedExerciseIndex(i)}
                        className="rounded-[22px] overflow-hidden relative border border-white/40"
                        style={{ minHeight: 168, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: Platform.OS === 'ios' ? 3 : 0 }}
                      >
                        {Platform.OS === 'ios' ? (
                          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                        ) : (
                          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                        )}
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                        <LinearGradient
                          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <View className="flex-1 p-4 justify-between">
                          {/* Top: label + emoji */}
                          <View className="flex-row items-start justify-between">
                            <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: theme.textColor }}>{t('plan.index.exerciseBadge')}</Text>
                            <Text className="text-2xl opacity-80">{getEmoji(ex.title)}</Text>
                          </View>

                          {/* Bottom: title + preview + time. The preview line is what
                              was missing before — the collapsed card used to show only a
                              title and a time badge, with the actual reasoning ("why this,
                              why now") hidden until you tapped through. */}
                          <View>
                            <Text className="text-[16px] text-rove-charcoal leading-tight mb-1" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>{ex.title}</Text>
                            {!!ex.desc && (
                              <Text numberOfLines={2} className="text-[10.5px] leading-[13px] text-rove-charcoal/60 mb-2">
                                {ex.desc}
                              </Text>
                            )}
                            <View className="flex-row items-center">
                              <View className="px-2 py-1 rounded-md bg-white/50 border border-white/80 flex-row items-center shadow-sm" style={{ shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                                <Feather name="clock" size={9} color={theme.color} style={{ marginRight: 4 }} />
                                <Text className="text-[9px] font-bold tracking-wider" style={{ color: theme.textColor }}>{ex.time}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setGuidedSessionOpen(true); }}
                className="flex-row items-center justify-center py-3.5 rounded-2xl mt-3"
                style={{ backgroundColor: theme.color }}
              >
                <Feather name="play" size={14} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-sm">{t('plan.exerciseBuilder.startGuidedSession')}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Avoid This Phase */}
            {bp?.exercise?.avoid && bp.exercise.avoid.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-10">
                <View className="rounded-[22px] overflow-hidden relative border border-white/40" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: Platform.OS === 'ios' ? 2 : 0 }}>
                  {Platform.OS === 'ios' ? (
                    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                  ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                  )}
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                  <View className="p-5">
                    <View className="flex-row items-center mb-3">
                      <Feather name="slash" size={12} color={theme.color} style={{ marginRight: 6 }} />
                      <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textColor }}>{t('plan.index.avoidThisPhase')}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {bp.exercise.avoid.map((item: string) => (
                          <View key={item} className="px-4 py-2 bg-white/60 border border-white/60 rounded-full" style={{ shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}>
                            <Text className="text-xs text-rove-charcoal/80 font-bold">{item}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Rove Coach + Session Log — Tabbed Card */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(500)}
              className="mb-16"
            >
              <SectionHeader icon="barbell" iconFamily="Ionicons" title={t('plan.exerciseBuilder.roveCoachHeader')} color={theme.color} />

              <View className="rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 0 }}>
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                )}
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                <LinearGradient
                  colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0.7, y: 0.7 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View className="p-5">
                  {/* Coach / History Toggle */}
                  <View className="flex-row bg-white/40 p-1 rounded-xl border border-white/60 mb-5" style={{ shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                    <Pressable
                      onPress={() => setExerciseView('coach')}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(exerciseView === 'coach' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                    >
                      <Feather name="zap" size={13} color={exerciseView === 'coach' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                      <Text className={`text-[11px] font-bold ${exerciseView === 'coach' ? 'text-white' : 'text-rove-stone'}`}>{t('plan.exerciseBuilder.workoutCoachTab')}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setExerciseView('history')}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(exerciseView === 'history' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                    >
                      <Feather name="bar-chart-2" size={13} color={exerciseView === 'history' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                      <Text className={`text-[11px] font-bold ${exerciseView === 'history' ? 'text-white' : 'text-rove-stone'}`}>{t('plan.exerciseBuilder.sessionLogTab')}</Text>
                    </Pressable>
                  </View>

                  {/* Conditional View */}
                  {exerciseView === 'coach' ? (
                    <ExerciseBuilder
                      phase={phaseName}
                      openSignal={coachOpenSignal}
                      activityLevel={data?.lifestyle?.activity_level}
                      fitnessGoal={data?.lifestyle?.fitness_goal}
                      defaultDuration={`${bp?.exercise?.time || 30}m`}
                    />
                  ) : (
                    <WorkoutHistory phase={phaseName} />
                  )}
                </View>
              </View>
            </Animated.View>

            {/* PCOS note — TTC's Move tab shows this via TtcMoveSection; the
                same content applies to cycle-sync users flagged PCOS. */}
            {!!data?.hasPcos && (
              <Animated.View entering={FadeInUp.duration(500)} className="mb-8 mt-2 rounded-2xl bg-white/60 p-4 border border-white/60">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="info" size={13} color={theme.color} />
                  <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>
                    {t('plan.move.withPcos')}
                  </Text>
                </View>
                <Text className="text-[12.5px] leading-[19px] text-rove-charcoal">{TTC_GUIDANCE.movePcosNote}</Text>
              </Animated.View>
            )}
          </View>
        )}

      </Animated.ScrollView>

      {/* Exercise Detail Dialog */}
      <Dialog open={expandedExerciseIndex !== null} onOpenChange={(o) => !o && setExpandedExerciseIndex(null)}>
        <DialogContent>
          {expandedExerciseIndex !== null && bp?.exercise?.best?.[expandedExerciseIndex] && (
            <View className="py-2">
              <View className="items-center mb-6">
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${theme.color}15` }}>
                  <Text className="text-4xl opacity-90">
                    {(() => {
                      const t = bp.exercise.best[expandedExerciseIndex].title.toLowerCase();
                      if (t.includes('yoga') || t.includes('stretch')) return '🧘';
                      if (t.includes('walk') || t.includes('stroll')) return '🚶';
                      if (t.includes('hiit') || t.includes('interval')) return '🔥';
                      if (t.includes('spin') || t.includes('cardio') || t.includes('cycling')) return '🚴';
                      if (t.includes('lift') || t.includes('strength') || t.includes('weight')) return '🏋️';
                      if (t.includes('swim')) return '🏊';
                      if (t.includes('pilates')) return '🤸';
                      if (t.includes('dance')) return '💃';
                      if (t.includes('run') || t.includes('jog')) return '🏃';
                      if (t.includes('breath')) return '🌬️';
                      return '💪';
                    })()}
                  </Text>
                </View>
                <DialogTitle className="text-center text-2xl">{bp.exercise.best[expandedExerciseIndex].title}</DialogTitle>
                
                <View className="flex-row items-center gap-2 mt-3">
                  <View className="px-3 py-1 bg-rove-stone/10 rounded-full flex-row items-center">
                    <Feather name="clock" size={10} color="#78716C" style={{ marginRight: 4 }} />
                    <Text className="text-[10px] text-rove-stone font-bold uppercase tracking-widest">{bp.exercise.best[expandedExerciseIndex].time}</Text>
                  </View>
                  <View className="px-3 py-1 rounded-full flex-row items-center" style={{ backgroundColor: `${theme.color}15` }}>
                    <Feather name="zap" size={10} color={theme.color} style={{ marginRight: 4 }} />
                    <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.textColor }}>
                      {bp.exercise.best[expandedExerciseIndex].title.toLowerCase().includes('hiit') || bp.exercise.best[expandedExerciseIndex].title.toLowerCase().includes('strength') ? t('plan.index.highIntensity') : t('plan.index.modIntensity')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white/50 rounded-2xl p-4 border border-rove-stone/10 mb-6">
                <Text className="text-[10px] font-bold uppercase text-rove-stone mb-2" style={{ letterSpacing: getLocalizedTracking(2, i18n.language) }}>{t('plan.index.whyItWorksRightNow')}</Text>
                <DialogDescription className="text-rove-charcoal/80 leading-5">
                  {bp.exercise.best[expandedExerciseIndex].desc}
                </DialogDescription>
              </View>

              <View className="flex-row gap-3">
                <Button className="flex-1" style={{ backgroundColor: theme.color }} onPress={() => {
                  setExpandedExerciseIndex(null);
                  setGuidedSessionOpen(true);
                }}>
                  {t('plan.index.startSession')}
                </Button>
              </View>
            </View>
          )}
        </DialogContent>
      </Dialog>

      {/* Food Card Detail Dialog — "Eat More"/"Also Good"/"Power Foods" */}
      <Dialog open={!!expandedFoodItem} onOpenChange={(o) => !o && setExpandedFoodItem(null)}>
        <DialogContent>
          {expandedFoodItem && (
            <View className="py-2">
              <View className="items-center mb-6">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: expandedFoodItem.bg }}
                >
                  {React.createElement(iconMap[expandedFoodItem.icon] || CircleIcon, { size: 28, color: expandedFoodItem.color })}
                </View>
                <DialogTitle className="text-center text-2xl">{expandedFoodItem.title}</DialogTitle>
              </View>

              <View className="bg-white/50 rounded-2xl p-4 border border-rove-stone/10">
                <DialogDescription className="text-rove-charcoal/80 leading-5">
                  {expandedFoodItem.detail}
                </DialogDescription>
              </View>
            </View>
          )}
        </DialogContent>
      </Dialog>

      <GuidedSessionPlayer
        visible={guidedSessionOpen}
        onClose={() => setGuidedSessionOpen(false)}
        exercises={getPhaseData(phaseName).exercise.recommended}
        phaseName={phaseName}
        accentColor={theme.color}
      />
    </SafeAreaView>
  );
}
