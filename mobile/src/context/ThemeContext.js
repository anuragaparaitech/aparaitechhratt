import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi' | 'mr'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('aparaitech_dark_mode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      }
      const savedLang = await AsyncStorage.getItem('aparaitech_language');
      if (savedLang) {
        setLanguage(savedLang);
      }
    } catch (e) {
      console.warn('Theme settings load error:', e);
    }
  };

  const toggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem('aparaitech_dark_mode', String(nextMode));
  };

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    await AsyncStorage.setItem('aparaitech_language', newLang);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const colors = {
    ...theme,
    surface: theme.cardBackground
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      isDark: isDarkMode,
      toggleTheme,
      language,
      changeLanguage,
      theme,
      colors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
