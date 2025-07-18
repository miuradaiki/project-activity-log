import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { responsiveTheme } from '../../styles/theme';

// テーマモード用のコンテキスト
interface ThemeContextType {
  isDarkMode: boolean;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleThemeMode: () => {},
});

// カスタムフック
export const useThemeMode = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ローカルストレージからテーマモードを取得
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // システムのカラーモードを確認
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  // テーマモードの切り替え
  const toggleThemeMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // テーマモードが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('themeMode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ダークモードまたはライトモードに基づいたテーマを生成
  const theme = useMemo(() => responsiveTheme(isDarkMode), [isDarkMode]);

  const contextValue = useMemo(
    () => ({
      isDarkMode,
      toggleThemeMode,
    }),
    [isDarkMode, toggleThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
