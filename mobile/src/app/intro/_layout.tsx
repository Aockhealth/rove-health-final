import { Stack } from 'expo-router';

export default function IntroLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAF9F6' },
      }}
    >
      <Stack.Screen name="why-matters" />
      <Stack.Screen name="plan" />
      <Stack.Screen name="phase-menstrual" />
      <Stack.Screen name="phase-follicular" />
      <Stack.Screen name="phase-ovulatory" />
      <Stack.Screen name="phase-luteal" />
    </Stack>
  );
}
