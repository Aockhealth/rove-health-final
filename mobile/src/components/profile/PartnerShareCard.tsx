import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { Link, ChevronRight, X } from 'lucide-react-native';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import {
  buildShareUrl,
  createShareLink,
  getActiveShareLink,
  revokeShareLink,
  type ShareLink,
} from '../../lib/partnerShare';
import { getLocalizedFontFamily } from '../../lib/fonts';

type State = 'loading' | 'idle' | 'busy';

/**
 * A read-only, token-based link a partner can open to see today's fertile-
 * window status — no second Rove account, no login for them. Only rendered
 * in TTC mode (see where this is used on the Profile screen).
 */
export function PartnerShareCard() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<State>('loading');
  const [link, setLink] = useState<ShareLink | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveShareLink().then((existing) => {
      if (!cancelled) {
        setLink(existing);
        setState('idle');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async () => {
    setState('busy');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const created = await createShareLink();
    setState('idle');
    if (!created) {
      toast.error(t('profile.partnerShare.createFailed.title'), {
        description: t('profile.partnerShare.createFailed.description'),
      });
      return;
    }
    setLink(created);
    void openShareSheet(created);
  };

  const openShareSheet = async (l: ShareLink) => {
    try {
      const url = buildShareUrl(l.token);
      await Share.share({ message: t('profile.partnerShare.shareMessage', { url }), url });
    } catch {
      // User dismissed the share sheet — not an error.
    }
  };

  const handleRevoke = async () => {
    if (!link) return;
    setState('busy');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ok = await revokeShareLink(link.id);
    setState('idle');
    if (!ok) {
      toast.error(t('profile.partnerShare.revokeFailed'));
      return;
    }
    setLink(null);
    toast.success(t('profile.partnerShare.revokedTitle'), {
      description: t('profile.partnerShare.revokedDescription'),
    });
  };

  return (
    <View className="gap-2">
      <Text className="px-2 text-lg text-stone-800" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
        {t('profile.partnerShare.title')}
      </Text>
      <View className="overflow-hidden rounded-2xl border border-white/50 bg-white/60">
        <TouchableOpacity
          onPress={link ? () => openShareSheet(link) : handleGenerate}
          disabled={state !== 'idle'}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-100">
              {state === 'loading' || state === 'busy' ? (
                <ActivityIndicator size="small" color="#78716C" />
              ) : (
                <Link size={16} color="#78716C" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-stone-700">
                {link ? t('profile.partnerShare.shareAgain') : t('profile.partnerShare.shareCta')}
              </Text>
              <Text className="text-xs text-stone-400" numberOfLines={2}>
                {link ? t('profile.partnerShare.activeDescription') : t('profile.partnerShare.inactiveDescription')}
              </Text>
            </View>
          </View>
          {state === 'idle' ? <ChevronRight size={16} color="#D6D3D1" /> : null}
        </TouchableOpacity>

        {link ? (
          <TouchableOpacity
            onPress={handleRevoke}
            disabled={state !== 'idle'}
            className="flex-row items-center gap-2 border-t border-black/[0.04] px-4 py-3"
          >
            <X size={13} color="#AF6B6B" />
            <Text className="text-xs font-bold text-[#AF6B6B]">{t('profile.partnerShare.turnOffLink')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
