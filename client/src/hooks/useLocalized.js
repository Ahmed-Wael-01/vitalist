import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Pick the current-language string from a bilingual { en, ar } object, falling back to English. */
export function useLocalized() {
  const { i18n } = useTranslation();
  return useCallback((value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[i18n.language] || value.en || value.ar || '';
  }, [i18n.language]);
}
