import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchSharedFertilityStatus, type SharedFertilityStatus } from '../../lib/partnerShare';

/**
 * Public, unauthenticated read-only view of a partner's fertile-window
 * status — reached via a shareable link (see PartnerShareCard and
 * partnerShare.ts), never behind login. Deliberately shows far less than the
 * app itself: a status label and a date range, nothing about anovulatory
 * signals, confidence internals, or her logged readings — the
 * get_shared_fertility_status RPC this calls enforces that same narrow
 * subset server-side, so this screen isn't the only thing keeping the rest
 * private.
 */

const STATUS_LABEL: Record<string, string> = {
  insufficient_data: 'Not tracking yet',
  monitoring: 'Cycle in progress',
  fertile_window: 'In the fertile window',
  ovulation_likely: 'Ovulation likely soon',
  ovulation_confirmed: 'Ovulation confirmed',
};

const STATUS_COLOR: Record<string, string> = {
  insufficient_data: '#A8A29E',
  monitoring: '#A8A29E',
  fertile_window: '#D4A25F',
  ovulation_likely: '#D4A25F',
  ovulation_confirmed: '#5C8A6E',
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export default function SharedFertilityScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const { data, isPending } = useQuery<SharedFertilityStatus | null>({
    queryKey: ['shared-fertility-status', token],
    queryFn: () => fetchSharedFertilityStatus(token),
    enabled: !!token,
    staleTime: 60 * 1000,
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAF9F6]">
      <View className="flex-1 items-center justify-center px-8">
        {isPending ? (
          <ActivityIndicator size="large" color="#A8A29E" />
        ) : !data ? (
          <View className="items-center gap-2">
            <Text className="text-center text-xl text-stone-700" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              This link isn't active
            </Text>
            <Text className="text-center text-sm text-stone-400">
              It may have been turned off, or nothing has been tracked yet.
            </Text>
          </View>
        ) : (
          <View className="w-full items-center gap-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-stone-400">Rove</Text>
            <View
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[data.status] || '#A8A29E' }}
            />
            <Text
              className="text-center text-2xl text-stone-800"
              style={{ fontFamily: 'CormorantGaramond-Bold' }}
            >
              {STATUS_LABEL[data.status] || 'Cycle in progress'}
            </Text>

            {data.fertileWindowStart && data.fertileWindowEnd ? (
              <Text className="text-center text-sm text-stone-500">
                Fertile window: {formatDate(data.fertileWindowStart)} – {formatDate(data.fertileWindowEnd)}
              </Text>
            ) : null}

            {data.confirmedDate ? (
              <Text className="text-center text-sm text-stone-500">
                Ovulation confirmed around {formatDate(data.confirmedDate)}
              </Text>
            ) : data.predictedDate ? (
              <Text className="text-center text-sm text-stone-500">
                Ovulation expected around {formatDate(data.predictedDate)}
              </Text>
            ) : null}

            <Text className="mt-4 max-w-[280px] text-center text-[11px] leading-relaxed text-stone-400">
              This is a read-only summary shared from Rove. It doesn't show daily logs, symptoms, or anything
              else in her account.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
