import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { TtcRingVisual } from '../../lib/ttcEngine';

export interface TtcOrbRingProps {
  size?: number;
  color: string;
  ring: TtcRingVisual;
  children?: React.ReactNode;
}

const STROKE_WIDTH = 11;

/**
 * Progress arc + soft uncertainty halo for the TTC Home orb. Not built on
 * `PhaseOrbRing` — that's a decorative spinner with no progress-arc concept,
 * where this needs to encode "how far into the fertile read are we, and how
 * sure" as an actual fill fraction.
 */
export function TtcOrbRing({ size = 172, color, ring, children }: TtcOrbRingProps) {
  const radius = size / 2 - STROKE_WIDTH;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const arcLength = ring.arcDashed
    ? circumference * Math.max(ring.arcFraction, 0.04)
    : circumference * ring.arcFraction;
  const gapLength = ring.arcDashed ? circumference * 0.06 : circumference - arcLength;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Uncertainty halo — widens as confidence drops, gone once confirmed. */}
        {ring.haloWidth > 0 ? (
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={ring.haloWidth}
            opacity={ring.haloOpacity}
          />
        ) : null}
        {/* Track */}
        <Circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth={STROKE_WIDTH} />
        {/* Progress arc */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={ring.arcDashed ? `${arcLength} ${gapLength}` : `${arcLength} ${circumference}`}
          strokeOpacity={ring.arcDashed ? 0.85 : 1}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      {children}
    </View>
  );
}
