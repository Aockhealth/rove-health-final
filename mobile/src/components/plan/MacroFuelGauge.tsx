import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity , Platform} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    runOnJS,
    type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { phaseThemes } from '../../data/home-content';
import { getLocalizedFontFamily, getLocalizedTracking } from '../../lib/fonts';
import { PhaseOrbRing } from '../home/PhaseOrbRing';

interface MacroFuelGaugeProps {
    data: {
        title: string;
        protein: number;
        fats: number;
        carbs: number;
        calories?: number;
    };
    phase?: string;
    /** Shared scroll offset from the parent screen, used to give the ring a
     * subtle parallax drift — same treatment as the phase orb on Home. */
    scrollY?: SharedValue<number>;
    /** Scrolls the parent screen down to the Rove Chef section. */
    onScrollToChef?: () => void;
}

// Icons only — title/tip/desc are localized strings pulled from
// plan.macroFuelGauge.phaseGuidance.<Phase>.<index> at render time (see
// useLocalizedPhaseGuidance below), since this data lives in this component
// rather than a shared content module.
const phaseGuidanceIcons: Record<string, string[]> = {
    "Menstrual": ["🩸", "🥑", "🍚", "💧"],
    "Follicular": ["🥗", "🥚", "🥬", "⚡"],
    "Ovulatory": ["🥒", "🐟", "🥗", "🚫"],
    "Luteal": ["🥚", "🍠", "🥜", "🍫", "🚫"],
};

