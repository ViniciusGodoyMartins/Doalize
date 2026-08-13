import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  /*
   * LISTA
   */
  list: {
    padding: 14,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  /*
   * ITEM
   */
  contactItem: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    padding: 14,

    borderRadius: 18,

    marginBottom: 14,

    borderWidth: 1,
  },

  /*
   * AVATAR PADRÃO
   *
   * O contêiner não possui fundo branco,
   * borda ou sombra.
   *
   * O overflow hidden corta somente a parte
   * ampliada que ultrapassar a área de 58 × 58.
   */
  defaultAvatarContainer: {
    width: 58,

    height: 58,

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',

    backgroundColor:
      'transparent',
  },

  /*
   * Os PNGs imageuserdark e imageuserlight
   * possuem uma grande área transparente.
   *
   * A escala amplia o desenho central para
   * ocupar aproximadamente toda a área
   * destinada ao avatar.
   */
  defaultAvatar: {
    width: 58,

    height: 58,

    transform: [
      {
        scale: 4.2,
      },
    ],
  },

  /*
   * FOTO REAL DO CONTATO
   *
   * A foto real não recebe scale, pois deve
   * preencher naturalmente o círculo.
   */
  remoteAvatarContainer: {
    width: 58,

    height: 58,

    borderRadius: 29,

    overflow: 'hidden',

    backgroundColor:
      'transparent',
  },

  remoteAvatar: {
    width: '100%',

    height: '100%',
  },

  /*
   * Mantido para compatibilidade caso outro
   * trecho do projeto ainda utilize styles.avatar.
   */
  avatar: {
    width: 58,

    height: 58,

    borderRadius: 29,
  },

  /*
   * INFORMAÇÕES
   */
  contactInfo: {
    flex: 1,

    marginLeft: 14,

    minWidth: 0,
  },

  name: {
    fontSize: 16,

    fontWeight: '700',
  },

  lastMessage: {
    marginTop: 4,

    fontSize: 14,
  },

  /*
   * LADO DIREITO
   */
  rightContent: {
    alignItems: 'flex-end',

    justifyContent:
      'space-between',

    minHeight: 50,

    marginLeft: 10,
  },

  time: {
    fontSize: 12,
  },

  /*
   * BADGE
   */
  badge: {
    minWidth: 22,

    height: 22,

    borderRadius: 11,

    justifyContent: 'center',

    alignItems: 'center',

    paddingHorizontal: 6,

    marginTop: 6,
  },

  badgeText: {
    color: '#ffffff',

    fontSize: 12,

    fontWeight: '700',
  },

  /*
   * LISTA VAZIA
   */
  emptyContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 18,

    fontWeight: '700',

    textAlign: 'center',
  },

  emptyText: {
    marginTop: 8,

    fontSize: 14,

    textAlign: 'center',
  },
});