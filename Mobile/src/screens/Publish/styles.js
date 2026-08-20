import {
  StyleSheet,
  Dimensions,
} from 'react-native';

const {
  width: SCREEN_WIDTH,
} = Dimensions.get('window');

const PREVIEW_SIZE =
  SCREEN_WIDTH * 0.38;

export default StyleSheet.create({
  /*
   * TELA
   */
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /*
   * SEÇÕES
   */
  section: {
    width: '100%',

    paddingHorizontal: 16,

    paddingTop: 22,
  },

  label: {
    marginLeft: 4,

    marginBottom: 8,

    fontSize: 17,

    fontWeight: '700',
  },

  /*
   * TEXTO EXPLICATIVO ABAIXO DOS TÍTULOS
   */
  helperText: {
    marginLeft: 4,

    marginRight: 4,

    marginBottom: 14,

    fontSize: 13,

    lineHeight: 19,
  },

  /*
   * SELETOR DE IMAGENS
   */
  imagePicker: {
    width: '100%',

    height: 180,

    borderWidth: 2,

    borderStyle: 'dashed',

    borderRadius: 18,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 20,
  },

  imagePickerText: {
    marginTop: 12,

    fontSize: 15,

    fontWeight: '600',

    textAlign: 'center',
  },

  /*
   * CABEÇALHO DAS IMAGENS SELECIONADAS
   */
  selectedImagesHeader: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 18,

    marginBottom: 4,
  },

  selectedImagesText: {
    flex: 1,

    marginRight: 12,

    fontSize: 14,

    fontWeight: '700',
  },

  clearImagesText: {
    fontSize: 13,

    fontWeight: '700',
  },

  /*
   * LISTA HORIZONTAL DE PRÉVIA
   */
  previewContainer: {
    width: '100%',

    marginTop: 12,
  },

  previewContent: {
    paddingRight: 4,

    paddingBottom: 4,
  },

  previewItem: {
    position: 'relative',

    width: PREVIEW_SIZE,

    height: PREVIEW_SIZE,

    marginRight: 12,

    borderRadius: 16,

    overflow: 'hidden',

    backgroundColor: '#e5e7eb',
  },

  previewImage: {
    width: '100%',

    height: '100%',
  },

  /*
   * NÚMERO QUE INDICA A ORDEM DA IMAGEM
   */
  imageNumber: {
    position: 'absolute',

    left: 8,

    bottom: 8,

    minWidth: 28,

    height: 28,

    borderRadius: 14,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 7,

    backgroundColor:
      'rgba(0, 0, 0, 0.72)',
  },

  imageNumberText: {
    color: '#ffffff',

    fontSize: 12,

    fontWeight: '800',
  },

  /*
   * BOTÃO PARA REMOVER UMA IMAGEM
   */
  removeImageButton: {
    position: 'absolute',

    top: 8,

    right: 8,

    width: 30,

    height: 30,

    borderRadius: 15,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(0, 0, 0, 0.75)',
  },

  /*
   * CONTADOR DE CARACTERES
   *
   * O marginTop negativo aproxima o contador
   * do componente Input.
   */
  characterCount: {
    alignSelf: 'flex-end',

    marginTop: -8,

    marginRight: 4,

    marginBottom: 6,

    fontSize: 12,

    fontWeight: '600',
  },

  /*
   * BOTÃO PUBLICAR
   */
  buttonContainer: {
    width: '100%',

    paddingHorizontal: 16,

    paddingTop: 30,

    paddingBottom: 40,
  },
});