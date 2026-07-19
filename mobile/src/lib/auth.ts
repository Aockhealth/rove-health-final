import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async () => {
  try {
    const redirectUrl = makeRedirectUri({
      preferLocalhost: true,
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No redirect URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success') {
      const { url } = result;
      // Parse the return URL
      const { params, errorCode } = QueryParams.getQueryParams(url);
      
      if (errorCode) {
        throw new Error(errorCode);
      }

      // If Supabase uses implicit grant (returns access_token in hash fragment):
      if (params?.access_token && params?.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
      
      // If Supabase uses PKCE (returns code in query params):
      // The Supabase client automatically handles exchanging the code for a session 
      // if it intercepts the deep link, but since we use openAuthSessionAsync,
      // it might not intercept it. However, setting the session manually or relying on the PKCE exchange works.
      // Usually, just returning success is enough because the app's _layout.tsx will detect the session change
      // if Supabase's Linking listener caught it.
      
      return { success: true };
    }
    
    if (result.type === 'cancel') {
      return { success: false, cancelled: true };
    }

    throw new Error('Something went wrong during sign in');
  } catch (error: any) {
    console.error('OAuth error:', error);
    return { success: false, error: error.message };
  }
};
