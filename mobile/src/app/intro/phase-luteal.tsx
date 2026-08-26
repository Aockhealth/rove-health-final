import React from 'react';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { PhaseEducationScreen } from '../../components/intro/PhaseEducationScreen';

export default function PhaseLutealIntro() {
  const router = useRouter();

  return (
    <PhaseEducationScreen
      stepIndex={4}
      totalSteps={4}
      phaseName="Luteal"
      tagline="The wind-down"
      color="#7B82A8"
      description="Progesterone rises, then falls if there's no pregnancy. Appetite and the need for rest often climb as the phase goes on. This is a good stretch for slower plans and finishing what's already started."
      nextLabel="Go to Dashboard"
      onNext={() => router.replace('/(app)/home')}
      icon={
        <Svg width={180} height={180} viewBox="0 0 180 180">
          <Circle cx={90} cy={90} r={70} fill="none" stroke="#7B82A8" strokeWidth={1.5} strokeDasharray="2 6" />
          <Circle cx={90} cy={90} r={34} fill="#7B82A8" opacity={0.9} />
          <Circle cx={102} cy={80} r={29} fill="#FAF9F6" />
        </Svg>
      }
    />
  );
}