export function MacroFuelGauge({ data, phase, scrollY, onScrollToChef }: MacroFuelGaugeProps) {
    const { t, i18n } = useTranslation();
    if (!data) return null;

    const currentPhase = phase || "Menstrual";
    const theme = phaseThemes[currentPhase as keyof typeof phaseThemes] || phaseThemes.Menstrual;

    // Parallax — falls back to a static shared value when no scrollY is passed
    // in, so the worklet always has something safe to read.
    const fallbackScrollY = useSharedValue(0);
    const effectiveScrollY = scrollY ?? fallbackScrollY;
    const parallaxStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: effectiveScrollY.value * 0.12 }],
    }));

    // Calorie count-up on mount / whenever the target changes
    const targetCalories = data.calories ? Math.round(data.calories / 10) * 10 : 2000;
    const [displayedCalories, setDisplayedCalories] = useState(0);

    useEffect(() => {
        let startTs: number | null = null;
        const duration = 800;
        let raf: number;
        const step = (ts: number) => {
            if (startTs === null) startTs = ts;
            const progress = Math.min((ts - startTs) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayedCalories(Math.round((targetCalories * eased) / 10) * 10);
            if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [targetCalories]);

    // Carousel State
    const [currentIndex, setCurrentIndex] = useState(0);
    const guidancePhase = phaseGuidanceIcons[currentPhase] ? currentPhase : "Follicular";
    // A couple of tips (Follicular's Protein Power, Luteal's Protein
    // Stabilizer) cite a specific gram target — {{grams}} interpolates the
    // account's real computed target (same data.protein "Today's Intake"
    // reads) instead of a hardcoded number that silently drifted from it.
    const proteinGrams = Math.round(data.protein);
    const facts = phaseGuidanceIcons[guidancePhase].map((icon, i) => ({
        icon,
        title: t(`plan.macroFuelGauge.phaseGuidance.${guidancePhase}.${i}.title`),
        tip: t(`plan.macroFuelGauge.phaseGuidance.${guidancePhase}.${i}.tip`, { grams: proteinGrams }),
        desc: t(`plan.macroFuelGauge.phaseGuidance.${guidancePhase}.${i}.desc`),
    }));
    const currentFact = facts[currentIndex];

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const changeFact = (direction: 1 | -1) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
            setCurrentIndex((prev) => (prev + direction + facts.length) % facts.length);
            Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
        });
    };

    useEffect(() => {
        const interval = setInterval(() => changeFact(1), 5000);
        return () => clearInterval(interval);
    }, [facts.length, fadeAnim]);

    const triggerSwipeHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Swipe left/right through the tip cards, in addition to the auto-advance.
    // activeOffsetX keeps this from hijacking the page's vertical scroll, and
    // failOffsetY makes it concede fast on a mostly-vertical drag instead of
    // sitting in the ambiguous zone while it negotiates with the page's
    // ScrollView — that negotiation window is what read as a slow-scroll
    // stutter (see PhaseOrbRing/CycleCalendar for the same fix).
    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])
        .onEnd((e) => {
            if (e.translationX < -40) {
                runOnJS(changeFact)(1);
                runOnJS(triggerSwipeHaptic)();
            } else if (e.translationX > 40) {
                runOnJS(changeFact)(-1);
                runOnJS(triggerSwipeHaptic)();
            }
        });

    const handleScrollToChef = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onScrollToChef?.();
    };

    // One-shot light sweep across the Rove Chef button, shortly after it appears
    const chefShimmerX = useSharedValue(-70);
    useEffect(() => {
        chefShimmerX.value = withDelay(500, withTiming(70, { duration: 900, easing: Easing.out(Easing.cubic) }));
    }, []);
    const chefShimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: chefShimmerX.value }, { rotate: '20deg' }],
    }));

    return (
        <View className="items-center mt-6 mb-10">
            {/* MAIN ORB CONTAINER — sized to its content instead of a fixed height, so it
                doesn't leave a big dead gap above/below the ring */}
            <View className="w-full items-center py-5">
                <Reanimated.View style={[{ width: 190, height: 190 }, parallaxStyle]} className="items-center justify-center relative">
                    {/* Ambient glow, centered directly on the ring instead of the outer container,
                        so it stays put regardless of surrounding padding */}
                    <Svg width={360} height={360} style={{ position: 'absolute', top: -85, left: -85 }}>
                        <Defs>
                            <SvgRadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                                <Stop offset="0%" stopColor={theme.color} stopOpacity={0.16} />
                                <Stop offset="55%" stopColor={theme.color} stopOpacity={0.05} />
                                <Stop offset="100%" stopColor={theme.color} stopOpacity={0} />
                            </SvgRadialGradient>
                        </Defs>
                        <Rect width="360" height="360" fill="url(#orbGlow)" />
                    </Svg>

                    <PhaseOrbRing colors={theme.orbRingColors} size={190} />

                    {/* Inner Content Glass */}
                    <View
                        className="items-center justify-center border overflow-hidden"
                        style={{
                            width: 160,
                            height: 160,
                            backgroundColor: '#FAF9F6',
                            borderColor: 'rgba(0,0,0,0.03)',
                            borderRadius: 150,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.05,
                            shadowRadius: 15,
                            elevation: Platform.OS === 'ios' ? 2 : 0,
                        }}
                    >
                        <Text className="text-[9px] font-bold text-rove-stone uppercase mb-1" style={{ letterSpacing: getLocalizedTracking(2, i18n.language) }}>
                            {t('plan.macroFuelGauge.dailyFuel')}
                        </Text>
                        <Text
                            className="text-4xl mb-0"
                            style={{ color: theme.textColor, fontFamily: getLocalizedFontFamily('CormorantGaramond-Regular', i18n.language) }}
                        >
                            {displayedCalories}
                        </Text>
                        <Text className="text-[10px] text-rove-stone font-bold uppercase tracking-widest mt-1">
                            {t('plan.macroFuelGauge.kcal')}
                        </Text>
                    </View>

                    {/* Floating ROVE CHEF Button — flush against the ring's edge, same anchor
                        pattern as the home orb's Log FAB. Shadow lives on the outer
                        TouchableOpacity (uncropped) while the gradient + rounding lives on
                        an inner clipped wrapper, since overflow:hidden would otherwise
                        clip the drop shadow along with the corners. */}
                    <View className="absolute right-0 bottom-4">
                        <TouchableOpacity
                            onPress={handleScrollToChef}
                            style={{ shadowColor: theme.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: Platform.OS === 'ios' ? 5 : 0 }}
                        >
                            <View style={{ width: 56, height: 56, borderRadius: 28, overflow: 'hidden', borderWidth: 3, borderColor: '#FAF9F6' }}>
                                <LinearGradient
                                    colors={[theme.color, theme.color + 'E6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <View className="bg-white/25 p-2 rounded-full">
                                        <Feather name="coffee" size={16} color="white" />
                                    </View>
                                </LinearGradient>
                                {/* One-shot light sweep, clipped to the circle by the parent's overflow:hidden */}
                                <Reanimated.View pointerEvents="none" style={[{ position: 'absolute', top: -20, bottom: -20, width: 20 }, chefShimmerStyle]}>
                                    <LinearGradient
                                        colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ flex: 1 }}
                                    />
                                </Reanimated.View>
                            </View>
                        </TouchableOpacity>
                        {/* Widened past the 56px button so "Rove Chef" has room to sit on
                            one line instead of wrapping and crowding the icon above it */}
                        <Text
                            numberOfLines={1}
                            style={{ position: 'absolute', bottom: -20, left: -24, right: -24 }}
                            className="text-center text-[9px] font-extrabold uppercase tracking-wider text-rove-charcoal"
                        >
                            {t('plan.macroFuelGauge.roveChef')}
                        </Text>
                    </View>
                </Reanimated.View>
            </View>

            {/* Nutrition Facts Carousel — swipeable left/right, plus auto-advances */}
            <GestureDetector gesture={swipeGesture}>
                <Animated.View
                    className="w-full rounded-[28px] p-5 border overflow-hidden relative"
                    style={{
                        opacity: fadeAnim,
                        borderColor: 'rgba(255,255,255,0.5)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: Platform.OS === 'ios' ? 4 : 0,
                    }}
                >
                    {Platform.OS === 'ios' ? (
                      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
                    ) : (
                      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
                    )}
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.cardTint }]} />
                    <LinearGradient
                        colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.7, y: 0.7 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View className="flex-row items-center mb-4">
                        <View
                            className="w-14 h-14 rounded-2xl items-center justify-center mr-4 border border-white/60"
                            style={{ backgroundColor: theme.iconBg }}
                        >
                            <Text className="text-2xl">{currentFact.icon}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-extrabold uppercase mb-1" style={{ color: theme.textColor, letterSpacing: getLocalizedTracking(2, i18n.language) }}>
                                {currentFact.title}
                            </Text>
                            <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-Bold', i18n.language) }}>
                                {currentFact.tip}
                            </Text>
                            <Text className="text-xs text-rove-stone mt-1 font-medium">
                                {currentFact.desc}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Dots */}
                    <View className="flex-row justify-center mt-2">
                        {facts.map((_, idx) => (
                            <View
                                key={idx}
                                className="h-1.5 rounded-full mx-1 transition-all"
                                style={{
                                    width: idx === currentIndex ? 16 : 6,
                                    backgroundColor: idx === currentIndex ? theme.color : `${theme.color}30`,
                                }}
                            />
                        ))}
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}
