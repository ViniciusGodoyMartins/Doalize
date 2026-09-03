import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
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

export default function WelcomeScreen() {
  const navigation =
    useNavigation();

  const {
    theme,
  } = useTheme();

  /*
   * ABRIR A TELA DE LOGIN
   */
  function handleOpenLogin() {
    navigation.navigate(
      'LoginScreen'
    );
  }

  /*
   * ABRIR A TELA DE CADASTRO
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
            theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        bounces={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* LOGO E IDENTIDADE */}
        <View
          style={
            styles.logoContainer
          }
        >
          <View
            style={[
              styles.logoIconContainer,
              {
                backgroundColor:
                  `${theme.primary}18`,
              },
            ]}
          >
            <Ionicons
              name="heart"
              size={58}
              color={
                theme.primary
              }
            />
          </View>

          <Text
            style={[
              styles.logo,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            DOALIZE
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Conectando pessoas para ajudar.
          </Text>
        </View>

        {/* APRESENTAÇÃO */}
        <View
          style={
            styles.presentationContainer
          }
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Faça parte dessa rede solidária
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Entre na sua conta ou cadastre-se para divulgar campanhas, encontrar pessoas e contribuir com causas solidárias.
          </Text>
        </View>

        {/* BOTÕES */}
        <View
          style={
            styles.buttonsContainer
          }
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleOpenLogin
            }
            accessibilityRole="button"
            accessibilityLabel="Entrar na minha conta"
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Ionicons
              name="log-in-outline"
              size={23}
              color="#ffffff"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleOpenRegister
            }
            accessibilityRole="button"
            accessibilityLabel="Criar uma conta"
            style={[
              styles.secondaryButton,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  theme.primary,
              },
            ]}
          >
            <Ionicons
              name="person-add-outline"
              size={22}
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              Cadastrar
            </Text>
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}
        <View
          style={
            styles.footer
          }
        >
          <Text
            style={[
              styles.footerText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Juntos, podemos transformar solidariedade em ação.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    /*
     * TELA PRINCIPAL
     */
    container: {
      flex: 1,
    },

    /*
     * CONTEÚDO ROLÁVEL
     *
     * O flexGrow mantém o conteúdo
     * centralizado em telas maiores.
     *
     * O paddingBottom evita sobreposição
     * com a barra inferior do Android.
     */
    scrollContent: {
      flexGrow: 1,

      justifyContent:
        'center',

      paddingHorizontal: 24,

      paddingTop:
        Platform.OS === 'android'
          ? 34
          : 24,

      paddingBottom:
        Platform.OS === 'android'
          ? 46
          : 30,
    },

    /*
     * LOGO
     */
    logoContainer: {
      width: '100%',

      alignItems: 'center',
    },

    logoIconContainer: {
      width: 104,

      height: 104,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 52,

      marginBottom: 20,
    },

    logo: {
      fontSize: 42,

      fontWeight: '900',

      letterSpacing: 1.5,

      textAlign: 'center',
    },

    subtitle: {
      marginTop: 8,

      fontSize: 15,

      lineHeight: 22,

      textAlign: 'center',
    },

    /*
     * APRESENTAÇÃO
     */
    presentationContainer: {
      width: '100%',

      alignItems: 'center',

      marginTop: 34,

      paddingHorizontal: 10,
    },

    title: {
      maxWidth: 310,

      fontSize: 24,

      lineHeight: 31,

      fontWeight: '800',

      textAlign: 'center',
    },

    description: {
      maxWidth: 330,

      marginTop: 14,

      fontSize: 15,

      lineHeight: 23,

      textAlign: 'center',
    },

    /*
     * BOTÕES
     */
    buttonsContainer: {
      width: '100%',

      marginTop: 34,
    },

    primaryButton: {
      width: '100%',

      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 20,

      borderRadius: 16,
    },

    primaryButtonText: {
      marginLeft: 9,

      color: '#ffffff',

      fontSize: 16,

      fontWeight: '800',
    },

    secondaryButton: {
      width: '100%',

      minHeight: 56,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 14,

      paddingHorizontal: 20,

      borderWidth: 2,

      borderRadius: 16,
    },

    secondaryButtonText: {
      marginLeft: 9,

      fontSize: 16,

      fontWeight: '800',
    },

    /*
     * RODAPÉ
     *
     * Agora fica abaixo dos botões
     * dentro do ScrollView, sem invadir
     * o botão Cadastrar ou a barra
     * de navegação do Android.
     */
    footer: {
      width: '100%',

      alignItems: 'center',

      marginTop: 26,

      paddingHorizontal: 16,

      paddingBottom: 8,
    },

    footerText: {
      fontSize: 12,

      lineHeight: 18,

      textAlign: 'center',
    },
  });