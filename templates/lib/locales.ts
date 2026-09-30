// Locale registry + RTL guidance. Full doc: references/localization.md

export interface LocaleSpec {
  code: string; // BCP-47-ish, also used as export folder name
  name: string;
  rtl: boolean;
}

export const LOCALES: LocaleSpec[] = [
  { code: "en-US", name: "English (US)", rtl: false },
  { code: "en-GB", name: "English (UK)", rtl: false },
  { code: "de-DE", name: "German", rtl: false },
  { code: "fr-FR", name: "French", rtl: false },
  { code: "es-ES", name: "Spanish", rtl: false },
  { code: "it-IT", name: "Italian", rtl: false },
  { code: "pt-BR", name: "Portuguese (Brazil)", rtl: false },
  { code: "nl-NL", name: "Dutch", rtl: false },
  { code: "sv-SE", name: "Swedish", rtl: false },
  { code: "pl-PL", name: "Polish", rtl: false },
  { code: "tr-TR", name: "Turkish", rtl: false },
  { code: "ru-RU", name: "Russian", rtl: false },
  { code: "ja", name: "Japanese", rtl: false },
  { code: "ko", name: "Korean", rtl: false },
  { code: "zh-Hans", name: "Chinese (Simplified)", rtl: false },
  { code: "zh-Hant", name: "Chinese (Traditional)", rtl: false },
  { code: "ar-SA", name: "Arabic", rtl: true },
  { code: "he", name: "Hebrew", rtl: true },
  { code: "fa", name: "Persian", rtl: true },
];

export function isRtl(code: string): boolean {
  return LOCALES.find((l) => l.code === code)?.rtl ?? false;
}

export function localeName(code: string): string {
  return LOCALES.find((l) => l.code === code)?.code ?? code;
}

/** Resolve an element's copy for a locale (fallback chain). */
export function resolveText(
  el: { text?: string; locales?: Record<string, string> },
  locale: string,
  fallbackLocale: string,
): string {
  return el.locales?.[locale] ?? el.text ?? el.locales?.[fallbackLocale] ?? "";
}

/** CJK detection for the +8px headline bump rule. */
export function isCjk(code: string): boolean {
  return /^(ja|ko|zh)/.test(code);
}

/** RTL layout guidance surfaced by the inspector. */
export const RTL_RULES = [
  "Mirror layout direction; keep device frames unmirrored.",
  "Flip chevrons, progress bars, and directional motifs.",
  "Headlines align right; keep each headline a single RTL unit.",
  "Avoid Latin words mid-headline (numbers are fine).",
] as const;
