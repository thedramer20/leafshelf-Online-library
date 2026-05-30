import { useEffect, useState, useCallback } from 'react';
import { getLang, onLangChange, setLang as setLangImpl, t as tFn, type Lang } from '../lib/i18n';

export function useT() {
  const [, setTick] = useState(0);
  useEffect(() => onLangChange(() => setTick(n => n + 1)), []);
  const t = useCallback((key: string) => tFn(key), []);
  const lang = getLang();
  const setLang = useCallback((next: Lang) => setLangImpl(next), []);
  const isRTL = lang === 'ar';
  return { t, lang, setLang, isRTL };
}
