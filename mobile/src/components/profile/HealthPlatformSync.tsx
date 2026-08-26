import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Watch, ChevronRight, Check } from 'lucide-react-native';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  healthPlatformLabel,
  requestHealthSyncPermissions,
  openHealthPlatformSettings,
  syncHealthData,
} from '../../lib/healthSync';
import { registerHealthBackgroundSync } from '../../lib/healthBackgroundSync';
import { getLocalizedFontFamily } from '../../lib/fonts';

type SyncState = 'idle' | 'syncing' | 'synced';

/**
 * Sync with Apple Health / Android Health Connect. Reads basal temperature,
 * sleep, and fertility-test/period signals to fill in gaps in her log; when
 * she logs BBT or a period day in Rove, that's written back too (see
 * writeHealthData in ./healthSync) — nothing else, in either direction.
 * Renders nothing on web, where neither platform exists.
 */
export function HealthPlatformSync() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<SyncState>('idle');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const platformLabel = healthPlatformLabel();
  if (!platformLabel) return null;

  const handleSync = async () => {
    setState('syncing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const granted = await requestHealthSyncPermissions();
      if (!granted) {
        toast.error(t('profile.healthSync.permissionNeeded.title'), {
          description: t('profile.healthSync.permissionNeeded.description', { platform: platformLabel }),
          action: {
            label: t('profile.healthSync.permissionNeeded.action', { platform: platformLabel }),
            onClick: openHealthPlatformSettings,
          },
        });
        setState('idle');
        return;
      }
      const result = await syncHealthData(30);
      setState('synced');
      setLastResult(
        result.fieldsWritten > 0
          ? t('profile.healthSync.filledIn', { count: result.fieldsWritten })
          : t('profile.healthSync.upToDate')
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Now that access is confirmed granted, keep it flowing without her
      // needing to reopen this screen — best-effort, never blocks the
      // success state above if registration itself fails.
      void registerHealthBackgroundSync();
    } catch (err) {
      console.error('[HealthPlatformSync] sync failed', err);
      setState('idle');
      toast.error(t('profile.healthSync.syncFailed.title'), {
        description: t('profile.healthSync.syncFailed.description'),
      });
    }
  };

  return (
    <View className="gap-2">
      <Text
        className="px-2 text-lg text-stone-800"
        style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
      >
        {t('profile.healthSync.title')}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-white/50 bg-white/60">
        <TouchableOpacity
          onPress={handleSync}
          disabled={state === 'syncing'}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
              {state === 'synced' ? <Check size={16} color="#5F7268" /> : <Watch size={16} color="#78716C" />}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-stone-700">{t('profile.healthSync.syncWith', { platform: platformLabel })}</Text>
              <Text className="text-xs text-stone-400" numberOfLines={2}>
                {state === 'syncing'
                  ? t('profile.healthSync.syncing')
                  : lastResult || t('profile.healthSync.description', { platform: platformLabel })}
              </Text>
            </View>
          </View>
          {state !== 'syncing' ? <ChevronRight size={16} color="#D6D3D1" /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}
