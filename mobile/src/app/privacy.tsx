import React from 'react';
import { Platform,  View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
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
        <Text className="text-lg text-rove-charcoal ml-2" style={{ fontFamily: 'Raleway-Medium' }}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-12" showsVerticalScrollIndicator={false}>
        <View className="inline-flex flex-row items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-rove-stone/10 self-start">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-rove-stone">Transparency</Text>
        </View>

        <Text className="text-4xl text-rove-charcoal mb-2" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Your body.
        </Text>
        <Text className="text-4xl text-[#AF6B6B] mb-6 italic" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
          Your data.
        </Text>
        
        <Text className="text-base text-rove-stone mb-8 leading-relaxed font-medium">
          At Rove Health, your privacy is our highest priority. We believe female health data demands radical protection.
        </Text>

        <View className="gap-8 mb-12">
          {/* Section 1 */}
          <View className={`bg-white rounded-3xl p-6 border border-[#AF6B6B]/20 ${Platform.OS === 'ios' ? 'shadow-sm' : ''}`}>
            <Text className="text-xl text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              1. We Do Not Sell Your Data
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed font-medium">
              Rove Health has a fundamental commitment to your privacy: we do not, and will never, sell, trade, or rent your personal health information to third parties, advertisers, or data brokers. Your reproductive health data is yours.
            </Text>
          </View>

          {/* Section 2 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              2. Information We Collect
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-4">
              We only collect the information necessary to provide you with insights, cycle tracking, and holistic recommendations.
            </Text>
            <View className="gap-3">
              <View className="bg-white/60 rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-sm text-rove-charcoal font-semibold mb-1">Account Information</Text>
                <Text className="text-sm text-rove-stone leading-relaxed">When you create an account, we collect your name, email address, and secure password credentials.</Text>
              </View>
              <View className="bg-white/60 rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-sm text-rove-charcoal font-semibold mb-1">Health and Cycle Logs</Text>
                <Text className="text-sm text-rove-stone leading-relaxed">We collect data you voluntarily input, such as cycle dates, flow severity, symptoms, moods, and biometric data.</Text>
              </View>
              <View className="bg-white/60 rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-sm text-rove-charcoal font-semibold mb-1">Device and Usage Data</Text>
                <Text className="text-sm text-rove-stone leading-relaxed">We automatically collect standard diagnostic data to improve app stability and user experience.</Text>
              </View>
            </View>
          </View>

          {/* Section 3 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              3. Identity Firewall & Security
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-3">
              To radically reduce exposure, we maintain a hard infrastructure boundary between your identity and your health data.
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              Your personally identifiable information is stored in a highly secure, separate database from your daily cycle logs. Under normal operating bounds, your health data is stored using anonymous identifiers. All data is encrypted in transit and at rest.
            </Text>
          </View>

          {/* Section 4 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              4. Medical Disclaimer
            </Text>
            <View className="gap-3 bg-white p-5 rounded-2xl border border-rove-stone/10">
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Not Medical Advice: </Text>
                Rove is a wellness tracking and lifestyle application. The insights and recommendations provided are strictly for informational purposes.
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• No Diagnosis: </Text>
                The app does not intend to diagnose, cure, treat, or prevent any medical condition (including but not limited to PCOS, endometriosis, or infertility).
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Professional Care: </Text>
                Always consult a qualified healthcare professional for medical diagnosis and advice before making major lifestyle changes.
              </Text>
            </View>
          </View>

          {/* Section 5 */}
          <View className="bg-[#AF6B6B]/5 p-6 rounded-3xl border border-[#AF6B6B]/10">
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              5. AI Privacy and Safeguards
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed font-medium mb-4">
              Rove Health utilizes advanced Artificial Intelligence to generate bespoke insights and phase-based recommendations. To protect your privacy:
            </Text>
            <View className="gap-3">
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• Anonymized Processing: </Text>
                Before any internal or external AI processing occurs, your personal identifiers are stripped. The AI only analyzes raw cycle characteristics.
              </Text>
              <Text className="text-sm text-rove-stone leading-relaxed">
                <Text className="font-semibold text-rove-charcoal">• No Model Training: </Text>
                Your individual health logs are isolated and are not used to train global generative AI models.
              </Text>
            </View>
          </View>

          {/* Section 6 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              6. How We Share Information
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-4">
              We strictly limit an outside party's access to your data. We only share information in the following circumstances:
            </Text>
            <View className="gap-3">
              <View className="bg-white rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-sm text-rove-charcoal font-semibold mb-1">Service Providers</Text>
                <Text className="text-sm text-rove-stone leading-relaxed">We use trusted third-party cloud infrastructure to operate our Services. These providers are strictly bound by confidentiality agreements.</Text>
              </View>
              <View className="bg-white rounded-2xl p-4 border border-rove-stone/10">
                <Text className="text-sm text-rove-charcoal font-semibold mb-1">Legal Compliance</Text>
                <Text className="text-sm text-rove-stone leading-relaxed">We will only disclose your information if required to do so by a legally binding subpoena. We actively challenge broad or overly invasive requests.</Text>
              </View>
            </View>
          </View>

          {/* Section 7 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              7. Your Rights & Controls
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-4">
              You have absolute control over your profile. At any time, you can:
            </Text>
            <View className="gap-3">
              <View className="bg-white p-5 rounded-2xl border border-rove-stone/10 items-center">
                <Text className="font-bold text-rove-charcoal mb-1">Access Your Data</Text>
                <Text className="text-xs text-rove-stone text-center">Request a complete export of your health logs via your Profile Settings.</Text>
              </View>
              <View className="bg-[#AF6B6B]/5 p-5 rounded-2xl border border-[#AF6B6B]/10 items-center">
                <Text className="font-bold text-rove-charcoal mb-1">Delete Your Account</Text>
                <Text className="text-xs text-rove-stone/80 text-center">Request a full deletion of your account. All associated health data is permanently wiped.</Text>
              </View>
            </View>
          </View>

          {/* Section 8 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              8. Children's Privacy
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              Our Services are not designed or directed toward individuals under the age of 18. We do not knowingly collect personal information from individuals under 18 without explicit parental consent.
            </Text>
          </View>

          {/* Section 9 */}
          <View>
            <Text className="text-lg text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              9. Updates to this Policy
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed">
              We may update this Privacy Policy periodically. If we make material changes, we will notify you within the App or via email, and you will be asked to review and consent to the new terms at an onboarding checkpoint.
            </Text>
          </View>

          {/* Section 10 */}
          <View className="border-t border-rove-stone/10 pt-8 mt-4 items-center">
            <Text className="text-xl text-rove-charcoal mb-3" style={{ fontFamily: 'CormorantGaramond-Bold' }}>
              10. Contact Us
            </Text>
            <Text className="text-sm text-rove-stone leading-relaxed mb-4 text-center">
              If you have any questions, concerns, or data requests, please reach out directly to our privacy team at rovehealthofficial@gmail.com
            </Text>
          </View>
          
          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
