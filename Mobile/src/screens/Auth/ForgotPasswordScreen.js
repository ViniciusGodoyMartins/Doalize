import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Input from '../../components/Input';

import Button from '../../components/Button';

import {
  useTheme,
} from '../../hooks/useTheme';

import api from '../../services/api';

import styles from './styles';

export default function ForgotPasswordScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const {
    theme,
  } = useTheme();

  /*
   * Se o usuário já tiver digitado
   * o e-mail na tela de Login,
   * o campo será preenchido
   * automaticamente.
   */
  const initialEmail =
    typeof route?.params?.email ===
      'string'
      ? route.params.email
          .trim()
          .toLowerCase()
      : '';

  const [
    email,
    setEmail,
  ] = useState(
    initialEmail
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * VALIDAR O FORMATO DO E-MAIL
   */
  function isValidEmail(
    emailValue
  ) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      emailValue
    );
  }

  /*
   * SOLICITAR O CÓDIGO
   *
   * Rota pública:
   *
   * POST
   * /users/password/forgot/request-code
   */
  async function handleRequestCode() {
    if (loading) {
      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (!normalizedEmail) {
      Alert.alert(
        'Atenção',
        'Informe o e-mail da sua conta.'
      );

      return;
    }

    if (
      !isValidEmail(
        normalizedEmail
      )
    ) {
      Alert.alert(
        'Atenção',
        'Informe um endereço de e-mail válido.'
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          '/users/password/forgot/request-code',
          {
            email:
              normalizedEmail,
          }
        );

      console.log(
        'CÓDIGO DE RECUPERAÇÃO SOLICITADO:',
        {
          email:
            normalizedEmail,

          response:
            response.data,
        }
      );

      Alert.alert(
        'Código solicitado',
        response.data?.message ||
          'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
        [
          {
            text:
              'Continuar',

            onPress: () => {
              navigation.navigate(
                'ResetPasswordScreen',
                {
                  email:
                    normalizedEmail,
                }
              );
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(
        'ERRO AO SOLICITAR CÓDIGO DE RECUPERAÇÃO:',
        {
          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response?.data
          ?.message ||
          'Não foi possível solicitar o código de recuperação.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * VOLTAR PARA O LOGIN
   */
  function handleBackToLogin() {
    if (loading) {
      return;
    }

    if (
      navigation.canGoBack()
    ) {
      navigation.goBack();

      return;
    }

    navigation.reset({
      index: 0,

      routes: [
        {
          name:
            'LoginScreen',
        },
      ],
    });
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO */}
        <View
          style={
            styles.logoContainer
          }
        >
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
            Recupere o acesso à sua conta.
          </Text>
        </View>

        {/* FORMULÁRIO */}
        <View
          style={
            styles.form
          }
        >
          <Text
            style={[
              localStyles.title,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Esqueci minha senha
          </Text>

          <Text
            style={[
              localStyles.description,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Informe o e-mail cadastrado na sua conta. Se o endereço estiver registrado, enviaremos um código de seis dígitos para redefinir a senha.
          </Text>

          <Input
            placeholder="E-mail da conta"
            value={email}
            onChangeText={
              setEmail
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={
              handleRequestCode
            }
          />

          <Button
            title="Enviar código"
            onPress={
              handleRequestCode
            }
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* VOLTAR PARA O LOGIN */}
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
            Lembrou sua senha?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleBackToLogin
            }
            disabled={loading}
          >
            <Text
              style={[
                styles.registerText,
                {
                  color:
                    theme.primary,

                  opacity:
                    loading
                      ? 0.6
                      : 1,
                },
              ]}
            >
              Fazer login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const localStyles = {
  title: {
    marginBottom: 10,

    fontSize: 24,

    fontWeight: '800',

    textAlign: 'center',
  },

  description: {
    marginBottom: 24,

    paddingHorizontal: 4,

    fontSize: 14,

    lineHeight: 21,

    textAlign: 'center',
  },
};