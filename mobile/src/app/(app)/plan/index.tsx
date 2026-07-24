import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Pressable, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, withSpring, withTiming, withDelay, Easing, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { fetchPlanPageDataFast, savePlanSettings, updateWeightGoals } from '../../../lib/plan';
import { phaseThemes } from '../../../data/home-content';
import { useFocusEffect, Link } from 'expo-router';
import { WorkoutHistory } from '../../../components/plan/WorkoutHistory';
import { ExerciseOrb } from '../../../components/plan/ExerciseOrb';
import { ExerciseBuilder } from '../../../components/plan/ExerciseBuilder';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { RoveChef } from '../../../components/plan/RoveChef';
import { MacroFuelGauge } from '../../../components/plan/MacroFuelGauge';
import { SymptomDecoder } from '../../../components/plan/SymptomDecoder';
import { DietCheatSheet } from '../../../components/plan/DietCheatSheet';
import { ActivitiesWidget } from '../../../components/plan/ActivitiesWidget';
import { SectionHeader } from '../../../components/plan/SectionHeader';
import { FocusForYou } from '../../../components/plan/FocusForYou';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { RiverTrack } from '../../../components/home/RiverTrack';
import ProfileAvatar from '../../../components/home/ProfileAvatar';
import { DIET_RECOMMENDATIONS } from '../../../data/diet-recommendations';

const PLAN_TABS = [
  { id: 'guide' as const, label: 'Guide', icon: 'compass' as const },
  { id: 'diet' as const, label: 'Nourish', icon: 'coffee' as const },
  { id: 'exercise' as const, label: 'Move', icon: 'activity' as const },
];

