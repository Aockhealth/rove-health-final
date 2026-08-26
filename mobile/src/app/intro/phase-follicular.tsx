import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { PhaseEducationScreen } from '../../components/intro/PhaseEducationScreen';

export default function PhaseFollicularIntro() {
  return (
    <PhaseEducationScreen
      stepIndex={2}
      totalSteps={4}
      phaseName="Follicular"
      tagline="The rise"
      color="#8DAA9D"
      description="Estrogen starts climbing here, bringing more energy and focus. It's a good stretch for starting new things. Rove tells you when it's happening."
      nextHref="/intro/phase-ovulatory"
      icon={
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Circle cx={90} cy={90} r={70} fill="none" stroke="#8DAA9D" strokeWidth={1.5} strokeDasharray="2 6" />
          <Path d="M90 130 C89 118 89 106 90 96" stroke="#8DAA9D" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Path d="M90 108 C102 104 112 95 114 83 C115 76 110 73 105 76 C100 79 99 88 90 98 Z" fill="#8DAA9D" opacity={0.92} />
          <Path d="M90 108 C78 104 68 95 66 83 C65 76 70 73 75 76 C80 79 81 88 90 98 Z" fill="#8DAA9D" opacity={0.68} />
          <Circle cx={90} cy={93} r={5.5} fill="#D4A25F" />
        </Svg>
      }
    />
  );
}
