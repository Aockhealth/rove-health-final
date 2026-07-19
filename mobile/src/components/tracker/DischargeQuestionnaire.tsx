/**
 * DischargeQuestionnaire
 *
 * Inline expandable 3-question MPIQ questionnaire for Cervical Discharge
 * logging — ported from frontend/src/app/cycle-sync/tracker/components/DischargeCard.tsx.
 * Q1 (Vaginal Fluid) shows looping muted video previews, Q2 (Appearance)
 * shows static photo previews (same assets as web, copied into
 * assets/images/discharge/), and Q3 (Sensation) stays text-only, matching web.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ChevronUp, ChevronDown, Info, X } from 'lucide-react-native';
import { CATEGORY_COLORS } from './constants';

const ACCENT = CATEGORY_COLORS.discharge; // Soft Blue, #7CB9E8 — matches web's DischargeCard theme

// ─── Media assets (ported from frontend/public/images/gifs) ───────────────────
const TACKY_VIDEO = require('../../../assets/images/discharge/tacky.mp4');
const CREAMY_VIDEO = require('../../../assets/images/discharge/creamy.mp4');
const STRETCHY_VIDEO = require('../../../assets/images/discharge/stretchy.mp4');
const BLOODY_VIDEO = require('../../../assets/images/discharge/bloody.mp4');
const WHITE_YELLOW_IMAGE = require('../../../assets/images/discharge/white-yellow-appearance.jpeg');
const CLEAR_IMAGE = require('../../../assets/images/discharge/clear-appearance.jpeg');
const RED_IMAGE = require('../../../assets/images/discharge/red-appearance.jpeg');

// ─── Types ───────────────────────────────────────────────────────────────────
type VaginalFluid = 'Tacky' | 'Creamy' | 'Stretchy' | 'Bloody' | null;
type Appearance = 'White/Yellow' | 'Clear' | 'Red' | null;
type Sensation = 'Dry' | 'Moist' | 'Wet' | 'Slippery' | null;

export interface DischargeAnswers {
  vaginalFluid: VaginalFluid;
  appearance: Appearance;
  sensation: Sensation;
}

export interface DischargeQuestionnaireProps {
  answers: DischargeAnswers;
  onAnswersChange: (a: DischargeAnswers) => void;
}

// ─── Video preview option (Q1: Vaginal Fluid) ─────────────────────────────────
function VideoOption({
  label,
  sublabel,
  source,
  isSelected,
  onPress,
}: {
  label: string;
  sublabel: string;
  source: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.mediaOption, isSelected && styles.mediaOptionSelected]}
    >
      <View style={styles.mediaFrame}>
        <VideoView player={player} style={styles.media} contentFit="cover" nativeControls={false} />
      </View>
      <Text style={[styles.mediaLabel, isSelected && styles.mediaLabelSelected]}>{label}</Text>
      <Text style={styles.mediaSublabel}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

// ─── Photo preview option (Q2: Appearance) ────────────────────────────────────
function PhotoOption({
  label,
  source,
  isSelected,
  onPress,
}: {
  label: string;
  source: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.mediaOption, isSelected && styles.mediaOptionSelected]}
    >
      <View style={styles.mediaFrame}>
        <Image source={source} style={styles.media} resizeMode="cover" />
      </View>
      <Text style={[styles.mediaLabel, isSelected && styles.mediaLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Text pill option (Q3: Sensation — no media on web either) ───────────────
function PillOption({
  label,
  sublabel,
  isSelected,
  onPress,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pillOption, isSelected && styles.pillOptionSelected]}
    >
      <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>{label}</Text>
      {sublabel ? (
        <Text style={[styles.pillSublabel, isSelected && styles.pillSublabelSelected]}>{sublabel}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DischargeQuestionnaire({
  answers,
  onAnswersChange,
}: DischargeQuestionnaireProps) {
  const [expanded, setExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Wave progress bar — fills 33.3% per answered question, matching the
  // web's `waveProgress` calc in DischargeCard.tsx.
  const answeredCount =
    (answers.vaginalFluid ? 1 : 0) + (answers.appearance ? 1 : 0) + (answers.sensation ? 1 : 0);
  const waveStyle = useAnimatedStyle(() => ({
    width: withTiming(`${(answeredCount / 3) * 100}%`, { duration: 400 }),
  }));

  const toggle = <K extends keyof DischargeAnswers>(key: K, val: DischargeAnswers[K]) => {
    onAnswersChange({ ...answers, [key]: answers[key] === val ? null : val });
  };

  return (
    <Animated.View layout={Layout.duration(220)} style={styles.card}>
      {/* Wave progress bar */}
      <View style={styles.waveTrack}>
        <Animated.View style={[styles.waveFill, waveStyle]} />
      </View>

      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={() => setExpanded((e) => !e)}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.iconEmoji}>〰️</Text>
        </View>

        <View style={styles.headerText}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Cervical Discharge</Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowInfo((v) => !v);
                if (!expanded) setExpanded(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Info size={13} color="#A8A29E" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Answer 3 questions for accurate phase prediction
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setExpanded((e) => !e)}
          style={styles.chevronBtn}
        >
          {expanded ? (
            <ChevronUp size={18} color="#A8A29E" />
          ) : (
            <ChevronDown size={18} color="#A8A29E" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {showInfo && (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={styles.infoBox}>
          <TouchableOpacity
            onPress={() => setShowInfo(false)}
            style={styles.infoClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={12} color={ACCENT} />
          </TouchableOpacity>
          <Text style={styles.infoText}>
            This questionnaire (MPIQ) helps predict your cycle phase with{' '}
            <Text style={styles.infoTextBold}>more than 95% accuracy</Text> by analyzing your body's biological
            markers.
          </Text>
        </Animated.View>
      )}

      {/* Expandable body — rendered at natural size (never height-clipped) */}
      {expanded && (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.body}>
          {/* Q1: Vaginal Fluid */}
          <Text style={styles.questionNum}>1. Vaginal Fluid</Text>
          <Text style={styles.questionDesc}>
            On touch and feel, what is the consistency of the discharge?
          </Text>
          <View style={styles.mediaGrid}>
            <VideoOption
              label="Tacky"
              sublabel="Sticky, glue-like"
              source={TACKY_VIDEO}
              isSelected={answers.vaginalFluid === 'Tacky'}
              onPress={() => toggle('vaginalFluid', 'Tacky')}
            />
            <VideoOption
              label="Creamy"
              sublabel="Lotion-like, smooth"
              source={CREAMY_VIDEO}
              isSelected={answers.vaginalFluid === 'Creamy'}
              onPress={() => toggle('vaginalFluid', 'Creamy')}
            />
            <VideoOption
              label="Stretchy"
              sublabel="Raw egg white, elastic"
              source={STRETCHY_VIDEO}
              isSelected={answers.vaginalFluid === 'Stretchy'}
              onPress={() => toggle('vaginalFluid', 'Stretchy')}
            />
            <VideoOption
              label="Bloody"
              sublabel="Red/brown tint"
              source={BLOODY_VIDEO}
              isSelected={answers.vaginalFluid === 'Bloody'}
              onPress={() => toggle('vaginalFluid', 'Bloody')}
            />
          </View>

          <View style={styles.divider} />

          {/* Q2: How does it look? */}
          <Text style={styles.questionNum}>2. How does it look?</Text>
          <Text style={styles.questionDesc}>
            Observe the color and clarity of your cervical fluid.
          </Text>
          <View style={styles.mediaGrid}>
            <PhotoOption
              label="White/Yellow"
              source={WHITE_YELLOW_IMAGE}
              isSelected={answers.appearance === 'White/Yellow'}
              onPress={() => toggle('appearance', 'White/Yellow')}
            />
            <PhotoOption
              label="Clear"
              source={CLEAR_IMAGE}
              isSelected={answers.appearance === 'Clear'}
              onPress={() => toggle('appearance', 'Clear')}
            />
            <PhotoOption
              label="Red"
              source={RED_IMAGE}
              isSelected={answers.appearance === 'Red'}
              onPress={() => toggle('appearance', 'Red')}
            />
          </View>

          <View style={styles.divider} />

          {/* Q3: Vaginal Sensation */}
          <Text style={styles.questionNum}>3. Vaginal Sensation</Text>
          <Text style={styles.questionDesc}>
            How does it feel down there throughout the day?
          </Text>
          <View style={styles.pillGrid}>
            {(
              [
                { label: 'Dry', sublabel: 'No fluid felt' },
                { label: 'Moist', sublabel: 'Slightly damp' },
                { label: 'Wet', sublabel: 'Distinctly wet' },
                { label: 'Slippery', sublabel: 'Lubricated, sliding' },
              ] as { label: NonNullable<Sensation>; sublabel: string }[]
            ).map(({ label, sublabel }) => (
              <PillOption
                key={label}
                label={label}
                sublabel={sublabel}
                isSelected={answers.sensation === label}
                onPress={() => toggle('sensation', label)}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  waveTrack: {
    height: 4,
    backgroundColor: 'rgba(124,185,232,0.15)',
  },
  waveFill: {
    height: '100%',
    backgroundColor: ACCENT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: `${ACCENT}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Outfit-SemiBold',
    color: '#2D2420',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginTop: 2,
  },
  chevronBtn: {
    padding: 4,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: `${ACCENT}14`,
    borderWidth: 1,
    borderColor: `${ACCENT}4D`,
    borderRadius: 16,
    padding: 12,
    paddingRight: 24,
  },
  infoClose: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    color: '#3E6A8A',
  },
  infoTextBold: {
    fontFamily: 'Inter-Bold',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  questionNum: {
    fontSize: 14,
    fontFamily: 'Outfit-SemiBold',
    color: '#2D2420',
    marginBottom: 4,
    marginTop: 4,
  },
  questionDesc: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0ECE8',
    marginVertical: 16,
  },
  // Media grid (2 columns) — video previews (Q1) and photo previews (Q2)
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mediaOption: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E0DB',
    overflow: 'hidden',
    marginBottom: 4,
    alignItems: 'center',
    paddingBottom: 10,
  },
  mediaOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: `${ACCENT}14`,
  },
  mediaFrame: {
    width: '100%',
    height: 90,
    marginBottom: 8,
    backgroundColor: '#EDEDED',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaLabel: {
    fontSize: 13,
    fontFamily: 'Outfit-SemiBold',
    color: '#2D2420',
    marginTop: 2,
  },
  mediaLabelSelected: {
    color: '#1D5E8C',
  },
  mediaSublabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginTop: 1,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  // Pill grid (2 columns)
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillOption: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E0DB',
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
  },
  pillOptionSelected: {
    borderColor: ACCENT,
    backgroundColor: `${ACCENT}14`,
  },
  pillLabel: {
    fontSize: 14,
    fontFamily: 'Outfit-SemiBold',
    color: '#2D2420',
  },
  pillLabelSelected: {
    color: '#1D5E8C',
  },
  pillSublabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginTop: 2,
  },
  pillSublabelSelected: {
    color: ACCENT,
  },
});
