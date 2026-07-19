import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
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
import { phaseThemes } from '../../data/home-content';
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
}

const phaseGuidance: Record<string, any[]> = {
    "Menstrual": [
        { icon: "🩸", title: "Iron Focus", tip: "Prioritize iron-rich foods", desc: "Replace what you're losing" },
        { icon: "🥑", title: "Gentle Fats", tip: "Embrace healthy fats", desc: "Avocado, nuts & olive oil soothe inflammation" },
        { icon: "🍚", title: "Warming Carbs", tip: "Don't skip carbs now", desc: "Complex carbs reduce cramps & boost mood" },
        { icon: "💧", title: "Hydration", tip: "Drink warm liquids", desc: "Herbal teas & warm water ease discomfort" }
    ],
    "Follicular": [
        { icon: "🥗", title: "Light & Fresh", tip: "Go light on heavy fats", desc: "Your body processes lighter foods better now" },
        { icon: "🥚", title: "Protein Power", tip: "Aim for 80g today", desc: "Building phase - support with amino acids" },
        { icon: "🥬", title: "Fiber Up", tip: "Load up on fiber", desc: "Helps metabolize rising estrogen" },
        { icon: "⚡", title: "Energizing Carbs", tip: "Complex carbs fuel workouts", desc: "You can handle more intensity now" }
    ],
    "Ovulatory": [
        { icon: "🥒", title: "Anti-Inflammatory", tip: "Avoid processed foods", desc: "Keep inflammation low at peak fertility" },
        { icon: "🐟", title: "Omega Balance", tip: "Focus on omega-3s", desc: "Fish, flax & walnuts support hormones" },
        { icon: "🥗", title: "Light Meals", tip: "Eat smaller, frequent meals", desc: "High energy means faster metabolism" },
        { icon: "🚫", title: "Skip Heavy Fats", tip: "Avoid fried & greasy foods", desc: "Your liver is processing extra estrogen" }
    ],
    "Luteal": [
        { icon: "🥚", title: "Protein Stabilizer", tip: "Maintain 70g protein", desc: "Supports mood stability & muscle retention" },
        { icon: "🍠", title: "Complex Carbs", tip: "Don't cut carbs!", desc: "They boost serotonin & reduce PMS anxiety" },
        { icon: "🥜", title: "Healthy Fats", tip: "Increase good fats now", desc: "Supports progesterone production" },
        { icon: "🍫", title: "Magnesium Rich", tip: "Dark chocolate is okay!", desc: "Magnesium eases cramps & cravings" },
        { icon: "🚫", title: "Limit Salt & Sugar", tip: "Reduce bloating triggers", desc: "Avoid processed & salty snacks" }
    ]
};

export function MacroFuelGauge({ data, phase, scrollY }: MacroFuelGaugeProps) {
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
    const facts = phaseGuidance[currentPhase] || phaseGuidance["Follicular"];
    const currentFact = facts[currentIndex];

    const fadeAnim = useRef(new Animated.Value(1)).current;

    const changeFact = (direction: 1 | -1) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 0, useNativeDriver: true })
        ]).start();

        setTimeout(() => {
            setCurrentIndex((prev) => (prev + direction + facts.length) % facts.length);
            Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
        }, 220);
    };

    useEffect(() => {
        const interval = setInterval(() => changeFact(1), 5000);
        return () => clearInterval(interval);
    }, [facts.length, fadeAnim]);

    const triggerSwipeHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Swipe left/right through the tip cards, in addition to the auto-advance.
    // activeOffsetX keeps this from hijacking the page's vertical scroll.
    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-15, 15])
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
        // Ignored for now, scroll view ref needed in parent.
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
                            elevation: 2,
                        }}
                    >
                        <Text className="text-[9px] font-bold tracking-[2px] text-rove-stone/60 uppercase mb-1">
                            Daily Fuel
                        </Text>
                        <Text
                            className="text-4xl mb-0"
                            style={{ color: theme.color, fontFamily: 'CormorantGaramond-Regular' }}
                        >
                            {displayedCalories}
                        </Text>
                        <Text className="text-[10px] text-rove-stone font-bold uppercase tracking-widest mt-1">
                            kCal
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
                            style={{ shadowColor: theme.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 }}
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
                            Rove Chef
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
                        elevation: 4,
                    }}
                >
                    <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
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
                            <Text className="text-[10px] font-extrabold uppercase tracking-[2px] mb-1" style={{ color: theme.color }}>
                                {currentFact.title}
                            </Text>
                            <Text className="text-lg text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
                                {currentFact.tip}
                            </Text>
                            <Text className="text-xs text-rove-stone/90 mt-1 font-medium">
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
