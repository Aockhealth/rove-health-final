import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { toast } from 'sonner-native';
import {
  fetchPendingDoctorNotes,
  fetchAcceptedDoctorNotes,
  respondToDoctorNote,
  type DoctorAction,
  type DoctorNote,
} from '../../lib/doctorShare';
import { scheduleDoctorActionReminders, cancelDoctorActionReminders } from '../../lib/notifications';
import { SectionHeader } from './SectionHeader';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Renders a structured follow-up as a plain sentence. These are advisory
 * restatements of what the doctor tagged — the verbatim note above them is
 * always the authoritative instruction, so nothing here may contradict it or
 * appear without it.
 */
function describeAction(action: DoctorAction): { icon: string; text: string } | null {
  switch (action.type) {
    case 'recheck':
      return {
        icon: 'clipboard',
        text: `Recheck ${action.test} in ${action.inWeeks} week${action.inWeeks === 1 ? '' : 's'}`,
      };
    case 'followup':
      return {
        icon: 'calendar',
        text: `Follow-up appointment in ${action.inWeeks} week${action.inWeeks === 1 ? '' : 's'}`,
      };
    case 'supplement': {
      const verb = { start: 'Start', continue: 'Continue', stop: 'Stop' }[action.action];
      return { icon: 'package', text: `${verb} ${action.product}` };
    }
    default:
      return null;
  }
}

function DoctorIdentity({ note }: { note: DoctorNote }) {
  return (
    <View>
      <Text className="text-base text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
        {note.doctorName}
      </Text>
      <Text className="text-[11px] text-rove-stone">
        {[note.doctorClinic, note.doctorRegistration && `Reg. ${note.doctorRegistration}`]
          .filter(Boolean)
          .join(' · ') || 'No clinic given'}
      </Text>
    </View>
  );
}

/** The clinician's own words. Rendered verbatim, never summarised or translated. */
function NoteBody({ note }: { note: DoctorNote }) {
  const actions = note.actions.map(describeAction).filter(Boolean) as { icon: string; text: string }[];

  return (
    <>
      <Text className="mt-3 text-[15px] leading-6 text-rove-charcoal">“{note.noteText}”</Text>
      {actions.length > 0 ? (
        <View className="mt-3 gap-2">
          {actions.map((a) => (
            <View key={a.text} className="flex-row items-center gap-2">
              <Feather name={a.icon as any} size={12} color="#78716C" />
              <Text className="flex-1 text-xs text-rove-stone">{a.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

/**
 * The doctor loop closing.
 *
 * A reply written through her share link arrives here as *pending*: anyone
 * holding a live link can write, so the app asks her to confirm it came from
 * the doctor she handed it to before it becomes advice she sees in her plan.
 * That gate is the whole reason a stranger with a forwarded link cannot put
 * medical instructions in front of her.
 *
 * Only on acceptance are the structured follow-ups turned into real dated
 * reminders — an unconfirmed note never schedules anything.
 */
export function DoctorNoteCard({ themeColor }: { themeColor: string }) {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<DoctorNote[]>([]);
  const [accepted, setAccepted] = useState<DoctorNote[]>([]);

  const refresh = useCallback(async () => {
    const [p, a] = await Promise.all([fetchPendingDoctorNotes(), fetchAcceptedDoctorNotes()]);
    setPending(p);
    setAccepted(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const respond = async (note: DoctorNote, status: 'accepted' | 'declined') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusyId(note.id);
    const ok = await respondToDoctorNote(note.id, status);
    setBusyId(null);

    if (!ok) {
      toast.error('Could not save that — please try again.');
      return;
    }

    if (status === 'accepted') {
      await scheduleDoctorActionReminders(note.id, note.doctorName, note.actions);
      toast.success('Saved to your plan', {
        description: 'Any follow-up dates are now reminders.',
      });
    } else {
      await cancelDoctorActionReminders(note.id);
      toast.success('Note dismissed', { description: "It won't appear in your plan." });
    }
    void refresh();
  };

  if (loading) return null;
  if (pending.length === 0 && accepted.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-10">
      <SectionHeader icon="user-check" title="From your doctor" color={themeColor} />

      <View className="gap-3">
        {pending.map((note) => (
          <View
            key={note.id}
            className="rounded-[24px] border border-[#B4884A]/25 bg-[#FDF8EE] p-5"
          >
            <View className="flex-row items-start gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#B4884A]/15">
                <Feather name="help-circle" size={16} color="#B4884A" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] font-bold text-[#8A6A38]">
                  Someone replied through your doctor link
                </Text>
                <Text className="mt-1 text-xs leading-4 text-[#8A6A38]/80">
                  They signed it as below. Only accept it if this is the doctor you gave the link
                  to — Rove cannot verify who wrote it.
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl bg-white/70 p-4">
              <DoctorIdentity note={note} />
              <NoteBody note={note} />
              <Text className="mt-3 text-[11px] text-rove-stone">Written {formatWhen(note.createdAt)}</Text>
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => respond(note, 'accepted')}
                disabled={busyId === note.id}
                activeOpacity={0.85}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3"
                style={{ backgroundColor: '#B4884A', opacity: busyId === note.id ? 0.6 : 1 }}
              >
                {busyId === note.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="check" size={13} color="#FFFFFF" />
                )}
                <Text className="text-xs font-bold text-white">Yes, that's my doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => respond(note, 'declined')}
                disabled={busyId === note.id}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 rounded-2xl border border-stone-300 px-4 py-3"
                style={{ opacity: busyId === note.id ? 0.6 : 1 }}
              >
                <Feather name="x" size={13} color="#78716C" />
                <Text className="text-xs font-bold text-stone-600">No</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {accepted.map((note) => (
          <View key={note.id} className="rounded-[24px] border border-white/60 bg-white/70 p-5">
            <View className="flex-row items-start gap-3">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <Feather name="user-check" size={16} color={themeColor} />
              </View>
              <View className="flex-1">
                <DoctorIdentity note={note} />
                <NoteBody note={note} />
                <Text className="mt-3 text-[11px] text-rove-stone">
                  Written {formatWhen(note.createdAt)} · confirmed by you
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text className="mt-3 px-2 text-[11px] leading-4 text-rove-stone">
        Notes are shown exactly as written and can't be edited. Rove doesn't verify medical
        credentials, and nothing here replaces a consultation.
      </Text>
    </Animated.View>
  );
}
