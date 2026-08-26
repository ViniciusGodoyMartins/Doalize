import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  /*
   * CONTÊINER PRINCIPAL
   */
  container: {
    position: 'relative',

    width: '100%',

    minHeight: 56,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderRadius: 14,

    paddingLeft: 16,

    paddingRight: 16,

    marginBottom: 14,
  },

  /*
   * CONTÊINER PARA TEXTO MAIOR
   */
  multilineContainer: {
    minHeight: 130,

    alignItems: 'flex-start',

    paddingTop: 2,
  },

  /*
   * CAMPO DE TEXTO
   */
  input: {
    flex: 1,

    minHeight: 54,

    fontSize: 16,

    paddingVertical: 14,

    paddingHorizontal: 0,
  },

  /*
   * CAMPOS MULTILINHA
   */
  multilineInput: {
    minHeight: 120,

    paddingTop: 14,

    paddingBottom: 14,
  },

  /*
   * RESERVA ESPAÇO PARA O ÍCONE
   * DE EXIBIR OU OCULTAR SENHA.
   */
  passwordInput: {
    paddingRight: 46,
  },

  /*
   * BOTÃO DO OLHO
   */
  passwordButton: {
    position: 'absolute',

    right: 8,

    top: 7,

    width: 42,

    height: 42,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 21,
  },
});