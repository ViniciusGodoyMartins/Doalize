import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  /*
   * TELA PRINCIPAL
   */
  container: {
    flex: 1,
  },

  /*
   * CONTEÚDO DAS TELAS
   *
   * Utilizado em:
   *
   * LoginScreen
   * RegisterScreen
   * ForgotPasswordScreen
   * ResetPasswordScreen
   */
  content: {
    flexGrow: 1,

    justifyContent: 'center',

    paddingHorizontal: 24,

    paddingTop: 40,

    paddingBottom: 40,
  },

  /*
   * ÁREA DA LOGO
   */
  logoContainer: {
    width: '100%',

    alignItems: 'center',

    marginBottom: 42,
  },

  logo: {
    fontSize: 42,

    fontWeight: '800',

    letterSpacing: 1,

    textAlign: 'center',
  },

  subtitle: {
    maxWidth: 320,

    marginTop: 10,

    fontSize: 15,

    lineHeight: 22,

    textAlign: 'center',
  },

  /*
   * FORMULÁRIO
   */
  form: {
    width: '100%',
  },

  /*
   * BOTÃO ESQUECI MINHA SENHA
   *
   * Aparece abaixo do campo de senha
   * na tela de Login.
   */
  forgotPasswordContainer: {
    width: '100%',

    alignItems: 'flex-end',

    marginTop: -4,

    marginBottom: 18,

    paddingHorizontal: 2,
  },

  forgotPasswordText: {
    fontSize: 14,

    fontWeight: '700',

    textAlign: 'right',
  },

  /*
   * RODAPÉ
   *
   * Utilizado pelos links:
   *
   * Criar conta
   * Fazer login
   */
  footer: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    flexWrap: 'wrap',

    marginTop: 30,

    paddingHorizontal: 10,
  },

  footerText: {
    fontSize: 15,

    lineHeight: 22,
  },

  registerText: {
    marginLeft: 6,

    fontSize: 15,

    lineHeight: 22,

    fontWeight: '700',
  },
});