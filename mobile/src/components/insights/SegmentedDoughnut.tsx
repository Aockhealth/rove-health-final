import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const PHASES = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'] as const;

const GRADIENTS: Record<string, [string, string, string]> = {
  Menstrual: ['#AF6B6B', '#DDB4B4', '#AF6B6B'],
  Follicular: ['#8DAA9D', '#B8D3C8', '#8DAA9D'],
  Ovulatory: ['#D4A25F', '#F0D6B5', '#D4A25F'],
  Luteal: ['#7B82A8', '#A8AED0', '#7B82A8'],
};

function polar(cx: number, cy: number, r: number, angle: number) {
  const a = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function donutPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const p1 = polar(cx, cy, rOuter, start);
  const p2 = polar(cx, cy, rOuter, end);
  const p3 = polar(cx, cy, rInner, end);
  const p4 = polar(cx, cy, rInner, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

type SegmentedDoughnutProps = {
  size?: number;
  thickness?: number;
  selectedPhase: string;
  onPhaseSelect: (phase: string) => void;
};

export function SegmentedDoughnut({ size = 180, thickness = 36, selectedPhase, onPhaseSelect }: SegmentedDoughnutProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius - thickness;
  const gap = 4;
  const segmentSweep = (360 - gap * 4) / 4;

  let angle = 0;
  const segments = PHASES.map((phase) => {
    const start = angle;
    const end = angle + segmentSweep;
    angle += segmentSweep + gap;
    return { phase, start, end };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          {PHASES.map((phase) => (
            <LinearGradient key={phase} id={`grad-${phase.toLowerCase()}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={GRADIENTS[phase][0]} />
              <Stop offset="50%" stopColor={GRADIENTS[phase][1]} />
              <Stop offset="100%" stopColor={GRADIENTS[phase][2]} />
            </LinearGradient>
          ))}
        </Defs>

        {segments.map(({ phase, start, end }) => {
          const isActive = selectedPhase === phase;
          return (
            <Path
              key={phase}
              d={donutPath(cx, cy, outerRadius, innerRadius, start, end)}
              fill={`url(#grad-${phase.toLowerCase()})`}
              opacity={selectedPhase && !isActive ? 0.4 : 1}
              stroke={isActive ? '#FFFFFF' : 'transparent'}
              strokeWidth={isActive ? 3 : 0}
              onPress={() => onPhaseSelect(phase)}
            />
          );
        })}
      </Svg>

      <View style={{ position: 'absolute', alignItems: 'center' }} pointerEvents="none">
        <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#A8A29E', fontWeight: '600', marginBottom: 4 }}>
          Phase
        </Text>
        <Text style={{ fontFamily: 'CormorantGaramond-Bold', fontSize: 16, color: '#2D2420', fontWeight: 'bold' }}>
          {selectedPhase}
        </Text>
      </View>
    </View>
  );
}