export default function PlanScreen() {
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
  const [weeklyRate, setWeeklyRate] = useState('0.4');
  const [diet, setDiet] = useState('Veg');

  // Weight Goal widget — edit-in-place state, mirrors the web's
  // isEditingGoal/tempGoalData/handleSaveGoal in cycle-sync/plan/page.tsx.
  // Without this there was no way to log a new current weight once the
  // one-time setup wizard above was done.
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [tempGoalData, setTempGoalData] = useState({ current: 0, target: 0, start: 0 });

  useEffect(() => {
    if (data?.weightGoal) {
      setTempGoalData({
        current: parseFloat(data.weightGoal.currentWeight) || 0,
        target: parseFloat(data.weightGoal.targetWeight) || 0,
        start: parseFloat(data.weightGoal.startWeight) || 0,
      });
    }
  }, [data?.weightGoal]);

  const handleSaveGoal = async () => {
    setIsSavingGoal(true);
    try {
      const res = await updateWeightGoals({
        current_weight_kg: tempGoalData.current,
        target_weight_kg: tempGoalData.target,
        start_weight_kg: tempGoalData.start,
      });
      if (res.success) {
        setIsEditingGoal(false);
        setData((prev: any) => ({
          ...prev,
          weightGoal: {
            ...prev.weightGoal,
            currentWeight: tempGoalData.current,
            targetWeight: tempGoalData.target,
            startWeight: tempGoalData.start,
          },
        }));
      } else {
        Alert.alert('Error', res.error || 'Could not update your weight goal');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update your weight goal');
    }
    setIsSavingGoal(false);
  };

  const [activeTab, setActiveTab] = useState<'guide' | 'diet' | 'exercise'>('guide');
  const [exerciseView, setExerciseView] = useState<'coach' | 'history'>('coach');
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(null);
  // Bumped whenever the orb's floating Rove Coach button is pressed, so
  // ExerciseBuilder can jump straight into its fullscreen builder instead of
  // just scrolling to the (about to be covered) card.
  const [coachOpenSignal, setCoachOpenSignal] = useState(0);

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
        weekly_rate_kg: parseFloat(weeklyRate)
      });
      await loadData(true);
    } catch (e) {
      Alert.alert('Error', 'Could not save plan settings');
    }
    setIsSaving(false);
  };

  if (loading && !data) {
    return <LoadingScreen />;
  }

  const phaseName = data?.phase || 'Menstrual';
  const theme = phaseThemes[phaseName as keyof typeof phaseThemes] || phaseThemes['Menstrual'];

  // Setup Wizard
  if (!hasPlanSetup) {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF9F6]">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <Text className="text-3xl font-bold text-rove-charcoal mb-2 mt-4" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
            Build Your Plan
          </Text>
          <Text className="text-sm text-rove-stone mb-8">
            Step {setupStep} of 5
          </Text>

          {setupStep === 1 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">What are your biometrics?</Text>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">Height (cm)</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">Weight (kg)</Text>
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
              <Text className="text-lg font-bold text-rove-charcoal mb-4">How active are you?</Text>
              {['Sedentary', 'Active', 'Highly Active'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setActivity(opt)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${activity === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${activity === opt ? 'text-white' : 'text-rove-charcoal'}`}>{opt}</Text>
                  {activity === opt && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {setupStep === 3 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">What is your primary goal?</Text>
              {[{ id: 'weight_loss', label: 'Fat Loss' }, { id: 'maintenance', label: 'Maintenance' }, { id: 'muscle_gain', label: 'Build Muscle' }].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setFitnessGoal(opt.id)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${fitnessGoal === opt.id ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${fitnessGoal === opt.id ? 'text-white' : 'text-rove-charcoal'}`}>{opt.label}</Text>
                  {fitnessGoal === opt.id && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {setupStep === 4 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">Target Weight & Pace</Text>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">Target Weight (kg)</Text>
                <TextInput
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
              <View className="mb-4">
                <Text className="text-xs uppercase tracking-widest text-rove-stone font-bold mb-2">Weekly Goal (kg)</Text>
                <TextInput
                  value={weeklyRate}
                  onChangeText={setWeeklyRate}
                  keyboardType="numeric"
                  className="bg-white px-4 py-3 rounded-xl border border-rove-stone/20 text-rove-charcoal font-medium text-lg"
                />
              </View>
            </View>
          )}

          {setupStep === 5 && (
            <View>
              <Text className="text-lg font-bold text-rove-charcoal mb-4">Dietary Preference</Text>
              {['Veg', 'Non-Veg', 'Vegan', 'Jain'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setDiet(opt)}
                  className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${diet === opt ? 'bg-[#2D2420] border-[#2D2420]' : 'bg-white border-rove-stone/20'}`}
                >
                  <Text className={`font-bold ${diet === opt ? 'text-white' : 'text-rove-charcoal'}`}>{opt}</Text>
                  {diet === opt && <Feather name="check" size={20} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="flex-row justify-between mt-8">
            {setupStep > 1 ? (
              <TouchableOpacity onPress={() => setSetupStep(s => s - 1)} className="py-4">
                <Text className="text-rove-stone font-bold">Back</Text>
              </TouchableOpacity>
            ) : <View />}
            
            {setupStep < 5 ? (
              <TouchableOpacity onPress={() => setSetupStep(s => s + 1)} className="bg-rove-charcoal px-8 py-4 rounded-2xl">
                <Text className="text-white font-bold">Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSaveSetup} disabled={isSaving} className="bg-rove-charcoal px-8 py-4 rounded-2xl">
                {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Generate Plan</Text>}
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
            <Text className="text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Regular', color: theme.color }}>{phaseName}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone mt-1">Day {data.day} of Cycle</Text>
          </TouchableOpacity>
        </Link>

        <ProfileAvatar />
      </View>

      {/* Tab Selector — fixed outside scroll */}
      <View className="px-5 pb-4 pt-2 items-center">
        <View
          onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width - 12)}
          className="flex-row p-[6px] bg-white rounded-full shadow-sm w-full border border-rove-stone/5"
          style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}
        >
          {tabBarWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                { position: 'absolute', top: 6, bottom: 6, left: 6, borderRadius: 9999, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, overflow: 'hidden' },
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
            {/* Focus Banner */}
            <Animated.View entering={FadeInUp.duration(500)} className="mb-8 rounded-[28px]" style={{ shadowColor: theme.color, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
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
                    <Text className="text-white/70 uppercase tracking-widest text-[10px] font-bold mb-2">Current Focus</Text>
                    <Text className="text-white text-[28px] leading-tight" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{bp?.rituals?.focus}</Text>
                  </View>
                  <View className="w-12 h-12 rounded-full border border-white/20 items-center justify-center bg-white/10 ml-4">
                    <Feather name="compass" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Weight Goal Widget */}
            {data?.weightGoal && (() => {
              const startW = parseFloat(data.weightGoal.startWeight) || 0;
              const currentW = parseFloat(data.weightGoal.currentWeight) || 0;
              const targetW = parseFloat(data.weightGoal.targetWeight) || 0;
              const totalDiff = Math.abs(startW - targetW);
              const currentDiff = Math.abs(startW - currentW);
              const progressPct = totalDiff === 0 ? 0 : Math.min(100, Math.max(0, (currentDiff / totalDiff) * 100));
              const lostText = `${Math.abs(startW - currentW).toFixed(1)}kg lost`;
              const togoText = `${Math.abs(currentW - targetW).toFixed(1)}kg to go`;
              
              return (
                <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-8 rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                  <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
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
                          <Text className="text-[9px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Your Journey</Text>
                          <Text className="text-rove-charcoal text-lg" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Your Goal</Text>
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
                            {data.weightGoal.fitnessGoal?.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {isEditingGoal ? (
                      <Animated.View entering={FadeInUp.duration(300)}>
                        {[
                          { label: 'Start', key: 'start' as const },
                          { label: 'Now', key: 'current' as const },
                          { label: 'Goal', key: 'target' as const },
                        ].map(({ label, key }) => (
                          <View
                            key={key}
                            className="flex-row items-center justify-between p-3 rounded-2xl border border-white/40 bg-white/60 mb-3"
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">{label}</Text>
                            <View className="flex-row items-center gap-3">
                              <TouchableOpacity
                                onPress={() => setTempGoalData((p) => ({ ...p, [key]: Math.max(0, p[key] - 0.5) }))}
                                className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                              >
                                <Text className="text-rove-stone text-lg" style={{ fontFamily: 'CormorantGaramond-Bold' }}>−</Text>
                              </TouchableOpacity>
                              <View style={{ minWidth: 56 }}>
                                <Text className="text-xl text-center text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                                  {tempGoalData[key]}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => setTempGoalData((p) => ({ ...p, [key]: p[key] + 0.5 }))}
                                className="w-8 h-8 rounded-full items-center justify-center bg-black/5"
                              >
                                <Text className="text-rove-stone text-lg" style={{ fontFamily: 'CormorantGaramond-Bold' }}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                        <View className="flex-row justify-end gap-3 mt-2">
                          <TouchableOpacity onPress={() => setIsEditingGoal(false)} className="px-3 py-2">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone">Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSaveGoal}
                            disabled={isSavingGoal}
                            className="px-5 py-2 rounded-full"
                            style={{ backgroundColor: theme.color, opacity: isSavingGoal ? 0.6 : 1 }}
                          >
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-white">
                              {isSavingGoal ? '...' : 'Save'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    ) : (
                      <>
                        {/* Weight Dashboard */}
                        <View className="flex-row items-center justify-between mb-6 p-4 rounded-[20px] border border-white/40 bg-white/30">
                          <View className="items-center flex-1">
                            <Text className="text-lg font-bold text-rove-charcoal/70" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{startW}<Text className="text-xs text-rove-stone">kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest text-rove-stone mt-0.5">Start</Text>
                          </View>
                          <Text className="text-rove-stone/30 text-lg mx-1">→</Text>
                          <View className="items-center flex-1 px-4 py-2 rounded-[14px]" style={{ backgroundColor: `${theme.color}15` }}>
                            <Text className="text-xl font-bold" style={{ fontFamily: 'CormorantGaramond-Bold', color: theme.color }}>{currentW}<Text className="text-xs" style={{ opacity: 0.6 }}>kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest mt-0.5" style={{ color: theme.color, opacity: 0.7 }}>Now</Text>
                          </View>
                          <Text className="text-rove-stone/30 text-lg mx-1">→</Text>
                          <View className="items-center flex-1">
                            <Text className="text-lg font-bold text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{targetW}<Text className="text-xs text-rove-stone">kg</Text></Text>
                            <Text className="text-[8px] font-bold uppercase tracking-widest text-rove-stone mt-0.5">Goal</Text>
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

            {/* The Science */}
            <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-10">
              <SectionHeader icon="book-open" title="The Science" color={theme.color} />

              <View className="rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
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
                      <Text className="text-white/70 text-[9px] font-bold uppercase tracking-widest">Your Biology</Text>
                      <Text className="text-white text-lg" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Hormones Now</Text>
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
                  <Text className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.color }}>What You May Feel</Text>

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

            <Animated.View entering={FadeInUp.delay(300).duration(500)} className="mb-16">
              <ActivitiesWidget practices={bp?.rituals?.practices || []} themeColor={theme.color} />
            </Animated.View>

            <FocusForYou
              goals={data?.onboarding?.goals || []}
              hasWeightGoal={!!data?.weightGoal}
              themeColor={theme.color}
            />
          </View>
        )}

        {activeTab === 'diet' && (
          <View>
            <Animated.View entering={FadeInUp.delay(50).duration(500)}>
              <MacroFuelGauge
                phase={phaseName}
                data={bp?.nutrition_guide?.macro_fuel}
                scrollY={scrollY}
                onScrollToChef={() => scrollRef.current?.scrollTo({ y: chefSectionY, animated: true })}
              />
            </Animated.View>
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
                bg: theme.iconBg,
                color: theme.iconColor
              }));

              const half = Math.ceil(styledItems.length / 2);
              const row1 = styledItems.slice(0, half);
              const row2 = styledItems.slice(half);

              return (
                <Animated.View entering={FadeInUp.delay(150).duration(500)} className="mb-10">
                  <SectionHeader icon="coffee" title="Recommended Fuel" color={theme.color} />
                  <View className="-mx-5">
                    <RiverTrack label="Eat More" items={row1} speed={40} direction="left" />
                    <View className="mt-4">
                      <RiverTrack label="Power Foods" items={row2} speed={40} direction="right" />
                    </View>
                  </View>
                </Animated.View>
              );
            })()}

            <Animated.View entering={FadeInUp.delay(250).duration(500)}>
              <SymptomDecoder phase={phaseName} data={bp?.nutrition_guide?.symptom_decoder} />
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(350).duration(500)}>
              <DietCheatSheet phase={phaseName} data={{ focus: { title: "Focus", items: bp?.diet?.core_needs || [] }, avoid: { title: "Avoid", items: bp?.diet?.avoid || [] } }} />
            </Animated.View>

            {/* The Rove Chef */}
            <Animated.View
              entering={FadeInUp.delay(450).duration(500)}
              className="pb-16"
              onLayout={(e) => setChefSectionY(e.nativeEvent.layout.y)}
            >
              <RoveChef phase={phaseName} diet={data?.lifestyle?.diet_preference || "Veg"} />
            </Animated.View>
          </View>
        )}

        {activeTab === 'exercise' && (
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

            {/* Best For This Phase — Snapshot Card Grid */}
            <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-0.5 rounded-full mr-2" style={{ backgroundColor: theme.color }} />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-charcoal/80">Best For This Phase</Text>
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
                        style={{ aspectRatio: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 }}
                      >
                        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
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
                            <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: theme.color }}>Exercise</Text>
                            <Text className="text-2xl opacity-80">{getEmoji(ex.title)}</Text>
                          </View>

                          {/* Bottom: title + time */}
                          <View>
                            <Text className="text-[16px] text-rove-charcoal leading-tight mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>{ex.title}</Text>
                            <View className="flex-row items-center">
                              <View className="px-2 py-1 rounded-md bg-white/50 border border-white/80 flex-row items-center shadow-sm" style={{ shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                                <Feather name="clock" size={9} color={theme.color} style={{ marginRight: 4 }} />
                                <Text className="text-[9px] font-bold tracking-wider" style={{ color: theme.color }}>{ex.time}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Avoid This Phase */}
            {bp?.exercise?.avoid && bp.exercise.avoid.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-10">
                <View className="rounded-[22px] overflow-hidden relative border border-white/40" style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
                  <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                  <View className="p-5">
                    <View className="flex-row items-center mb-3">
                      <Feather name="slash" size={12} color={theme.color} style={{ marginRight: 6 }} />
                      <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>Avoid This Phase</Text>
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
              <SectionHeader icon="barbell" iconFamily="Ionicons" title="Rove Coach" color={theme.color} />

              <View className="rounded-[28px] overflow-hidden relative border" style={{ borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
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
                      <Text className={`text-[11px] font-bold ${exerciseView === 'coach' ? 'text-white' : 'text-rove-stone'}`}>Workout Coach</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setExerciseView('history')}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, ...(exerciseView === 'history' ? { backgroundColor: theme.color, shadowColor: theme.color, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}) }}
                    >
                      <Feather name="bar-chart-2" size={13} color={exerciseView === 'history' ? 'white' : '#78716C'} style={{ marginRight: 5 }} />
                      <Text className={`text-[11px] font-bold ${exerciseView === 'history' ? 'text-white' : 'text-rove-stone'}`}>Session Log</Text>
                    </Pressable>
                  </View>

                  {/* Conditional View */}
                  {exerciseView === 'coach' ? (
                    <ExerciseBuilder phase={phaseName} openSignal={coachOpenSignal} />
                  ) : (
                    <WorkoutHistory phase={phaseName} />
                  )}
                </View>
              </View>
            </Animated.View>
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
                    <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.color }}>
                      {bp.exercise.best[expandedExerciseIndex].title.toLowerCase().includes('hiit') || bp.exercise.best[expandedExerciseIndex].title.toLowerCase().includes('strength') ? 'High Intensity' : 'Mod Intensity'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white/50 rounded-2xl p-4 border border-rove-stone/10 mb-6">
                <Text className="text-[10px] font-bold uppercase tracking-[2px] text-rove-stone mb-2">Why it works right now</Text>
                <DialogDescription className="text-rove-charcoal/80 leading-5">
                  {bp.exercise.best[expandedExerciseIndex].desc}
                </DialogDescription>
              </View>

              <View className="flex-row gap-3">
                <Button className="flex-1" style={{ backgroundColor: theme.color }} onPress={() => {
                  setExpandedExerciseIndex(null);
                  setTimeout(() => setExerciseView('coach'), 300);
                }}>
                  Start Session
                </Button>
              </View>
            </View>
          )}
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
