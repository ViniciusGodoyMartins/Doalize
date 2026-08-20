import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  /*
   * CARTÃO DA PUBLICAÇÃO
   */
  container: {
    width: '100%',

    borderRadius: 18,

    marginBottom: 18,

    overflow: 'hidden',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,

    shadowRadius: 5,

    elevation: 4,
  },

  /*
   * CABEÇALHO
   *
   * Contém:
   * - avatar;
   * - nome;
   * - data;
   * - indicador de promoção.
   */
  header: {
    width: '100%',

    paddingHorizontal: 14,

    paddingVertical: 14,
  },

  userInfo: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',
  },

  /*
   * Mantido para compatibilidade caso
   * outro componente ainda use styles.avatar.
   *
   * O PostCard atualizado utiliza os estilos
   * específicos para foto real e avatar padrão.
   */
  avatar: {
    width: 48,

    height: 48,

    borderRadius: 24,

    marginRight: 12,
  },

  username: {
    fontSize: 16,

    fontWeight: '700',
  },

  date: {
    marginTop: 2,

    fontSize: 13,
  },

  /*
   * IMAGEM DO CARROSSEL
   *
   * A largura será definida dinamicamente
   * no PostCard para ficar exatamente igual
   * à largura interna do cartão.
   *
   * A altura precisa ser fixa para que todas
   * as imagens mantenham o mesmo espaço
   * durante o movimento horizontal.
   */
  postImage: {
    width: '100%',

    height: 320,

    backgroundColor: '#e5e7eb',
  },

  /*
   * CONTEÚDO TEXTUAL
   *
   * Agora mostra apenas:
   *
   * post.summary
   *
   * ou, em posts antigos:
   *
   * post.description
   */
  content: {
    width: '100%',

    paddingHorizontal: 14,

    paddingTop: 12,

    paddingBottom: 14,
  },

  description: {
    fontSize: 15,

    lineHeight: 22,
  },

  /*
   * AÇÕES
   *
   * A cor da borda superior é definida
   * dinamicamente com theme.border.
   */
  actions: {
    width: '100%',

    minHeight: 58,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 10,

    paddingVertical: 10,

    borderTopWidth: 1,
  },

  actionButton: {
    flex: 1,

    minHeight: 40,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 8,

    borderRadius: 10,
  },

  actionText: {
    marginLeft: 6,

    fontSize: 14,

    fontWeight: '600',
  },
});