import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// デフォルトの言語コンテキスト
const defaultLanguageContext: LanguageContextType = {
  language: 'ja',
  setLanguage: () => {},
  t: (key: string) => key,
};

// 言語コンテキストの作成
export const LanguageContext = createContext<LanguageContextType>(
  defaultLanguageContext
);

// 言語コンテキストへのアクセス用フック
export const useLanguage = () => useContext(LanguageContext);

// 言語のローカルストレージキー
const LANGUAGE_STORAGE_KEY = 'project_activity_log_language';

interface LanguageProviderProps {
  children: ReactNode;
}

// 言語翻訳リソースをインポート
import { translations } from '../i18n/translations';

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  // 初期言語設定（ローカルストレージから取得、なければブラウザの言語設定、それもなければ日本語）
  const getInitialLanguage = (): Language => {
    const storedLanguage = localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    ) as Language | null;
    if (
      storedLanguage &&
      (storedLanguage === 'ja' || storedLanguage === 'en')
    ) {
      return storedLanguage;
    }

    const browserLanguage = navigator.language.split('-')[0];
    return browserLanguage === 'en' ? 'en' : 'ja'; // デフォルトは日本語
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // 言語変更と保存
  const setLanguage = useCallback((newLanguage: Language) => {
    // 言語設定を保存
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    // ステートを更新
    setLanguageState(newLanguage);
    // 言語切り替え時に現在のページを維持するため、ページリロードは行わない
    // 代わりにコンポーネントの再レンダリングを促すだけにする
  }, []);

  // 翻訳関数
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      // 言語が存在するかチェック
      if (!translations[language]) {
        console.warn(`Translation for language "${language}" not found.`);
        return key;
      }

      // キーが存在するかチェック
      const translation = (translations as any)[language][key];
      if (!translation) {
        console.warn(
          `Translation key "${key}" not found for language "${language}".`
        );
        return key;
      }

      // パラメータ置換
      if (params) {
        return Object.keys(params).reduce((result, paramKey) => {
          return result.replace(`{${paramKey}}`, params[paramKey]);
        }, translation);
      }

      return translation;
    },
    [language]
  ); // languageが変わるたびに関数も再生成される

  // コンテキストの値
  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
