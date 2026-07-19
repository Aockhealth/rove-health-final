import React from 'react';
import { View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton } from '../ui/Skeleton';

const { width } = Dimensions.get('window');

export function LearnSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pb-2 pt-1 flex-row items-center justify-between">
        <Skeleton style={{ width: 90, height: 28, borderRadius: 8 }} />
        <Skeleton style={{ width: 36, height: 36, borderRadius: 18 }} />
      </View>

      <View className="flex-row px-5 py-3 gap-2">
        <Skeleton style={{ width: 60, height: 36, borderRadius: 999 }} />
        <Skeleton style={{ width: 90, height: 36, borderRadius: 999 }} />
        <Skeleton style={{ width: 120, height: 36, borderRadius: 999 }} />
      </View>

      <Skeleton style={{ width, height: width * 1.1, borderRadius: 0 }} />

      {[0, 1].map((row) => (
        <View key={row} className="mt-6">
          <Skeleton style={{ width: 140, height: 22, borderRadius: 6, marginLeft: 20, marginBottom: 12 }} />
          <View className="flex-row px-5 gap-3">
            {[0, 1, 2].map((card) => (
              <Skeleton key={card} style={{ width: 160, height: 200, borderRadius: 16 }} />
            ))}
          </View>
        </View>
      ))}
    </SafeAreaView>
  );
}
