import React, {
  useEffect,
} from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import {
  useTheme,
} from '../../hooks/useTheme';

import styles from './styles';


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  /*
   * MODO ESCURO
   */

  darkBackground:
    '#141414',

  darkTextSecondary:
    'rgba(245, 245, 245, 0.68)',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.68)',


  /*
   * COR PRINCIPAL
   */

  primary:
    '#44AFDD',
};


/*
 * ============================================================
 * SPLASH SCREEN
 * ============================================================
 */

export default function SplashScreen({
  navigation,
}) {

  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    theme,
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * CORES ATUAIS
   * ==========================================================
   */

  const backgroundColor =
    theme?.background ||
    (
      darkMode
        ? COLORS.darkBackground
        : COLORS.lightBackground
    );


  const primaryColor =
    theme?.primary ||
    COLORS.primary;


  const secondaryTextColor =
    theme?.textSecondary ||
    (
      darkMode
        ? COLORS.darkTextSecondary
        : COLORS.lightTextSecondary
    );


  const statusBarStyle =
    darkMode
      ? 'light-content'
      : 'dark-content';


  /*
   * ==========================================================
   * REDIRECIONAR PARA O LOGIN
   * ==========================================================
   */

  useEffect(() => {

    const timer =
      setTimeout(() => {

        navigation.replace(
          'LoginScreen'
        );

      }, 2500);


    return () => {

      clearTimeout(
        timer
      );

    };

  }, [
    navigation,
  ]);


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (

    <View
      style={[
        styles.container,

        {
          backgroundColor:
            backgroundColor,
        },
      ]}
    >

      {/* ====================================================
          BARRA DE STATUS
          ==================================================== */}

      <StatusBar
        barStyle={
          statusBarStyle
        }
        backgroundColor={
          backgroundColor
        }
      />


      {/* ====================================================
          LOGO EM TEXTO
          ==================================================== */}

      <Text
        style={[
          styles.logo,

          {
            color:
              primaryColor,
          },
        ]}
      >
        DOALIZE
      </Text>


      {/* ====================================================
          SUBTÍTULO
          ==================================================== */}

      <Text
        style={[
          styles.subtitle,

          {
            color:
              secondaryTextColor,
          },
        ]}
      >
        Conectando pessoas para ajudar
      </Text>


      {/* ====================================================
          CARREGAMENTO
          ==================================================== */}

      <ActivityIndicator
        size="large"
        color={
          primaryColor
        }
        style={
          styles.loader
        }
      />

    </View>

  );

}