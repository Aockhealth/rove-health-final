import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleResetRequest() {
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'rovehealth://reset-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          
          <Link href="/(auth)/login" className="mb-8" asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-white shadow-sm border border-rove-stone/10 items-center justify-center">
              <ArrowLeft size={20} color="#2D2420" />
            </Button>
          </Link>

          <View className="mb-10">
            <Text className="text-3xl font-bold text-rove-charcoal mb-3">
              Reset Password
            </Text>
            <Text className="text-sm text-rove-stone font-medium leading-relaxed">
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </Text>
          </View>

          {!success ? (
            <View className="space-y-4 mb-6 gap-4">
              <View>
                <Text className="text-[10px] font-bold text-rove-charcoal/60 uppercase tracking-[2px] ml-1 mb-2">
                  Email
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Mail size={18} color="#A8A29E" />
                  </View>
                  <Input
                    className="pl-12"
                    placeholder="hello@rove.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    error={error}
                  />
                </View>
              </View>

              <Button 
                onPress={handleResetRequest} 
                disabled={loading}
                className="w-full mt-4 h-14"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
            </View>
          ) : (
            <View className="bg-rove-green/10 border border-rove-green/20 p-6 rounded-3xl items-center mt-2">
              <Text className="text-rove-green font-bold text-lg mb-2">Check your inbox</Text>
              <Text className="text-rove-charcoal/80 text-sm font-medium text-center leading-relaxed">
                We sent a password reset link to <Text className="font-bold">{email}</Text>. Please click the link to reset your password.
              </Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
