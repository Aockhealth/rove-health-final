import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { NumericStepper } from './NumericStepper';
import { ConfettiBurst } from './ConfettiBurst';

const MAX_GLASSES = 8; // the goal — visual fill caps here, and it's when "Goal Reached" shows
const MAX_LOGGABLE_GLASSES = 30; // sane upper bound so you can log past the goal (9, 10, ...)
const ML_PER_GLASS = 250;

// The water itself is always this blue on the web (WaterIntakeCard.tsx uses
// `bg-blue-400/80` / `text-blue-400` for the fill and pour stream, regardless
// of the card's teal category color — only the glass border/buttons/stepper
// use the category accent). Match that split here.
const WATER_COLOR = '#60A5FA';
const GLASS_HEIGHT = 101; // matches glassOuter's height minus its (bottom-only) border, used to size the pour stream in px

export interface HydrationTrackerProps {
  glasses: number;
  onGlassesChange: (n: number) => void;
  /** Category color for the glass border + stepper buttons — the web keeps
   * these teal (#4DB6AC) while the water itself stays blue. */
  accentColor?: string;
}

// One rising bubble inside the water fill. Ported 1:1 from the web's 3
// bubbles: 20%/50%/80% left, 2s/3s/4s duration, 0/0.5s/1s stagger, linear,
// infinite, fading in then out ([0,1,0] opacity keyframes) as it rises from
// just below the water line to the top of the current fill.
function Bubble({
  delay,
  duration,
  left,
  active,
}: {
  delay: number;
  duration: number;
  left: DimensionValue;
  active: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));
    } else {
      progress.value = 0;
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    // -10% to 100%, approximating the web's "-10px to 100%" rise so bubbles
    // start just under the water line instead of snapping in at the bottom.
    bottom: `${progress.value * 110 - 10}%`,
    // Triangle wave: fades in over the first half, out over the second —
    // matches Framer Motion's implicit even spacing for a [0, 1, 0] keyframe
    // array over one duration.
    opacity: progress.value < 0.5 ? progress.value * 2 : (1 - progress.value) * 2,
  }));

  return <Animated.View style={[styles.bubble, { left }, style]} />;
}

