import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function TrackerScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF9F6] items-center justify-center">
      <Text className="text-2xl font-bold text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>Tracker</Text>
      <Text className="text-rove-stone mt-2">Coming soon...</Text>
    </SafeAreaView>
  );
}
