import { APP_COPY } from "./app-copy";
import { CAMERA_COPY } from './camera-copy';
import { useUiLang, type UiLang } from "./landing-i18n";

export const UI_LOCALES: Record<UiLang, string> = {
  en: "en-CH",
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
};
export function translate(
  lang: UiLang,
  text: string,
  values: Record<string, string | number> = {},
) {
  const copy = CAMERA_COPY[text]?.[lang] ?? APP_COPY[text]?.[lang] ?? text;
  return copy.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
export function useAppTranslations() {
  const [lang] = useUiLang();
  return {
    lang,
    locale: UI_LOCALES[lang],
    t: (text: string, values?: Record<string, string | number>) => translate(lang, text, values),
  };
}
