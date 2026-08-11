import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { toast } from 'sonner-native';
import { shareHealthReportPdf, type PreparedReport } from '../../lib/healthReport';

/**
 * Shows the report inside the app before it becomes a file. The WebView renders the
 * same HTML that expo-print turns into the PDF, so what the user reads here is exactly
 * what a doctor receives — no second template to keep in sync.
 */
export function HealthReportViewer({
  prepared,
  accentColor,
  onClose,
}: {
  prepared: PreparedReport | null;
  accentColor: string;
  onClose: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!prepared) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    const ok = await shareHealthReportPdf(prepared);
    setIsExporting(false);
    if (!ok) {
      toast.error('Could not export the PDF', { description: 'Please try again in a moment.' });
    }
  };

  return (
    <Modal
      visible={prepared !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-stone-100 px-4 py-3">
          <TouchableOpacity onPress={onClose} hitSlop={12} activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-stone-500">Close</Text>
          </TouchableOpacity>
          <Text className="text-base text-stone-800" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
            Health Report
          </Text>
          {/* Balances the header so the title stays optically centred. */}
          <View style={{ width: 44 }} />
        </View>

        {prepared ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: prepared.html }}
            style={{ flex: 1 }}
            // The report is locally generated HTML with no links or scripts; keeping
            // navigation and JS off means the viewer can't be led anywhere else.
            javaScriptEnabled={false}
            scalesPageToFit={Platform.OS === 'android'}
            showsVerticalScrollIndicator
          />
        ) : null}

        <View className="border-t border-stone-100 px-4 py-3">
          <TouchableOpacity
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
            style={{ backgroundColor: accentColor, opacity: isExporting ? 0.6 : 1 }}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="share" size={16} color="#FFFFFF" />
            )}
            <Text className="text-sm font-bold tracking-wide text-white">
              {isExporting ? 'Preparing PDF…' : 'Save or Share as PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
