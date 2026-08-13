import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';

import { useTheme } from '../../hooks/useTheme';

import {
  normalizePost,
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';

const { width: SCREEN_WIDTH } =
  Dimensions.get('window');

export default function DetailsScreen({
  route,
  navigation,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  const [
    failedPostImages,
    setFailedPostImages,
  ] = useState({});

  /*
   * Normaliza os dados da publicação
   * recebidos pela navegação.
   */
  const post = useMemo(() => {
    const receivedPost =
      route?.params?.post;

    if (!receivedPost) {
      return null;
    }

    return normalizePost(
      receivedPost
    );
  }, [route?.params?.post]);

  /*
   * Garante que o campo images seja
   * sempre tratado como uma lista.
   */
  const postImages = useMemo(() => {
    return parsePostImages(
      post?.images
    );
  }, [post?.images]);

  /*
   * REGRA DO AVATAR PADRÃO:
   *
   * Modo claro:
   * imageuserdark.png
   *
   * Modo escuro:
   * imageuserlight.png
   */
  const defaultAvatarSource = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);

  /*
   * Tenta resolver a foto cadastrada
   * pelo usuário.
   */
  const remoteAvatarUrl = useMemo(() => {
    const photo =
      post?.user?.photo;

    if (
      !photo ||
      typeof photo !== 'string' ||
      !photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(photo);
  }, [post?.user?.photo]);

  /*
   * Se a foto do usuário mudar,
   * permite uma nova tentativa.
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);

  /*
   * Ao abrir outra publicação,
   * limpa os erros das imagens anteriores.
   */
  useEffect(() => {
    setFailedPostImages({});
  }, [post?.id]);

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;

  function handleRemoteAvatarError(
    event
  ) {
    console.log(
      'ERRO AO CARREGAR AVATAR NOS DETALHES:',
      {
        originalPhoto:
          post?.user?.photo,

        resolvedUrl:
          remoteAvatarUrl,

        error:
          event?.nativeEvent,
      }
    );

    /*
     * Ao falhar, a tela passa a utilizar:
     *
     * imageuserdark no modo claro;
     * imageuserlight no modo escuro.
     */
    setRemoteAvatarFailed(true);
  }

  /*
   * Registra individualmente a imagem
   * da publicação que apresentou erro.
   *
   * A linha:
   *
   * updatedErrors[index] = true;
   *
   * evita o erro de sintaxe que estava
   * acontecendo anteriormente.
   */
  function handlePostImageError(
    image,
    index,
    event
  ) {
    console.log(
      'ERRO AO CARREGAR IMAGEM NOS DETALHES:',
      {
        image,
        index,
        error:
          event?.nativeEvent,
      }
    );

    setFailedPostImages(
      (currentErrors) => {
        const updatedErrors = {
          ...currentErrors,
        };

        updatedErrors[index] = true;

        return updatedErrors;
      }
    );
  }

  /*
   * Abre o chat com o responsável
   * pela publicação.
   */
  function handleOpenChat() {
    if (!post?.user?.id) {
      return;
    }

    navigation.navigate(
      'Contatos',
      {
        screen: 'ChatScreen',

        params: {
          chatId:
            post.user.id,

          user:
            post.user,
        },
      }
    );
  }

  /*
   * Evita que a tela quebre caso seja
   * aberta sem receber um post.
   */
  if (!post) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <Header
          title="Detalhes"
          showBackButton
        />

        <View
          style={
            localStyles.emptyContent
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={
              theme.textSecondary
            }
          />

          <Text
            style={[
              localStyles.emptyTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Publicação indisponível
          </Text>

          <Text
            style={[
              localStyles.emptyDescription,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Não foi possível carregar os dados desta publicação.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <Header
        title="Detalhes"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          localStyles.scrollContent
        }
      >
        {/* USUÁRIO */}
        <View
          style={[
            styles.userContainer,
            localStyles.userContainer,
          ]}
        >
          {hasRemoteAvatar ? (
            /*
             * FOTO REAL DO USUÁRIO
             */
            <View
              style={
                localStyles.remoteAvatarContainer
              }
            >
              <Image
                source={{
                  uri: remoteAvatarUrl,
                }}
                style={
                  localStyles.remoteAvatar
                }
                resizeMode="cover"
                onError={
                  handleRemoteAvatarError
                }
              />
            </View>
          ) : (
            /*
             * AVATAR PADRÃO
             *
             * Modo claro:
             * imagem escura.
             *
             * Modo escuro:
             * imagem clara.
             */
            <View
              style={
                localStyles.defaultAvatarContainer
              }
            >
              <Image
                source={
                  defaultAvatarSource
                }
                style={
                  localStyles.defaultAvatar
                }
                resizeMode="contain"
              />
            </View>
          )}

          <View
            style={[
              styles.userInfo,
              localStyles.userInfo,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.username,
                {
                  color: theme.text,
                },
              ]}
            >
              {post?.user?.name ||
                'Usuário'}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.date,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {post?.created_at ||
                post?.createdAt ||
                ''}
            </Text>
          </View>
        </View>

        {/* IMAGENS DA PUBLICAÇÃO */}
        {postImages.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {postImages.map(
              (image, index) => {
                const imageFailed =
                  failedPostImages[
                    index
                  ] === true;

                if (imageFailed) {
                  return (
                    <View
                      key={`failed-image-${index}`}
                      style={[
                        localStyles.postImage,
                        localStyles.unavailableImage,
                        {
                          backgroundColor:
                            theme.card,
                        },
                      ]}
                    >
                      <Ionicons
                        name="image-outline"
                        size={48}
                        color={
                          theme.textSecondary
                        }
                      />

                      <Text
                        style={[
                          localStyles.unavailableText,
                          {
                            color:
                              theme.textSecondary,
                          },
                        ]}
                      >
                        Imagem indisponível
                      </Text>
                    </View>
                  );
                }

                return (
                  <Image
                    key={`${image}-${index}`}
                    source={{
                      uri: image,
                    }}
                    style={
                      localStyles.postImage
                    }
                    resizeMode="cover"
                    onError={(event) => {
                      handlePostImageError(
                        image,
                        index,
                        event
                      );
                    }}
                  />
                );
              }
            )}
          </ScrollView>
        ) : (
          <View
            style={[
              localStyles.postImage,
              localStyles.unavailableImage,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={48}
              color={
                theme.textSecondary
              }
            />

            <Text
              style={[
                localStyles.unavailableText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Publicação sem imagem
            </Text>
          </View>
        )}

        {/* DESCRIÇÃO */}
        <View
          style={
            styles.content
          }
        >
          <Text
            style={[
              styles.description,
              {
                color: theme.text,
              },
            ]}
          >
            {post?.description || ''}
          </Text>
        </View>

        {/* BOTÃO DE CHAT */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenChat}
          disabled={!post?.user?.id}
          style={[
            styles.chatButton,
            {
              backgroundColor:
                theme.primary,

              opacity:
                post?.user?.id
                  ? 1
                  : 0.5,
            },
          ]}
        >
          <Ionicons
            name="chatbubble"
            size={22}
            color="#ffffff"
          />

          <Text
            style={
              styles.chatButtonText
            }
          >
            Conversar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },

  /*
   * CABEÇALHO DO USUÁRIO
   */
  userContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 20,

    paddingVertical: 18,
  },

  userInfo: {
    flex: 1,

    marginLeft: 14,
  },

  /*
   * AVATAR PADRÃO
   *
   * Não possui fundo branco,
   * borda ou sombra.
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
   * Os PNGs possuem uma área
   * transparente grande.
   *
   * A escala amplia apenas o
   * desenho central.
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
   * FOTO REAL DO USUÁRIO
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
   * IMAGEM DA PUBLICAÇÃO
   */
  postImage: {
    width: SCREEN_WIDTH,

    height: 340,
  },

  unavailableImage: {
    alignItems: 'center',

    justifyContent: 'center',
  },

  unavailableText: {
    marginTop: 10,

    fontSize: 14,
  },

  /*
   * PUBLICAÇÃO INDISPONÍVEL
   */
  emptyContent: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 14,

    fontSize: 18,

    fontWeight: '700',

    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 8,

    fontSize: 14,

    lineHeight: 20,

    textAlign: 'center',
  },
});