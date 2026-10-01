import React from 'react';

import {
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useTheme,
} from '../../hooks/useTheme';

import styles from './styles';


/*
 * ============================================================
 * LOGOS
 * ============================================================
 *
 * Modo escuro:
 *
 * assets/logo.png
 *
 * Modo claro:
 *
 * assets/logomodoclaro.png
 */

import logoModoEscuro from '../../../assets/logo.png';

import logoModoClaro from '../../../assets/logomodoclaro.png';


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

  darkIcon:
    '#F5F5F5',

  darkDivider:
    '#F5F5F5',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightIcon:
    '#141414',

  lightDivider:
    'rgba(20, 20, 20, 0.45)',
};


/*
 * ============================================================
 * HEADER
 * ============================================================
 */

export default function Header({

  title,

  showBackButton = false,

  /*
   * AÇÃO PERSONALIZADA DA SETA
   *
   * Quando não for informada,
   * será utilizado navigation.goBack().
   */

  onBackPress = null,

  /*
   * ÍCONE DA DIREITA
   */

  rightIcon = null,

  /*
   * AÇÃO DO ÍCONE DA DIREITA
   */

  onRightPress = null,

}) {

  const navigation =
    useNavigation();


  const {
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * CORES DO TEMA
   * ==========================================================
   */

  const headerBackgroundColor =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;


  const iconColor =
    darkMode
      ? COLORS.darkIcon
      : COLORS.lightIcon;


  const dividerColor =
    darkMode
      ? COLORS.darkDivider
      : COLORS.lightDivider;


  /*
   * ==========================================================
   * LOGO DO TEMA
   * ==========================================================
   */

  const logoSource =
    darkMode
      ? logoModoEscuro
      : logoModoClaro;


  /*
   * ==========================================================
   * VOLTAR
   * ==========================================================
   */

  function handleBackPress() {

    /*
     * Se existir uma ação personalizada,
     * ela tem prioridade.
     */

    if (
      typeof onBackPress ===
      'function'
    ) {

      onBackPress();

      return;

    }


    /*
     * Comportamento padrão.
     */

    if (
      navigation.canGoBack()
    ) {

      navigation.goBack();

    }

  }


  /*
   * ==========================================================
   * AÇÃO DO ÍCONE DA DIREITA
   * ==========================================================
   */

  function handleRightPress() {

    if (
      typeof onRightPress ===
      'function'
    ) {

      onRightPress();

    }

  }


  /*
   * ==========================================================
   * HEADER
   * ==========================================================
   */

  return (

    <View
      style={[
        styles.container,

        {
          backgroundColor:
            headerBackgroundColor,

          borderBottomColor:
            dividerColor,
        },
      ]}
    >

      {/* ====================================================
          ÁREA ESQUERDA
          ==================================================== */}

      <View
        style={
          styles.leftContainer
        }
      >

        {
          showBackButton ? (

            <TouchableOpacity
              activeOpacity={
                0.7
              }
              onPress={
                handleBackPress
              }
              style={
                styles.iconButton
              }
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >

              <Ionicons
                name="arrow-back"
                size={24}
                color={
                  iconColor
                }
              />

            </TouchableOpacity>

          ) : null
        }

      </View>


      {/* ====================================================
          LOGO CENTRAL
          ==================================================== */}

      <View
        style={
          styles.centerContainer
        }
      >

        <Image
          source={
            logoSource
          }
          style={
            styles.logoImage
          }
          resizeMode="contain"
          accessible
          accessibilityLabel={
            title
              ? `Doalize - ${title}`
              : 'Doalize'
          }
        />

      </View>


      {/* ====================================================
          ÁREA DIREITA
          ==================================================== */}

      <View
        style={
          styles.rightContainer
        }
      >

        {
          rightIcon ? (

            <TouchableOpacity
              activeOpacity={
                0.7
              }
              onPress={
                handleRightPress
              }
              disabled={
                typeof onRightPress !==
                'function'
              }
              style={
                styles.iconButton
              }
              accessibilityRole="button"
              accessibilityLabel="Ação do cabeçalho"
            >

              <Ionicons
                name={
                  rightIcon
                }
                size={24}
                color={
                  iconColor
                }
              />

            </TouchableOpacity>

          ) : null
        }

      </View>

    </View>

  );

}