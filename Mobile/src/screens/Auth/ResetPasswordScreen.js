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

export default function ResetPasswordScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const {
    theme,
  } = useTheme();

  /*
   * E-MAIL RECEBIDO DA TELA
   * DE SOLICITAÇÃO DO CÓDIGO
   */
  const receivedEmail =
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
    receivedEmail
  );

  const [
    code,
    setCode,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resendingCode,
    setResendingCode,
  ] = useState(false);

  /*
   * VALIDAR FORMATO DO E-MAIL
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
   * CONTROLAR O CAMPO DO CÓDIGO
   *
   * Aceita somente números e limita
   * o valor a seis dígitos.
   */
  function handleCodeChange(
    value
  ) {
    const numericCode =
      String(value || '')
        .replace(/\D/g, '')
        .slice(0, 6);

    setCode(
      numericCode
    );
  }

  /*
   * VOLTAR AO LOGIN
   */
  function handleBackToLogin() {
    if (
      loading ||
      resendingCode
    ) {
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

  /*
   * REDEFINIR A SENHA
   *
   * Rota pública:
   *
   * POST
   * /users/password/forgot/confirm
   */
  async function handleResetPassword() {
    if (
      loading ||
      resendingCode
    ) {
      return;
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const normalizedCode =
      String(code)
        .replace(/\D/g, '')
        .slice(0, 6);

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

    if (!normalizedCode) {
      Alert.alert(
        'Atenção',
        'Informe o código enviado por e-mail.'
      );

      return;
    }

    if (
      normalizedCode.length !==
      6
    ) {
      Alert.alert(
        'Atenção',
        'O código deve possuir 6 dígitos.'
      );

      return;
    }

    if (!newPassword) {
      Alert.alert(
        'Atenção',
        'Digite a nova senha.'
      );

      return;
    }

    if (
      newPassword.length < 6
    ) {
      Alert.alert(
        'Atenção',
        'A nova senha deve possuir pelo menos 6 caracteres.'
      );

      return;
    }

    if (!confirmPassword) {
      Alert.alert(
        'Atenção',
        'Confirme a nova senha.'
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          '/users/password/forgot/confirm',
          {
            email:
              normalizedEmail,

            code:
              normalizedCode,

            newPassword,

            confirmPassword,
          }
        );

      console.log(
        'SENHA REDEFINIDA:',
        {
          email:
            normalizedEmail,

          response:
            response.data,
        }
      );

      /*
       * LIMPAR OS DADOS SENSÍVEIS
       * ANTES DE VOLTAR AO LOGIN
       */
      setCode('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert(
        'Senha redefinida',
        response.data?.message ||
          'Sua senha foi redefinida com sucesso.',
        [
          {
            text:
              'Fazer login',

            onPress: () => {
              navigation.reset({
                index: 0,

                routes: [
                  {
                    name:
                      'LoginScreen',
                  },
                ],
              });
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (error) {
      console.log(
        'ERRO AO REDEFINIR SENHA:',
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
          'Não foi possível redefinir a senha.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * REENVIAR O CÓDIGO
   *
   * Ao gerar um novo código, o código
   * anterior deixa de ser válido.
   */
  async function handleResendCode() {
    if (
      loading ||
      resendingCode
    ) {
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
      setResendingCode(true);

      const response =
        await api.post(
          '/users/password/forgot/request-code',
          {
            email:
              normalizedEmail,
          }
        );

      /*
       * Limpa o código anterior porque
       * um novo código foi solicitado.
       */
      setCode('');

      Alert.alert(
        'Novo código solicitado',
        response.data?.message ||
          'Se o e-mail estiver cadastrado, você receberá um novo código.'
      );
    } catch (error) {
      console.log(
        'ERRO AO REENVIAR CÓDIGO:',
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
          'Não foi possível reenviar o código.'
      );
    } finally {
      setResendingCode(false);
    }
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
            Cadastre uma nova senha para sua conta.
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
            Redefinir senha
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
            Digite o código de seis dígitos enviado para seu e-mail e escolha uma nova senha.
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
            editable={
              !loading &&
              !resendingCode
            }
            returnKeyType="next"
          />

          <Input
            placeholder="Código de 6 dígitos"
            value={code}
            onChangeText={
              handleCodeChange
            }
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            editable={
              !loading &&
              !resendingCode
            }
            maxLength={6}
            returnKeyType="next"
          />

          <Text
            style={[
              localStyles.codeCounter,
              {
                color:
                  code.length === 6
                    ? theme.primary
                    : theme.textSecondary,
              },
            ]}
          >
            {code.length}/6
          </Text>

          <Input
            placeholder="Nova senha"
            value={newPassword}
            onChangeText={
              setNewPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={
              !loading &&
              !resendingCode
            }
            returnKeyType="next"
          />

          <Input
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={
              !loading &&
              !resendingCode
            }
            returnKeyType="done"
            onSubmitEditing={
              handleResetPassword
            }
          />

          <Button
            title="Redefinir senha"
            onPress={
              handleResetPassword
            }
            loading={loading}
            disabled={
              loading ||
              resendingCode
            }
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleResendCode
            }
            disabled={
              loading ||
              resendingCode
            }
            style={
              localStyles.resendButton
            }
            accessibilityRole="button"
            accessibilityLabel="Reenviar código"
          >
            <Text
              style={[
                localStyles.resendText,
                {
                  color:
                    theme.primary,

                  opacity:
                    loading ||
                    resendingCode
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {resendingCode
                ? 'Enviando novo código...'
                : 'Não recebeu? Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* VOLTAR AO LOGIN */}
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
            disabled={
              loading ||
              resendingCode
            }
          >
            <Text
              style={[
                styles.registerText,
                {
                  color:
                    theme.primary,

                  opacity:
                    loading ||
                    resendingCode
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

  codeCounter: {
    alignSelf: 'flex-end',

    marginTop: -10,

    marginRight: 4,

    marginBottom: 14,

    fontSize: 12,

    fontWeight: '700',
  },

  resendButton: {
    width: '100%',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 18,

    paddingVertical: 10,
  },

  resendText: {
    fontSize: 14,

    fontWeight: '700',

    textAlign: 'center',
  },
};