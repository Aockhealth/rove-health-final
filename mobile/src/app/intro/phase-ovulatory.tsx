import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { PhaseEducationScreen } from '../../components/intro/PhaseEducationScreen';

const PETAL = 'M90 90 C86 76 84 62 90 48 C96 62 94 76 90 90 Z';

export default function PhaseOvulatoryIntro() {
  return (
    <PhaseEducationScreen
      stepIndex={3}
      totalSteps={4}
      phaseName="Ovulatory"
      tagline="The peak"
      color="#D4A25F"
      description="A surge in LH triggers the release of an egg. Energy, confidence and sociability are usually at their highest here, and it's the fertile window if you're trying to conceive."
      nextHref="/intro/phase-luteal"
      icon={
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Circle cx={90} cy={90} r={70} fill="none" stroke="#D4A25F" strokeWidth={1.5} strokeDasharray="2 6" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.95} transform="rotate(0 90 90)" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.8} transform="rotate(60 90 90)" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.95} transform="rotate(120 90 90)" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.8} transform="rotate(180 90 90)" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.95} transform="rotate(240 90 90)" />
          <Path d={PETAL} fill="#D4A25F" opacity={0.8} transform="rotate(300 90 90)" />
          <Circle cx={90} cy={90} r={7} fill="#FFFFFF" />
          <Circle cx={90} cy={90} r={7} fill="none" stroke="#AF6B6B" strokeWidth={1} />
        </Svg>
      }
    />
  );
}
