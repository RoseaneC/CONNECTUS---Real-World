import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'connectus-lang';
const DEFAULT_LANG = 'pt';

const I18nContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

const isBrowser = typeof window !== 'undefined';

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    if (isBrowser) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'pt' || stored === 'en') {
        return stored;
      }
    }
    return DEFAULT_LANG;
  });

  useEffect(() => {
    if (isBrowser) {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch (_error) {
        // Ignora erros de armazenamento (ex.: navegação privada)
      }
    }
  }, [lang]);

  const setLang = (nextLang) => {
    if (nextLang === 'pt' || nextLang === 'en') {
      setLangState(nextLang);
    }
  };

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);



