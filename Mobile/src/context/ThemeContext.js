import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Easing,
  ReduceMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import lightTheme from '../styles/theme';
import darkTheme from '../styles/darkTheme';


export const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = '@doalize_theme_v3';

const TRANSITION_DURATION = 320;


export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [loadingTheme, setLoadingTheme] = useState(true);

  const darkModeRef = useRef(true);

  /*
   * 0 = modo claro
   * 1 = modo escuro
   *
   * Os componentes animados leem este valor
   * sem atualizar o estado React a cada quadro.
   */
  const themeProgress = useSharedValue(1);


  /*
   * CARREGAR PREFERÊNCIA
   */

  useEffect(() => {
    let active = true;

    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        );

        if (!active) {
          return;
        }

        const nextDarkMode = savedTheme !== 'light';

        darkModeRef.current = nextDarkMode;

        // A abertura do aplicativo não precisa de animação.
        themeProgress.value = nextDarkMode ? 1 : 0;

        setDarkMode(nextDarkMode);
      } catch (error) {
        console.log('Erro ao carregar tema:', error);
      } finally {
        if (active) {
          setLoadingTheme(false);
        }
      }
    }

    loadTheme();

    return () => {
      active = false;
    };
  }, [themeProgress]);


  /*
   * ALTERNAR TEMA
   */

  const toggleTheme = useCallback(() => {
    if (loadingTheme) {
      return;
    }

    const nextDarkMode = !darkModeRef.current;

    darkModeRef.current = nextDarkMode;

    themeProgress.value = withTiming(
      nextDarkMode ? 1 : 0,
      {
        duration: TRANSITION_DURATION,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }
    );

    setDarkMode(nextDarkMode);

    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      nextDarkMode ? 'dark' : 'light'
    ).catch((error) => {
      console.log('Erro ao salvar tema:', error);
    });
  }, [loadingTheme, themeProgress]);


  const theme = darkMode ? darkTheme : lightTheme;

  const contextValue = useMemo(
    () => ({
      theme,
      darkMode,
      loadingTheme,
      toggleTheme,
      themeProgress,
    }),
    [
      theme,
      darkMode,
      loadingTheme,
      toggleTheme,
      themeProgress,
    ]
  );


  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}