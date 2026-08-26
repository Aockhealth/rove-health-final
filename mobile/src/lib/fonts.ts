import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
  NotoSansDevanagari_700Bold,
  NotoSansDevanagari_800ExtraBold,
} from '@expo-google-fonts/noto-sans-devanagari';

/**
 * Loaded alongside the Latin font set in _layout.tsx's single `useFonts` call
 * — expo-font's `useFonts` does not reload when its map changes at runtime
 * (see its own doc comment), so both scripts have to be present from the
 * start rather than swapped in when the language changes.
 */
export const DEVANAGARI_FONT_MAP = {
  'NotoSansDevanagari-Regular': NotoSansDevanagari_400Regular,
  'NotoSansDevanagari-Medium': NotoSansDevanagari_500Medium,
  'NotoSansDevanagari-SemiBold': NotoSansDevanagari_600SemiBold,
  'NotoSansDevanagari-Bold': NotoSansDevanagari_700Bold,
  'NotoSansDevanagari-ExtraBold': NotoSansDevanagari_800ExtraBold,
};

/**
 * Cormorant Garamond and Raleway (the app's Latin fonts) have no Devanagari
 * glyphs, so Hindi text rendered in them shows as tofu boxes. Every place
 * that sets an explicit `fontFamily` needs to route through
 * `getLocalizedFontFamily` (or `useLocalizedFontFamily` in a component body)
 * so it swaps to the Devanagari face when the active language is Hindi.
 * Devanagari has no italic tradition, so italic variants fall back to the
 * upright weight.
 */
const LATIN_TO_DEVANAGARI: Record<string, string> = {
  'CormorantGaramond-Regular': 'NotoSansDevanagari-Regular',
  'CormorantGaramond-Italic': 'NotoSansDevanagari-Regular',
  'CormorantGaramond-Medium': 'NotoSansDevanagari-Medium',
  'CormorantGaramond-MediumItalic': 'NotoSansDevanagari-Medium',
  'CormorantGaramond-SemiBold': 'NotoSansDevanagari-SemiBold',
  'CormorantGaramond-SemiBoldItalic': 'NotoSansDevanagari-SemiBold',
  'CormorantGaramond-Bold': 'NotoSansDevanagari-Bold',
  'CormorantGaramond-BoldItalic': 'NotoSansDevanagari-Bold',
  'Raleway-Regular': 'NotoSansDevanagari-Regular',
  'Raleway-Italic': 'NotoSansDevanagari-Regular',
  'Raleway-Medium': 'NotoSansDevanagari-Medium',
  'Raleway-MediumItalic': 'NotoSansDevanagari-Medium',
  'Raleway-SemiBold': 'NotoSansDevanagari-SemiBold',
  'Raleway-SemiBoldItalic': 'NotoSansDevanagari-SemiBold',
  'Raleway-Bold': 'NotoSansDevanagari-Bold',
  'Raleway-BoldItalic': 'NotoSansDevanagari-Bold',
  'Raleway-ExtraBold': 'NotoSansDevanagari-ExtraBold',
  'Raleway-ExtraBoldItalic': 'NotoSansDevanagari-ExtraBold',
};

export function getLocalizedFontFamily(latinFamily: string, language: string): string {
  if (language !== 'hi') return latinFamily;
  return LATIN_TO_DEVANAGARI[latinFamily] ?? latinFamily;
}

/**
 * Wide letter-spacing on small uppercase "kicker"/eyebrow labels (e.g.
 * `tracking-[3px]`) is a Latin-typography convention — this app uses it a
 * lot. Applied to Devanagari it pries syllables apart into visibly broken
 * fragments (conjuncts and matras are legible as a unit, not as evenly
 * spaced individual glyphs), so any Text that might show Hindi and sets an
 * explicit tracking/letterSpacing value needs to route the number through
 * this — pass the pixel value the Latin version uses (e.g. 3 for
 * `tracking-[3px]`, 2 for `tracking-[2px]`) and use the result as an inline
 * `letterSpacing` style, dropping the Tailwind `tracking-*` class.
 */
export function getLocalizedTracking(latinTrackingPx: number, language: string): number {
  return language === 'hi' ? 0 : latinTrackingPx;
}
