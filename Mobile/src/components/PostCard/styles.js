import {
  StyleSheet,
} from 'react-native';


export default StyleSheet.create({

  /*
   * ============================================================
   * PUBLICAÇÃO
   * ============================================================
   *
   * O container acompanha somente o conteúdo real do post.
   *
   * A linha inferior não fica mais aqui. Ela foi transferida
   * para a área de ações, ficando imediatamente abaixo dos
   * ícones e da data.
   */

  container: {
    width:
      '100%',

    alignSelf:
      'stretch',

    marginTop:
      0,

    marginBottom:
      0,

    padding:
      0,

    borderRadius:
      0,

    overflow:
      'hidden',

    backgroundColor:
      '#141414',

    shadowColor:
      'transparent',

    shadowOffset: {
      width:
        0,

      height:
        0,
    },

    shadowOpacity:
      0,

    shadowRadius:
      0,

    elevation:
      0,

    borderBottomWidth:
      0,

    borderBottomColor:
      'transparent',
  },


  /*
   * ============================================================
   * CABEÇALHO
   * ============================================================
   */

  header: {
    width:
      '100%',

    paddingHorizontal:
      16,

    paddingVertical:
      12,

    margin:
      0,

    backgroundColor:
      'transparent',
  },


  /*
   * ============================================================
   * INFORMAÇÕES DO USUÁRIO
   * ============================================================
   */

  userInfo: {
    width:
      '100%',

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'flex-start',

    minWidth:
      0,

    margin:
      0,

    padding:
      0,
  },


  /*
   * ============================================================
   * NOME
   * ============================================================
   */

  username: {
    fontSize:
      16,

    lineHeight:
      21,

    fontWeight:
      '600',

    color:
      '#F5F5F5',

    includeFontPadding:
      false,

    margin:
      0,

    padding:
      0,

    flexShrink:
      1,
  },


  /*
   * ============================================================
   * DATA
   * ============================================================
   */

  date: {
    flexShrink:
      0,

    marginLeft:
      12,

    fontSize:
      13,

    lineHeight:
      18,

    fontWeight:
      '400',

    color:
      'rgba(245, 245, 245, 0.68)',

    includeFontPadding:
      false,

    textAlign:
      'right',

    marginTop:
      0,

    marginBottom:
      0,

    padding:
      0,
  },


  /*
   * ============================================================
   * IMAGEM
   * ============================================================
   *
   * A altura continua sendo calculada pela proporção real
   * da imagem no index.js do PostCard.
   */

  postImage: {
    width:
      '100%',

    height:
      '100%',

    borderRadius:
      0,

    backgroundColor:
      '#141414',

    resizeMode:
      'contain',

    overflow:
      'hidden',
  },


  /*
   * ============================================================
   * CONTEÚDO / RESUMO
   * ============================================================
   */

  content: {
    width:
      '100%',

    paddingHorizontal:
      16,

    paddingTop:
      13,

    paddingBottom:
      13,

    margin:
      0,

    backgroundColor:
      '#141414',
  },


  /*
   * ============================================================
   * TEXTO DA PUBLICAÇÃO
   * ============================================================
   */

  description: {
    fontSize:
      15,

    lineHeight:
      22,

    fontWeight:
      '400',

    color:
      '#F5F5F5',

    includeFontPadding:
      false,

    textAlign:
      'left',

    margin:
      0,

    padding:
      0,
  },


  /*
   * ============================================================
   * AÇÕES
   * ============================================================
   *
   * A linha inferior agora pertence diretamente à área de ações.
   *
   * Dessa forma, a linha aparece imediatamente abaixo dos
   * ícones e da data, independentemente do espaço restante
   * existente na tela.
   */

  actions: {
    width:
      '100%',

    minHeight:
      52,

    height:
      52,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    paddingHorizontal:
      16,

    paddingVertical:
      5,

    marginTop:
      0,

    marginBottom:
      0,

    borderTopWidth:
      0,

    borderTopColor:
      'transparent',

    borderBottomWidth:
      1,

    borderBottomColor:
      'rgba(245, 245, 245, 0.22)',

    backgroundColor:
      '#141414',
  },


  /*
   * ============================================================
   * BOTÃO DE AÇÃO
   * ============================================================
   */

  actionButton: {
    width:
      44,

    height:
      42,

    alignItems:
      'center',

    justifyContent:
      'center',

    padding:
      0,

    margin:
      0,

    borderRadius:
      8,

    backgroundColor:
      'transparent',

    overflow:
      'visible',
  },


  /*
   * ============================================================
   * TEXTO DAS AÇÕES
   * ============================================================
   */

  actionText: {
    display:
      'none',

    marginLeft:
      0,

    fontSize:
      0,

    fontWeight:
      '400',
  },

});