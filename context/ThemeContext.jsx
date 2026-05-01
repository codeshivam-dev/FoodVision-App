import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../shared/Colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved === 'dark') {
        setTheme(darkTheme);
      } else if (saved === 'light') {
        setTheme(lightTheme);
      }
      // If no saved theme, use system default (already set in useState)
    } catch (error) {
      console.log('Could not load theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: theme.mode === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};