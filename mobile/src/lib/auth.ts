import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Sentry from '@sentry/react-native';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// Google's native errors are terse ("10", "DEVELOPER_ERROR") and a release build has no console
// to read, so translate the ones we can actually act on into plain English.
function describeSignInError(error: any): string {
  const code = String(error?.code ?? '');

  if (code === 'ROVE_NO_ID_TOKEN') {
    return error.message;
  }
  if (code === '10' || code === 'DEVELOPER_ERROR') {
    return 'Google rejected this build (DEVELOPER_ERROR). The signing certificate SHA-1 for com.rovehealth.app is not registered on the Android OAuth client.';
  }
  if (code === String(statusCodes.PLAY_SERVICES_NOT_AVAILABLE)) {
    return 'Google Play Services is missing or out of date on this device.';
  }
  if (code === String(statusCodes.IN_PROGRESS)) {
    return 'A Google sign-in is already in progress.';
  }

  const detail = error?.message || 'Unknown error';
  return code ? `${detail} (code ${code})` : detail;
}

// Uses native Google Sign-In SDK on both iOS and Android.
// Note for iOS: Ensure "Skip nonce checks" is enabled in your Supabase Dashboard
// (Authentication -> Providers -> Google) to avoid nonce mismatch errors.
type SignInResult = { success: boolean; cancelled?: true; error?: string };

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Backing out of the account picker resolves as {type:'cancelled', data:null} rather than
    // throwing, so it has to be checked before touching `data` — otherwise a plain cancel looks
    // like a missing-token failure and shows the user an error they didn't cause.
    if (userInfo.type === 'cancelled') {
      return { success: false, cancelled: true as const };
    }

    // A null token with a successful sign-in means requestIdToken() was never called with a
    // usable web client ID. It must be a *Web application* OAuth client in the same Google Cloud
    // project — an Android or iOS client ID here yields an account with no idToken and no error.
    if (!userInfo.data?.idToken) {
      throw Object.assign(new Error('Google signed the user in but returned no ID token.'), {
        code: 'ROVE_NO_ID_TOKEN',
      });
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    if (String(error?.code) === String(statusCodes.SIGN_IN_CANCELLED)) {
      return { success: false, cancelled: true as const };
    }

    console.error('OAuth error:', error?.code, error);
    Sentry.captureException(error, { tags: { flow: 'google-sign-in' } });
    return { success: false, error: describeSignInError(error) };
  }
};

export const signInWithApple = async () => {
  try {
    // Supabase checks that the nonce inside Apple's identityToken matches what we told
    // Apple to sign — it needs the raw value, while Apple only ever sees the SHA-256 hash.
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw Object.assign(new Error('Apple signed the user in but returned no identity token.'), {
        code: 'ROVE_NO_ID_TOKEN',
      });
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    if (error?.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, cancelled: true as const };
    }

    console.error('OAuth error:', error?.code, error);
    Sentry.captureException(error, { tags: { flow: 'apple-sign-in' } });
    return { success: false, error: error?.message || 'Apple sign in failed' };
  }
};
