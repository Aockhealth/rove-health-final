"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the marketing chrome (header, footer, cart) on the pages a patient
 * shares outward — the doctor report at /report/[token] and the partner
 * fertility view at /fertility/[token].
 *
 * Those pages are somebody's medical record opened by a third party who has
 * no relationship with Rove. A shop nav and a cart icon over the top of it
 * read as marketing at exactly the wrong moment, and invite a clinician
 * reading a patient's cycle history to go browse supplements. Children are
 * passed in from the server layout, so gating them here costs no extra
 * client-side rendering of the header itself.
 */
const BARE_ROUTE_PREFIXES = ["/report/", "/fertility/"];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;
  return <>{children}</>;
}
