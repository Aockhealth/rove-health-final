'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState, createContext, useContext } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createQueryClient,
  createIdbPersister,
  shouldDehydrateQuery,
} from '@/lib/query-cache';

// ─── User ID Context (for scoped query keys) ───────────────────────
const UserIdContext = createContext<string | undefined>(undefined);

/**
 * Returns the authenticated user's ID for use in query key scoping.
 * Only works inside `AppQueryProvider`.
 */
export function useUserId(): string | undefined {
  return useContext(UserIdContext);
}

// ─── PostHog Page View Tracker ──────────────────────────────────────
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogHook = usePostHog();

  useEffect(() => {
    if (pathname && posthogHook) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogHook.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogHook]);

  return null;
}

// ─── Analytics-Only Provider ────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false,
        autocapture: true,
        disable_session_recording: false,
        ip: false,
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// ─── React Query + IndexedDB Persistence Provider ───────────────────
export function AppQueryProvider({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());
  const [persister] = useState(() =>
    userId ? createIdbPersister(userId) : null
  );

  const inner = (
    <UserIdContext.Provider value={userId}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </UserIdContext.Provider>
  );

  // If we have a userId, use persistence; otherwise memory-only
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 12 * 60 * 60 * 1000, // 12 hours
          dehydrateOptions: {
            shouldDehydrateQuery,
          },
        }}
      >
        {inner}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {inner}
    </QueryClientProvider>
  );
}