export function HydrationTracker({ glasses, onGlassesChange, accentColor = '#5B9A8B' }: HydrationTrackerProps) {
  const fillFraction = Math.min(glasses, MAX_GLASSES) / MAX_GLASSES;
  const ml = glasses * ML_PER_GLASS;
  const goalReached = glasses >= MAX_GLASSES;

  const [celebrateKey, setCelebrateKey] = useState(0);
  const prevGlassesRef = useRef(glasses);

  const fillHeight = useSharedValue(fillFraction * 100);
  const streamHeight = useSharedValue(0);
  const streamOpacity = useSharedValue(0);
  const countScale = useSharedValue(1);
  const highlightPulse = useSharedValue(1);

  useEffect(() => {
    // Same spring the web uses: { type: "spring", stiffness: 100, damping: 20 }
    fillHeight.value = withSpring(fillFraction * 100, { stiffness: 100, damping: 20 });
  }, [fillFraction]);

  // Web's `animate-pulse` on the top highlight: opacity 1 <-> ~0.5 over 2s, infinite.
  useEffect(() => {
    highlightPulse.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // Celebrate every time the count reaches the goal (matches the web's
  // `useEffect(() => { if (waterIntake === 8) confetti(...) }, [waterIntake])`).
  useEffect(() => {
    if (glasses === MAX_GLASSES && prevGlassesRef.current !== MAX_GLASSES) {
      setCelebrateKey((k) => k + 1);
    }
    prevGlassesRef.current = glasses;
  }, [glasses]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value}%`,
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightPulse.value,
  }));

  // Animates as a plain View's pixel height (not the <Svg>'s own width/height
  // props) — react-native-svg doesn't reliably re-stretch a percentage-sized
  // <Svg> when only its parent's height is nudged via Reanimated on the UI
  // thread, which is why the pour was invisible before. A plain
  // overflow:hidden clip window is the same mechanism the water fill already
  // uses successfully, so it's guaranteed to actually render.
  const streamStyle = useAnimatedStyle(() => ({
    // streamHeight animates 0 -> 105 (i.e. "105%"), same overshoot the web
    // uses so the stream visually reaches past the glass rim before fading.
    height: (streamHeight.value / 100) * GLASS_HEIGHT,
    opacity: streamOpacity.value,
  }));

  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  // Pure side-effect triggers, fired directly from NumericStepper's +/-
  // presses (not inferred from the resulting value) — the actual value
  // update goes through `onGlassesChange` via NumericStepper's own onChange.
  //
  // Using value comparison to infer direction was the bug: once glasses
  // hit MAX_GLASSES, NumericStepper clamps the "+" tap's computed value to
  // the same 8, so `next > glasses` was false and it silently ran the
  // decrement path instead — which is why pressing "+" at the goal dropped
  // the count to 7.
  const handleIncrementFX = () => {
    // Pouring-stream animation — a quick stream drops in from the top of the
    // glass and fades, matching the web's animated SVG pour (0.2s in/out).
    streamOpacity.value = 1;
    streamHeight.value = withSequence(
      withTiming(105, { duration: 200, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) })
    );
    setTimeout(() => {
      streamOpacity.value = 0;
    }, 420);

    // Small "pop" on the ml counter for extra tactile feedback on tap.
    countScale.value = withSequence(
      withTiming(1.12, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) })
    );
  };

  return (
    <View style={styles.container}>
      {/* Glass */}
      <View style={[styles.glassOuter, { borderColor: `${accentColor}4D` }]}>
        <View style={styles.glassInner}>
          <Animated.View style={[styles.fill, fillStyle, { backgroundColor: `${WATER_COLOR}CC` }]}>
            <Animated.View style={[styles.fillHighlight, highlightStyle]} />
            <Bubble delay={0} duration={2000} left="20%" active={glasses > 0} />
            <Bubble delay={500} duration={3000} left="50%" active={glasses > 0} />
            <Bubble delay={1000} duration={4000} left="80%" active={glasses > 0} />
          </Animated.View>

          {/* Pouring stream — same teardrop path as the web's inline SVG.
              The <Svg> itself is a FIXED size and never resized; only the
              plain clip View around it animates height, revealing more of
              the teardrop from its tip downward as it "pours in". */}
          <Animated.View style={[styles.streamClip, streamStyle]}>
            <Svg width={24} height={GLASS_HEIGHT} viewBox="0 0 40 100" style={styles.streamSvg}>
              <Path
                d="M 18 0 Q 21 30 15 90 Q 5 100 0 100 L 40 100 Q 35 100 25 90 Q 19 30 22 0 Z"
                fill={WATER_COLOR}
              />
            </Svg>
          </Animated.View>
        </View>
      </View>

      {/* Value display */}
      <Animated.View style={[styles.valueBlock, countStyle]}>
        {goalReached && <Text style={[styles.goalText, { color: accentColor }]}>Goal Reached! 💧</Text>}
        <Text style={styles.ml}>
          <Text style={styles.mlNum}>{ml}</Text>
          <Text style={styles.mlUnit}> ml</Text>
        </Text>
        <Text style={styles.glassCount}>
          {glasses} {glasses === 1 ? 'glass' : 'glasses'} {goalReached ? 'logged' : `/ ${MAX_GLASSES} glasses`}
        </Text>
      </Animated.View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <NumericStepper
          value={glasses}
          onChange={onGlassesChange}
          onIncrement={handleIncrementFX}
          min={0}
          // No cap at the 8-glass goal — matches the web (WaterIntakeCard
          // just does `setWaterIntake(waterIntake + 1)` with no max), so
          // logging 9, 10, 11... past the goal is allowed. MAX_GLASSES still
          // caps the glass's visual fill and marks the goal-reached state.
          max={MAX_LOGGABLE_GLASSES}
          accentColor={accentColor}
        />
      </View>

      {celebrateKey > 0 && <ConfettiBurst triggerKey={celebrateKey} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  glassOuter: {
    // Web's glass is a genuine open-top silhouette — no top border, flat top
    // corners, a big rounded bottom (`border-4 border-t-0 rounded-b-3xl`).
    // The previous version had a border on all four sides with only a slight
    // top rounding, which read as a rounded rectangle rather than a glass.
    width: 68,
    height: 104,
    borderWidth: 3,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  glassInner: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  fillHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  streamClip: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -12,
    width: 24,
    overflow: 'hidden',
  },
  streamSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  valueBlock: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ml: {
    color: '#2D2420',
  },
  mlNum: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#2D2420',
  },
  mlUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A8A29E',
  },
  glassCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginBottom: 16,
    marginTop: 4,
  },
  stepper: {
    alignItems: 'center',
  },
});
