import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, G } from 'react-native-svg';
import Animated, { useAnimatedProps, withSpring } from 'react-native-reanimated';

export type Phase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

interface Props {
  size?: number;
  thickness?: number;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
}

// Helper to calculate coordinates
function polar(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Helper to create SVG path
function donutPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
) {
  const p1 = polar(cx, cy, rOuter, start);
  const p2 = polar(cx, cy, rOuter, end);
  const p3 = polar(cx, cy, rInner, end);
  const p4 = polar(cx, cy, rInner, start);
  const large = end - start > 180 ? 1 : 0;

  return `
    M ${p1.x} ${p1.y}
    A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}
    Z
  `;
}

const AnimatedG = Animated.createAnimatedComponent(G);

export function SegmentedDoughnut({
  size = 180,
  thickness = 36,
  selectedPhase,
  onPhaseSelect,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - thickness;

  const gap = 4;
  const segmentSweep = (360 - gap * 4) / 4;

  let angle = 0;

  return (
    <View className="relative items-center justify-center">
      <Svg width={size} height={size}>
        <Defs>
          {/* Menstrual: #AF6B6B */}
          <LinearGradient id="grad-menstrual" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#AF6B6B" />
            <Stop offset="50%" stopColor="#DDB4B4" />
            <Stop offset="100%" stopColor="#AF6B6B" />
          </LinearGradient>

          {/* Follicular: #8DAA9D */}
          <LinearGradient id="grad-follicular" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8DAA9D" />
            <Stop offset="50%" stopColor="#B8D3C8" />
            <Stop offset="100%" stopColor="#8DAA9D" />
          </LinearGradient>

          {/* Ovulatory: #D4A25F */}
          <LinearGradient id="grad-ovulatory" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D4A25F" />
            <Stop offset="50%" stopColor="#F0D6B5" />
            <Stop offset="100%" stopColor="#D4A25F" />
          </LinearGradient>

          {/* Luteal: #7B82A8 */}
          <LinearGradient id="grad-luteal" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7B82A8" />
            <Stop offset="50%" stopColor="#A8AED0" />
            <Stop offset="100%" stopColor="#7B82A8" />
          </LinearGradient>
        </Defs>

        {['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'].map((phase) => {
          const start = angle;
          const end = angle + segmentSweep;
          angle += segmentSweep + gap;

          const mid = (start + end) / 2;
          const isActive = selectedPhase === phase;
          const pop = isActive ? 8 : 0;
          const offset = polar(0, 0, pop, mid);
          const gradientId = `grad-${phase.toLowerCase()}`;

          return (
            <PhaseSegment
              key={phase}
              phase={phase}
              d={donutPath(cx, cy, outerRadius, innerRadius, start, end)}
              fill={`url(#${gradientId})`}
              isActive={isActive}
              offset={offset}
              selectedPhase={selectedPhase}
              cx={cx}
              cy={cy}
              onPress={() => onPhaseSelect(phase)}
            />
          );
        })}
      </Svg>

      {/* CENTER TEXT */}
      <View className="absolute items-center justify-center pointer-events-none">
        <Text 
          className="text-[10px] uppercase tracking-widest text-rove-stone mb-0.5" 
          style={{ fontFamily: 'Raleway-SemiBold' }}
        >
          Phase
        </Text>
        <Text 
          className="text-sm text-rove-charcoal" 
          style={{ fontFamily: 'Raleway-Bold' }}
        >
          {selectedPhase || '—'}
        </Text>
      </View>
    </View>
  );
}

interface SegmentProps {
  phase: string;
  d: string;
  fill: string;
  isActive: boolean;
  offset: { x: number; y: number };
  selectedPhase: string;
  cx: number;
  cy: number;
  onPress: () => void;
}

function PhaseSegment({
  phase,
  d,
  fill,
  isActive,
  offset,
  selectedPhase,
  cx,
  cy,
  onPress,
}: SegmentProps) {
  const animatedProps = useAnimatedProps(() => {
    const scale = withSpring(isActive ? 1.06 : 1, {
      stiffness: 280,
      damping: 22,
    });
    const tx = withSpring(isActive ? offset.x : 0, {
      stiffness: 280,
      damping: 22,
    });
    const ty = withSpring(isActive ? offset.y : 0, {
      stiffness: 280,
      damping: 22,
    });
    const opacity = withSpring(
      selectedPhase && !isActive ? 0.4 : 1,
      { stiffness: 280, damping: 22 }
    );

    return {
      x: tx,
      y: ty,
      scale: scale,
      opacity: opacity,
    };
  });

  return (
    <AnimatedG
      animatedProps={animatedProps}
      originX={cx}
      originY={cy}
    >
      <Path
        d={d}
        fill={fill}
        onPress={onPress}
      />
    </AnimatedG>
  );
}
