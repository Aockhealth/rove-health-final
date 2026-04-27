import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

// @ts-expect-error - Next.js default tsconfig doesn't include the 'webworker' lib
declare const self: ServiceWorkerGlobalScope;

// Only run in worker context (not on server)
if (typeof self !== "undefined" && "ServiceWorkerGlobalScope" in self) {
    const serwist = new Serwist({
        precacheEntries: self.__SW_MANIFEST,
        skipWaiting: true,
        clientsClaim: true,
        navigationPreload: true,
        runtimeCaching: defaultCache,
    });

    serwist.addEventListeners();
}
