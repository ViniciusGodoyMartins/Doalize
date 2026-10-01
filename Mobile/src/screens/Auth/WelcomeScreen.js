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
 * ============================================================
 * LOGOS
 * ============================================================
 *
 * Modo escuro:
 *
 * assets/logosejabemvindo.png
 *
 * Modo claro:
 *
 * assets/logosejabemvindomodoclaro.png
 */

import logoModoEscuro from '../../../assets/logosejabemvindo.png';

import logoModoClaro from '../../../assets/logosejabemvindomodoclaro.png';


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


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',


  /*
   * CORES COMPARTILHADAS
   */

  primary:
    '#3AC2F8',

  buttonText:
    '#141414',
};


/*
 * ============================================================
 * WELCOME SCREEN
 * ============================================================
 */

export default function WelcomeScreen() {

  /*
   * ==========================================================
   * NAVEGAÇÃO
   * ==========================================================
   */

  const navigation =
    useNavigation();


  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * APARÊNCIA CONFORME O TEMA
   * ==========================================================
   */

  const backgroundColor =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;


  const statusBarStyle =
    darkMode
      ? 'light-content'
      : 'dark-content';


  const logoSource =
    darkMode
      ? logoModoEscuro
      : logoModoClaro;


  /*
   * ==========================================================
   * ABRIR LOGIN
   * ==========================================================
   */

  function handleOpenLogin() {

    navigation.navigate(
      'LoginScreen'
    );

  }


  /*
   * ==========================================================
   * ABRIR CADASTRO
   * ==========================================================
   */

  function handleOpenRegister() {

    navigation.navigate(
      'RegisterScreen'
    );

  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (

    <SafeAreaView
      style={[
        styles.container,

        {
          backgroundColor:
            backgroundColor,
        },
      ]}
    >

      <StatusBar
        barStyle={
          statusBarStyle
        }
        backgroundColor={
          backgroundColor
        }
      />


      {/* ======================================================
          CONTEÚDO COMPLETO
          ====================================================== */}

      <View
        style={[
          styles.content,

          {
            backgroundColor:
              backgroundColor,
          },
        ]}
      >

        {/* ====================================================
            BLOCO CENTRAL
            ==================================================== */}

        <View
          style={
            styles.mainContent
          }
        >

          {/* ==================================================
              LOGO
              ==================================================
              
              As duas imagens usam exatamente o mesmo estilo.
              
              Não existe scale, largura ou altura diferente
              entre os modos claro e escuro.
              ================================================== */}

          <Image
            source={
              logoSource
            }
            style={
              styles.logoImage
            }
            resizeMode="contain"
            accessible
            accessibilityLabel="Doalize, seja bem-vindo"
          />


          {/* ==================================================
              BOTÕES
              ================================================== */}

          <View
            style={
              styles.actionsContainer
            }
          >

            {/* =================================================
                ENTRAR
                ================================================= */}

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


            {/* =================================================
                CADASTRAR
                ================================================= */}

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                handleOpenRegister
              }
              accessibilityRole="button"
              accessibilityLabel="Criar uma conta"
              style={
                styles.secondaryButton
              }
            >

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Cadastrar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </View>

    </SafeAreaView>

  );

}


/*
 * ============================================================
 * ESTILOS
 * ============================================================
 */

const styles =
  StyleSheet.create({

    /*
     * ========================================================
     * TELA
     * ========================================================
     */

    container: {
      flex:
        1,

      width:
        '100%',

      backgroundColor:
        COLORS.darkBackground,

      overflow:
        'hidden',
    },


    /*
     * ========================================================
     * CONTEÚDO PRINCIPAL
     * ========================================================
     */

    content: {
      flex:
        1,

      width:
        '100%',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        20,

      paddingVertical:
        20,

      alignSelf:
        'center',
    },


    /*
     * ========================================================
     * BLOCO CENTRAL
     * ========================================================
     */

    mainContent: {
      width:
        '100%',

      maxWidth:
        320,

      alignItems:
        'center',

      justifyContent:
        'center',

      alignSelf:
        'center',

      flexShrink:
        1,

      overflow:
        'visible',
    },


    /*
     * ========================================================
     * LOGO
     * ========================================================
     *
     * Este único estilo é utilizado pelas duas imagens.
     *
     * Não existe transformação ou escala condicional.
     */

    logoImage: {
      width:
        '100%',

      maxWidth:
        252,

      aspectRatio:
        1816 / 534,

      alignSelf:
        'center',

      resizeMode:
        'contain',

      margin:
        0,

      marginTop:
        -200,

      padding:
        0,

      backgroundColor:
        'transparent',

      flexShrink:
        1,
    },


    /*
     * ========================================================
     * ÁREA DOS BOTÕES
     * ========================================================
     *
     * O tamanho deste contêiner é igual
     * nos modos claro e escuro.
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
        -140,

      padding:
        0,

      flexShrink:
        1,
    },


    /*
     * ========================================================
     * BOTÃO ENTRAR
     * ========================================================
     *
     * O botão possui exatamente a mesma largura
     * e altura nos dois temas.
     */

    primaryButton: {
      width:
        '100%',

      height:
        44,

      minHeight:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      alignSelf:
        'center',

      paddingHorizontal:
        16,

      paddingVertical:
        0,

      margin:
        0,

      borderRadius:
        10,

      backgroundColor:
        COLORS.primary,

      overflow:
        'hidden',

      flexShrink:
        1,
    },


    /*
     * ========================================================
     * TEXTO DO BOTÃO ENTRAR
     * ========================================================
     */

    primaryButtonText: {
      color:
        COLORS.buttonText,

      fontSize:
        17,

      lineHeight:
        20,

      fontWeight:
        '600',

      textAlign:
        'center',

      includeFontPadding:
        false,

      margin:
        0,

      padding:
        0,
    },


    /*
     * ========================================================
     * BOTÃO CADASTRAR
     * ========================================================
     *
     * O botão possui exatamente a mesma largura
     * e altura nos dois temas.
     */

    secondaryButton: {
      width:
        '100%',

      height:
        44,

      minHeight:
        44,

      alignItems:
        'center',

      justifyContent:
        'center',

      alignSelf:
        'center',

      paddingHorizontal:
        16,

      paddingVertical:
        0,

      marginTop:
        10,

      marginBottom:
        0,

      borderWidth:
        1,

      borderColor:
        COLORS.primary,

      borderRadius:
        10,

      backgroundColor:
        'transparent',

      overflow:
        'hidden',

      flexShrink:
        1,
    },


    /*
     * ========================================================
     * TEXTO DO BOTÃO CADASTRAR
     * ========================================================
     */

    secondaryButtonText: {
      color:
        COLORS.primary,

      fontSize:
        17,

      lineHeight:
        20,

      fontWeight:
        '600',

      textAlign:
        'center',

      includeFontPadding:
        false,

      margin:
        0,

      padding:
        0,
    },

  });