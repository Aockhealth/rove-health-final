import PostHog from 'posthog-react-native';

// Same PostHog project the website already uses (EXPO_PUBLIC_POSTHOG_KEY),
// so mobile and web usage events land in one shared dashboard.
let client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null; // no key configured — analytics silently disabled

  if (!client) {
    client = new PostHog(apiKey, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    });
  }
  return client;
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  getPostHogClient()?.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  getPostHogClient()?.identify(userId, properties);
}
