import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View className="flex-row items-center px-4 py-3 border-b border-rove-stone/10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-rove-stone/10"
        >
          <ChevronLeft size={24} color="#37332E" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-rove-charcoal ml-2" style={{ fontFamily: 'Inter-Medium' }}>
          Terms of Service
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-12" showsVerticalScrollIndicator={false}>
        <View className="inline-flex flex-row items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-rove-stone/10 self-start">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-rove-stone">Agreement</Text>
        </View>

        <Text className="text-4xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          The fine print.
        </Text>
        <Text className="text-4xl text-[#AF6B6B] mb-6 italic" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Read with care.
        </Text>

        <Text className="text-base text-rove-stone mb-8 leading-relaxed font-medium">
          These Terms of Service govern your use of Rove Health. By creating an account, you agree to the terms below.
        </Text>

        <Text className="text-xs font-bold text-rove-stone/60 tracking-widest uppercase mb-8">Last Updated: March 2026</Text>

        <View className="gap-8 mb-12">
          {/* Section 1 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              1. Acceptance of Terms
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              By downloading, accessing, or using the Rove Health application (the &quot;App&quot;), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the App. You must be at least 18 years old to use Rove Health.
            </Text>
          </View>

          {/* Section 2 - Medical Disclaimer */}
          <View className="bg-white rounded-3xl p-6 border border-[#AF6B6B]/20 shadow-sm">
            <Text className="text-xl text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              2. Medical Disclaimer
            </Text>
            <View className="gap-3">
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Not Medical Advice: </Text>
                Rove is a wellness tracking and lifestyle application. All content, insights, and recommendations are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• No Diagnosis or Treatment: </Text>
                The App does not diagnose, cure, treat, or prevent any disease or medical condition, including but not limited to PCOS, endometriosis, or infertility.
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Not for Contraception: </Text>
                Rove Health is not a form of birth control and should never be relied upon to prevent or achieve pregnancy.
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Seek Professional Care: </Text>
                Always consult a qualified healthcare professional before making decisions about your health, and in the case of a medical emergency, contact emergency services immediately.
              </Text>
            </View>
          </View>

          {/* Section 3 - AI Disclaimer */}
          <View className="bg-[#AF6B6B]/5 p-6 rounded-3xl border border-[#AF6B6B]/10">
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              3. AI-Generated Content
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              Rove Health uses artificial intelligence to generate personalized insights, plans, and conversational responses. AI-generated content may occasionally be inaccurate or incomplete. It reflects patterns in the information you provide and is not reviewed by a medical professional before being shown to you. Use your own judgment and consult a healthcare provider before acting on any AI-generated insight.
            </Text>
          </View>

          {/* Section 4 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              4. Your Account
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree to provide accurate information and to notify us promptly of any unauthorized use of your account.
            </Text>
          </View>

          {/* Section 5 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              5. Acceptable Use
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-3">
              You agree not to:
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-rove-stone leading-relaxed">• Use the App for any unlawful purpose or in violation of these Terms.</Text>
              <Text className="text-sm text-rove-stone leading-relaxed">• Attempt to reverse engineer, decompile, or extract the source code of the App.</Text>
              <Text className="text-sm text-rove-stone leading-relaxed">• Interfere with or disrupt the App&apos;s infrastructure or security.</Text>
              <Text className="text-sm text-rove-stone leading-relaxed">• Impersonate another person or misrepresent your identity.</Text>
            </View>
          </View>

          {/* Section 6 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              6. Intellectual Property
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              The App, including its design, features, and content (excluding data you submit), is owned by Rove Health and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works from the App without our written permission.
            </Text>
          </View>

          {/* Section 7 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              7. Termination
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              You may stop using the App and delete your account at any time from Profile Settings. We may suspend or terminate your access if you violate these Terms or engage in conduct that harms the App, other users, or Rove Health.
            </Text>
          </View>

          {/* Section 8 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              8. Disclaimer of Warranties &amp; Limitation of Liability
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              The App is provided &quot;as is&quot; without warranties of any kind, express or implied. To the fullest extent permitted by law, Rove Health is not liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the App.
            </Text>
          </View>

          {/* Section 9 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              9. Changes to These Terms
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we will notify you within the App or via email. Continued use of the App after changes take effect constitutes acceptance of the revised Terms.
            </Text>
          </View>

          {/* Section 10 */}
          <View>
            <Text className="text-lg text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              10. Governing Law
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes will be subject to the exclusive jurisdiction of the courts located in India.
            </Text>
          </View>

          {/* Section 11 - Contact */}
          <View className="border-t border-rove-stone/10 pt-8 mt-4 items-center">
            <Text className="text-xl text-rove-charcoal font-bold mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              11. Contact Us
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-4 text-center">
              If you have any questions about these Terms, please reach out to us at rovehealthofficial@gmail.com
            </Text>
          </View>

          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
