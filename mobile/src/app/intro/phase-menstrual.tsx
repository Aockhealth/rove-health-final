import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { PhaseEducationScreen } from '../../components/intro/PhaseEducationScreen';

export default function PhaseMenstrualIntro() {
  return (
    <PhaseEducationScreen
      stepIndex={1}
      totalSteps={4}
      phaseName="Menstrual"
      tagline="The reset"
      color="#AF6B6B"
      description="Estrogen and progesterone are both at their lowest. Your body sheds the lining it built up, and energy is often lower too. This is the phase built for rest, not for pushing."
      nextHref="/intro/phase-follicular"
      icon={
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Circle cx={90} cy={90} r={70} fill="none" stroke="#AF6B6B" strokeWidth={1.5} strokeDasharray="2 6" />
          <Path d="M90 55 C102 62 108 74 100 88 C94 98 90 110 90 125" stroke="#AF6B6B" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M90 55 C82 63 78 72 82 82 C86 92 90 92 90 92 C90 92 94 92 98 82 C102 72 98 63 90 55 Z" fill="#AF6B6B" opacity={0.85} />
        </Svg>
      }
    />
  );
}
