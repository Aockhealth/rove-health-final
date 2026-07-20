import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { ChevronDown, ChevronRight, Info } from 'lucide-react-native';

export interface LogCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  /** Category/phase color for a themed card border + shadow tint, matching
   * the web's per-card `border-[#HEX]/30` treatment. Omit for the plain
   * neutral card border. */
  accentColor?: string;
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
  collapsible = true,
  defaultOpen = true,
  showInfoIcon = false,
  showChevronRight = false,
  onInfoPress,
  onChevronRightPress,
  infoText,
  children,
}: LogCardProps) {
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
        accentColor && { borderWidth: 1, borderColor: `${accentColor}4D`, shadowColor: accentColor },
      ]}
    >
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
            <Text style={styles.title}>{title}</Text>
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
            entering={FadeIn.duration(180)}
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    width: 38,
    height: 38,
    borderRadius: 12,
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
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A8A29E',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    elevation: 4,
  },
  tooltipText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
});
