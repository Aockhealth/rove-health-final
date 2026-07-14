import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const phases = [
  { name: 'Menstrual', color: 'bg-phase-menstrual' },
  { name: 'Follicular', color: 'bg-phase-follicular' },
  { name: 'Ovulatory', color: 'bg-phase-ovulatory' },
  { name: 'Luteal', color: 'bg-phase-luteal' },
] as const;

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="flex-1 items-center justify-center gap-8 px-8">
        <View className="items-center gap-2">
          <Text className="text-4xl text-rove-charcoal">Rove Health</Text>
          <Text className="text-base text-rove-stone">Native app · Phase 0</Text>
        </View>

        <View className="flex-row gap-4">
          {phases.map((phase) => (
            <View key={phase.name} className="items-center gap-2">
              <View className={`h-12 w-12 rounded-full ${phase.color}`} />
              <Text className="text-xs text-rove-charcoal">{phase.name}</Text>
            </View>
          ))}
        </View>

        <View className="rounded-2xl bg-rove-peach px-6 py-4">
          <Text className="text-sm text-rove-charcoal">
            If you can read this on your phone, Phase 0 is complete.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
