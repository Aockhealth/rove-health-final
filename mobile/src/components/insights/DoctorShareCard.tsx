import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Share, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import {
  buildDoctorSnapshot,
  createDoctorShare,
  getActiveDoctorShare,
  revokeDoctorShare,
  buildDoctorShareUrl,
  DEFAULT_VALID_DAYS,
  type CreatedDoctorShare,
  type DoctorShareLink,
} from '../../lib/doctorShare';

type Theme = { color: string; iconBg: string };

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

/**
 * Publishes a frozen snapshot of her health report to a passcode-protected
 * link her doctor can open in any browser, and shows what has happened to it
 * since — whether it was opened, and whether anyone has been guessing at the
 * code.
 *
 * The passcode is shown exactly once, at creation, because it is never stored
 * in plaintext anywhere (see create_doctor_share). That is a deliberate
 * property, not an oversight: losing it costs one tap to regenerate, and the
 * alternative is a recoverable code sitting in the database next to the data
 * it protects.
 */
export function DoctorShareCard({ theme }: { theme: Theme }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<DoctorShareLink | null>(null);
  const [created, setCreated] = useState<CreatedDoctorShare | null>(null);

  const refresh = useCallback(async () => {
    const existing = await getActiveDoctorShare();
    setLink(existing);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy(true);

    const built = await buildDoctorSnapshot();
    if (!built.ok) {
      setBusy(false);
      toast.error(
        built.reason === 'no-data' ? 'Not enough logged yet' : 'Could not prepare your report',
        {
          description:
            built.reason === 'no-data'
              ? 'Log a few days first — there needs to be something for a doctor to read.'
              : 'Please try again in a moment.',
        },
      );
      return;
    }

    const result = await createDoctorShare(built.snapshot);
    setBusy(false);

    if (!result) {
      toast.error('Could not create the link', { description: 'Please try again in a moment.' });
      return;
    }

    setCreated(result);
    void refresh();
  };

  // The link and the code deliberately go out as two separate share actions.
  // Sending both in one message defeats the passcode entirely — whoever the
  // message is forwarded to has everything.
  const shareLink = async (url: string) => {
    try {
      await Share.share({
        message: `My Rove health report: ${url}\n\nIt will ask for a 4-digit code — I'll send that separately.`,
        url,
      });
    } catch {
      // Dismissed the share sheet — not an error.
    }
  };

  const sharePasscode = async (passcode: string) => {
    try {
      await Share.share({ message: `The code for my Rove health report: ${passcode}` });
    } catch {
      // Dismissed.
    }
  };

  const handleRevoke = async () => {
    if (!link) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBusy(true);
    const ok = await revokeDoctorShare(link.id);
    setBusy(false);
    if (!ok) {
      toast.error('Could not turn off the link');
      return;
    }
    setLink(null);
    toast.success('Link turned off', { description: 'It will no longer open for anyone.' });
  };

  return (
    <View className="mt-4 rounded-[28px] border border-rove-stone/10 bg-white/80 p-6">
      <View className="items-center">
        <View
          className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white"
          style={{ shadowColor: theme.color, shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Feather name="send" size={22} color={theme.color} />
        </View>
        <Text className="mb-2 text-2xl text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Share with your doctor
        </Text>
        <Text className="mb-5 max-w-[280px] text-center text-rove-stone">
          A link your gynaecologist can open in any browser — no app, no account. He can write one
          line back, and it comes to you here.
        </Text>
      </View>

      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={theme.color} />
        </View>
      ) : link ? (
        <ActiveLinkState
          link={link}
          theme={theme}
          busy={busy}
          onShare={() => shareLink(buildDoctorShareUrl(link.token))}
          onRegenerate={handleCreate}
          onRevoke={handleRevoke}
        />
      ) : (
        <>
          <View className="mb-5 gap-3">
            {[
              { icon: 'lock', text: 'Protected by a 4-digit code you read out to him — the link alone is not enough' },
              { icon: 'clock', text: `Expires by itself after ${DEFAULT_VALID_DAYS} days` },
              { icon: 'camera-off', text: 'A frozen copy of your report, not a live window into your account' },
              { icon: 'message-square', text: 'His reply comes back for you to confirm before it appears in your plan' },
            ].map((row) => (
              <View key={row.text} className="flex-row items-center gap-3">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme.iconBg }}
                >
                  <Feather name={row.icon as any} size={13} color={theme.color} />
                </View>
                <Text className="flex-1 text-sm text-rove-charcoal">{row.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={busy}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
            style={{ backgroundColor: theme.color, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="send" size={16} color="#FFFFFF" />
            )}
            <Text className="text-sm font-bold tracking-wide text-white">
              {busy ? 'Preparing your report…' : 'Create doctor link'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <PasscodeReveal
        created={created}
        theme={theme}
        onClose={() => setCreated(null)}
        onShareLink={shareLink}
        onSharePasscode={sharePasscode}
      />
    </View>
  );
}

function ActiveLinkState({
  link,
  theme,
  busy,
  onShare,
  onRegenerate,
  onRevoke,
}: {
  link: DoctorShareLink;
  theme: Theme;
  busy: boolean;
  onShare: () => void;
  onRegenerate: () => void;
  onRevoke: () => void;
}) {
  const remaining = daysUntil(link.expiresAt);

  return (
    <>
      {link.isLocked ? (
        // Ten wrong codes is not a typo. Say so plainly — she is the only one
        // who can act on it, and "someone tried" is information she is owed.
        <View className="mb-4 flex-row items-start gap-2 rounded-2xl bg-[#FDF2F2] p-3">
          <Feather name="alert-triangle" size={14} color="#AF6B6B" style={{ marginTop: 2 }} />
          <Text className="flex-1 text-xs leading-4 text-[#AF6B6B]">
            This link locked itself after 10 wrong codes. If that wasn't your doctor mistyping,
            someone else has the link — make a new one, and the old one dies with it.
          </Text>
        </View>
      ) : (
        <View className="mb-4 flex-row items-start gap-2 rounded-2xl bg-stone-50/80 p-3">
          <Feather
            name={link.lastViewedAt ? 'check-circle' : 'clock'}
            size={14}
            color={link.lastViewedAt ? '#5C8A6E' : '#78716C'}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-xs leading-4 text-stone-500">
            {link.lastViewedAt
              ? `Opened ${link.viewCount === 1 ? 'once' : `${link.viewCount} times`}, last on ${formatWhen(link.lastViewedAt)}.`
              : 'Not opened yet.'}{' '}
            {remaining === 0 ? 'Expires today.' : `Expires in ${remaining} day${remaining === 1 ? '' : 's'}.`}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onShare}
        disabled={busy}
        activeOpacity={0.85}
        className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        style={{ backgroundColor: theme.color, opacity: busy ? 0.6 : 1 }}
      >
        <Feather name="share-2" size={16} color="#FFFFFF" />
        <Text className="text-sm font-bold tracking-wide text-white">Send the link again</Text>
      </TouchableOpacity>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onRegenerate}
          disabled={busy}
          activeOpacity={0.85}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          <Feather name="refresh-cw" size={13} color="#78716C" />
          <Text className="text-xs font-bold text-stone-600">New link & code</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRevoke}
          disabled={busy}
          activeOpacity={0.85}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#AF6B6B]/30 py-3"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          <Feather name="x" size={13} color="#AF6B6B" />
          <Text className="text-xs font-bold text-[#AF6B6B]">Turn off</Text>
        </TouchableOpacity>
      </View>

      <Text className="mt-4 text-center text-[11px] leading-4 text-stone-400">
        A new link gives your doctor a freshly updated report and a new code. The old link stops
        working immediately.
      </Text>
    </>
  );
}

/**
 * The one moment the passcode exists in readable form. Deliberately a blocking
 * modal rather than a toast — she needs to write it down or read it out before
 * this closes, and there is no second chance to see it.
 */
function PasscodeReveal({
  created,
  theme,
  onClose,
  onShareLink,
  onSharePasscode,
}: {
  created: CreatedDoctorShare | null;
  theme: Theme;
  onClose: () => void;
  onShareLink: (url: string) => void;
  onSharePasscode: (passcode: string) => void;
}) {
  return (
    <Modal visible={!!created} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="max-h-[85%] w-full max-w-[360px] rounded-[28px] bg-[#FAF9F6] p-6">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              className="mb-2 text-center text-2xl text-rove-charcoal"
              style={{ fontFamily: 'CormorantGaramond-Bold' }}
            >
              Your link is ready
            </Text>
            <Text className="mb-5 text-center text-sm leading-5 text-rove-stone">
              Send the link and the code separately — by different apps if you can. Anyone holding
              both can read your report.
            </Text>

            <View className="mb-4 items-center rounded-2xl border border-stone-200 bg-white py-5">
              <Text className="mb-1 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                4-digit code
              </Text>
              <Text
                className="text-4xl text-rove-charcoal"
                style={{ fontFamily: 'CormorantGaramond-Bold', letterSpacing: 8 }}
              >
                {created?.passcode}
              </Text>
            </View>

            <View className="mb-5 flex-row items-start gap-2 rounded-2xl bg-[#FDF8EE] p-3">
              <Feather name="alert-circle" size={13} color="#B4884A" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs leading-4 text-[#8A6A38]">
                You won't be shown this code again — it isn't stored anywhere we can read it. If you
                lose it, make a new link.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => created && onShareLink(created.url)}
              activeOpacity={0.85}
              className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl py-4"
              style={{ backgroundColor: theme.color }}
            >
              <Feather name="share-2" size={16} color="#FFFFFF" />
              <Text className="text-sm font-bold tracking-wide text-white">Send the link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => created && onSharePasscode(created.passcode)}
              activeOpacity={0.85}
              className="mb-3 flex-row items-center justify-center gap-2 rounded-2xl border border-stone-200 py-3"
            >
              <Feather name="key" size={13} color="#78716C" />
              <Text className="text-xs font-bold text-stone-600">Send the code separately</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="py-2">
              <Text className="text-center text-xs font-bold text-stone-400">
                I've saved the code — done
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
