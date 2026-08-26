import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet , Platform} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { ChevronDown, ChevronRight, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

export interface LogCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  /** Category color for the icon badge + a soft shadow glow — NOT the card
   * fill. Every card shares one `cardTint` (the current phase color) for
   * its frosted background; tinting each card's whole background by its
   * own category color instead made the page look like clashing color
   * blocks rather than one cohesive screen. */
  accentColor?: string;
  /** Shared frosted-fill tint, passed the same value (the page's current
   * phase color) by every card on the screen so they all read as one
   * consistent wash, matching Home/Plan's single-tint-per-page recipe. */
  cardTint?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  showInfoIcon?: boolean;
  showChevronRight?: boolean;
  onInfoPress?: () => void;
  onChevronRightPress?: () => void;
  /** When set, the info icon (shown automatically) toggles a small tooltip
   * bubble under the header with this text — mirrors the web's hover
   * tooltip on Self Love / Exercise / Hydration / Sleep. Takes precedence
   * over onInfoPress. */
  infoText?: string;
  children?: React.ReactNode;
}

export function LogCard({
  title,
  subtitle,
  icon,
  iconBgColor = '#F5E8E8',
  accentColor,
  cardTint,
  collapsible = true,
  defaultOpen = true,
  showInfoIcon = false,
  showChevronRight = false,
  onInfoPress,
  onChevronRightPress,
  infoText,
  children,
}: LogCardProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showTooltip, setShowTooltip] = useState(false);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 280 }) },
    ],
  }));

  const hasInfo = showInfoIcon || !!infoText;
  const handleInfoPress = () => {
    if (infoText) {
      setShowTooltip((v) => !v);
    } else {
      onInfoPress?.();
    }
  };

  return (
    <Animated.View
      layout={Layout.duration(220)}
      style={[
        styles.card,
        accentColor && { shadowColor: accentColor },
      ]}
    >
      {/* Frosted-glass fill — Blur + soft gradient sheen + the page's shared
          phase tint, the same recipe Home/Plan build their cards from. */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.92)' }]} />
      )}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: cardTint ?? 'rgba(168,162,158,0.12)' },
        ]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity
        activeOpacity={collapsible ? 0.8 : 1}
        onPress={collapsible ? () => setIsOpen((o) => !o) : undefined}
        style={styles.header}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>

        {/* Title + subtitle */}
        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }]}>{title}</Text>
            {hasInfo && (
              <TouchableOpacity onPress={handleInfoPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Info size={14} color="#A8A29E" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {/* Right action */}
        {showChevronRight ? (
          <TouchableOpacity onPress={onChevronRightPress}>
            <ChevronRight size={18} color="#A8A29E" />
          </TouchableOpacity>
        ) : collapsible ? (
          <Animated.View style={chevronStyle}>
            <ChevronDown size={18} color="#A8A29E" />
          </Animated.View>
        ) : null}
      </TouchableOpacity>

      {infoText && showTooltip && (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={styles.tooltipWrap}
        >
          <View style={styles.tooltipCaret} />
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>{infoText}</Text>
          </View>
        </Animated.View>
      )}

      {/* Collapsible body — rendered at its natural size (never a
          pre-measured pixel height), so it can never clip content. The
          previous approach animated to a height captured via onLayout,
          which raced with content that grows across more rows (Body
          Signals/Inner Weather's many chips) and locked in a too-short
          height, chopping the last row off. */}
      {collapsible ? (
        isOpen && (
          <Animated.View
            // entering is iOS-only: on Android, Reanimated's `entering`
            // measures this view before Yoga finishes resolving its layout,
            // and locks that width in for the flex-wrap chip grid inside —
            // no style override (including width: '100%' on this view and
            // chipWrap) can undo it since the bad measurement happens
            // before styles are applied. Result: chips wrap 2-per-row here
            // instead of 4, only on Android. Skipping entering there (exit
            // is unaffected) fixes the wrap without losing the iOS fade.
            entering={Platform.OS === 'ios' ? FadeIn.duration(180) : undefined}
            exiting={FadeOut.duration(120)}
            style={styles.body}
          >
            {children}
          </Animated.View>
        )
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
    // Matches Home/Plan's card shadow recipe (soft, wide lift) instead of
    // the tighter/darker shadow this used to have on its own.
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconContainer: {
    // Web's per-card icon badges (Body Signals, Moods, Hydration, Sleep,
    // Self Love, Disruptors...) are all `rounded-full` — every one of them,
    // checked directly. A rounded-square badge here was a systemic mismatch
    // across nearly every card on the screen.
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#2D2420',
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Raleway-Regular',
    color: '#A8A29E',
    marginTop: 2,
    includeFontPadding: false,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    // Explicit full width instead of relying on implicit flex stretching.
    // On Android this body is an Animated.View driven by a reanimated
    // `entering` animation, and it was laying out narrower than the card —
    // chip grids inside it wrapped to 2 per row where iOS fits 4.
    alignSelf: 'stretch',
    width: '100%',
  },
  tooltipWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tooltipCaret: {
    width: 10,
    height: 10,
    backgroundColor: '#1F1B18',
    marginLeft: 22,
    marginBottom: -5,
    transform: [{ rotate: '45deg' }],
  },
  tooltip: {
    backgroundColor: '#1F1B18',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === 'ios' ? 4 : 0,
  },
  tooltipText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Raleway-Regular',
    color: '#FFFFFF',
  },
});
