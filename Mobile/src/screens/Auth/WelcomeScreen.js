import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  useTheme,
} from '../../hooks/useTheme';

/*
 * LOGOS DO DOALIZE
 *
 * Modo escuro:
 * logosejabemvindo.png
 *
 * Modo claro:
 * logosejabemvindomodoclaro.png
 */
const logoDark =
  require(
    '../../../assets/logosejabemvindo.png'
  );

const logoLight =
  require(
    '../../../assets/logosejabemvindomodoclaro.png'
  );

/*
 * CORES DA TELA
 */
const COLORS = {
  darkBackground:
    '#141414',

  lightBackground:
    '#F5F5F5',

  primary:
    '#3AC2F8',

  darkText:
    '#141414',

  lightText:
    '#F5F5F5',
};

export default function WelcomeScreen() {
  const navigation =
    useNavigation();

  const {
    darkMode,
  } = useTheme();

  /*
   * CORES E IMAGENS
   * CONFORME O TEMA
   */
  const screenBackground =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;

  const selectedLogo =
    darkMode
      ? logoDark
      : logoLight;

  /*
   * ABRIR LOGIN
   */
  function handleOpenLogin() {
    navigation.navigate(
      'LoginScreen'
    );
  }

  /*
   * ABRIR CADASTRO
   */
  function handleOpenRegister() {
    navigation.navigate(
      'RegisterScreen'
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            screenBackground,
        },
      ]}
    >
      <StatusBar
        barStyle={
          darkMode
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={
          screenBackground
        }
      />

      {/*
       * CONTEÚDO COMPLETO
       */}
      <View
        style={
          styles.content
        }
      >
        {/*
         * LOGO OFICIAL
         */}
        <View
          style={
            styles.logoContainer
          }
        >
          <Image
            source={
              selectedLogo
            }
            style={
              styles.logoImage
            }
            resizeMode="contain"
            accessible
            accessibilityLabel="Doalize, seja bem-vindo"
          />
        </View>

        {/*
         * BOTÕES
         */}
        <View
          style={
            styles.actionsContainer
          }
        >
          {/*
           * ENTRAR
           */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={
              handleOpenLogin
            }
            accessibilityRole="button"
            accessibilityLabel="Entrar na conta"
            style={
              styles.primaryButton
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Entrar
            </Text>
          </TouchableOpacity>

          {/*
           * CADASTRAR
           *
           * No modo claro, o segundo
           * botão também é preenchido,
           * conforme o protótipo.
           *
           * No modo escuro, permanece
           * transparente com borda azul.
           */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={
              handleOpenRegister
            }
            accessibilityRole="button"
            accessibilityLabel="Criar uma conta"
            style={[
              styles.secondaryButton,
              {
                backgroundColor:
                  darkMode
                    ? 'transparent'
                    : COLORS.primary,

                borderColor:
                  COLORS.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    darkMode
                      ? COLORS.primary
                      : COLORS.darkText,
                },
              ]}
            >
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/*
 * ESTILOS
 */
const styles =
  StyleSheet.create({
    /*
     * TELA
     */
    container: {
      flex:
        1,

      width:
        '100%',

      overflow:
        'hidden',
    },

    /*
     * CONTEÚDO PRINCIPAL
     */
    content: {
      flex:
        1,

      width:
        '100%',

      alignItems:
        'center',

      paddingHorizontal:
        28,
    },

    /*
     * ÁREA DA LOGO
     *
     * A logo permanece na parte
     * superior como no protótipo.
     */
    logoContainer: {
      width:
        '100%',

      maxWidth:
        320,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        22,
    },

    /*
     * LOGO
     */
    logoImage: {
      width:
        '72%',

      maxWidth:
        220,

      height:
        72,

      alignSelf:
        'center',

      backgroundColor:
        'transparent',
    },

    /*
     * ÁREA DOS BOTÕES
     *
     * Posicionada abaixo da logo
     * conforme o protótipo claro.
     */
    actionsContainer: {
      width:
        '100%',

      maxWidth:
        300,

      alignItems:
        'center',

      justifyContent:
        'center',

      alignSelf:
        'center',

      marginTop:
        92,
    },

    /*
     * BOTÃO ENTRAR
     */
    primaryButton: {
      width:
        '100%',

      height:
        46,

      minHeight:
        46,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        16,

      borderRadius:
        10,

      backgroundColor:
        COLORS.primary,

      overflow:
        'hidden',
    },

    /*
     * TEXTO DO BOTÃO ENTRAR
     */
    primaryButtonText: {
      margin:
        0,

      padding:
        0,

      color:
        COLORS.darkText,

      fontSize:
        18,

      lineHeight:
        22,

      fontWeight:
        '800',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },

    /*
     * BOTÃO CADASTRAR
     */
    secondaryButton: {
      width:
        '100%',

      height:
        46,

      minHeight:
        46,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        23,

      paddingHorizontal:
        16,

      borderWidth:
        1,

      borderRadius:
        10,

      overflow:
        'hidden',
    },

    /*
     * TEXTO DO BOTÃO CADASTRAR
     */
    secondaryButtonText: {
      margin:
        0,

      padding:
        0,

      fontSize:
        18,

      lineHeight:
        22,

      fontWeight:
        '800',

      textAlign:
        'center',

      includeFontPadding:
        false,
    },
  });