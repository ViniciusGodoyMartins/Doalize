import React, {
  useEffect,
  useMemo,
  useRef,
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
  FlatList,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import Header from '../../components/Header';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  normalizePost,
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';

const {
  width: SCREEN_WIDTH,
} = Dimensions.get('window');

const POST_IMAGE_HEIGHT = 340;

export default function DetailsScreen({
  route,
  navigation,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const carouselRef =
    useRef(null);

  const [
    activeImageIndex,
    setActiveImageIndex,
  ] = useState(0);

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  const [
    failedPostImages,
    setFailedPostImages,
  ] = useState({});

  /*
   * NORMALIZAR A PUBLICAÇÃO RECEBIDA
   * PELA NAVEGAÇÃO.
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
   * NORMALIZAR TODAS AS IMAGENS
   * DA PUBLICAÇÃO.
   */
  const postImages = useMemo(() => {
    return parsePostImages(
      post?.images
    );
  }, [post?.images]);

  /*
   * BIOGRAFIA DO USUÁRIO
   *
   * Exemplo:
   *
   * "Tenho 18 anos e estudo
   * Desenvolvimento de Sistemas."
   */
  const userBiography = useMemo(() => {
    const biography =
      post?.user?.description;

    if (
      !biography ||
      typeof biography !== 'string'
    ) {
      return '';
    }

    return biography.trim();
  }, [post?.user?.description]);

  /*
   * LOCALIZAÇÃO DO USUÁRIO.
   */
  const userLocation = useMemo(() => {
    const location =
      post?.user?.location;

    if (
      !location ||
      typeof location !== 'string'
    ) {
      return '';
    }

    return location.trim();
  }, [post?.user?.location]);

  /*
   * DESCRIÇÃO COMPLETA DA PUBLICAÇÃO.
   *
   * O resumo curto não é utilizado
   * nesta tela.
   */
  const fullDescription =
    useMemo(() => {
      const description =
        post?.description;

      if (
        !description ||
        typeof description !==
          'string'
      ) {
        return '';
      }

      return description.trim();
    }, [post?.description]);

  /*
   * REGRA DO AVATAR PADRÃO:
   *
   * Tema claro:
   * imageuserdark.png
   *
   * Tema escuro:
   * imageuserlight.png
   */
  const defaultAvatarSource =
    useMemo(() => {
      return darkMode
        ? imageUserLight
        : imageUserDark;
    }, [darkMode]);

  /*
   * FOTO REAL DO USUÁRIO.
   */
  const remoteAvatarUrl =
    useMemo(() => {
      const photo =
        post?.user?.photo;

      if (
        !photo ||
        typeof photo !==
          'string' ||
        !photo.trim()
      ) {
        return null;
      }

      return resolveImageUrl(
        photo
      );
    }, [post?.user?.photo]);

  /*
   * REINICIAR O AVATAR QUANDO
   * A FOTO DO USUÁRIO MUDAR.
   */
  useEffect(() => {
    setRemoteAvatarFailed(
      false
    );
  }, [remoteAvatarUrl]);

  /*
   * REINICIAR O CARROSSEL QUANDO
   * OUTRA PUBLICAÇÃO FOR ABERTA.
   */
  useEffect(() => {
    setFailedPostImages({});
    setActiveImageIndex(0);

    if (
      carouselRef.current &&
      postImages.length > 0
    ) {
      try {
        carouselRef.current
          .scrollToOffset({
            offset: 0,
            animated: false,
          });
      } catch (error) {
        console.log(
          'NÃO FOI POSSÍVEL REINICIAR O CARROSSEL DOS DETALHES:',
          error.message
        );
      }
    }
  }, [
    post?.id,
    postImages.length,
  ]);

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;

  /*
   * FORMATAR A DATA DA PUBLICAÇÃO
   *
   * Entrada:
   *
   * 2026-08-20T15:05:42.000Z
   *
   * Saída:
   *
   * 20/08/2026
   */
  function formatPostDate(
    dateValue
  ) {
    if (!dateValue) {
      return '';
    }

    /*
     * Quando a API envia uma data no formato
     * YYYY-MM-DD, utilizamos diretamente seus
     * componentes para evitar alterações de
     * dia causadas pelo fuso horário.
     */
    if (
      typeof dateValue === 'string'
    ) {
      const dateMatch =
        dateValue.match(
          /^(\d{4})-(\d{2})-(\d{2})/
        );

      if (dateMatch) {
        const [
          ,
          year,
          month,
          day,
        ] = dateMatch;

        return `${day}/${month}/${year}`;
      }
    }

    /*
     * Fallback para outros formatos de data.
     */
    const parsedDate =
      new Date(dateValue);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '';
    }

    return parsedDate
      .toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      );
  }

  /*
   * ERRO NA FOTO REAL DO USUÁRIO.
   */
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

    setRemoteAvatarFailed(
      true
    );
  }

  /*
   * ERRO EM UMA IMAGEM ESPECÍFICA
   * DA PUBLICAÇÃO.
   */
  function handlePostImageError(
    image,
    index,
    event
  ) {
    console.log(
      'ERRO AO CARREGAR IMAGEM NOS DETALHES:',
      {
        postId:
          post?.id,

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

        updatedErrors[index] =
          true;

        return updatedErrors;
      }
    );
  }

  /*
   * ATUALIZAR A IMAGEM ATIVA
   * DEPOIS DO DESLIZE.
   */
  function handleImageScrollEnd(
    event
  ) {
    const offsetX =
      event.nativeEvent
        ?.contentOffset
        ?.x || 0;

    const calculatedIndex =
      Math.round(
        offsetX /
        SCREEN_WIDTH
      );

    const safeIndex =
      Math.max(
        0,
        Math.min(
          calculatedIndex,
          postImages.length - 1
        )
      );

    setActiveImageIndex(
      safeIndex
    );
  }

  /*
   * RENDERIZAR UMA IMAGEM
   * DO CARROSSEL.
   */
  function renderPostImage({
    item,
    index,
  }) {
    const imageFailed =
      failedPostImages[
        index
      ] === true;

    if (imageFailed) {
      return (
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
            Imagem indisponível
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={{
          uri: item,
        }}
        style={
          localStyles.postImage
        }
        resizeMode="cover"
        onError={(event) => {
          handlePostImageError(
            item,
            index,
            event
          );
        }}
      />
    );
  }

  /*
   * ABRIR O CHAT COM O RESPONSÁVEL
   * PELA PUBLICAÇÃO.
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
   * ESTADO SEM PUBLICAÇÃO.
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
                color:
                  theme.text,
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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          localStyles.scrollContent
        }
        nestedScrollEnabled
      >
        {/* USUÁRIO */}
        <View
          style={[
            styles.userContainer,
            localStyles.userContainer,
          ]}
        >
          {hasRemoteAvatar ? (
            <View
              style={
                localStyles.remoteAvatarContainer
              }
            >
              <Image
                source={{
                  uri:
                    remoteAvatarUrl,
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
                  color:
                    theme.text,
                },
              ]}
            >
              {post?.user?.name ||
                'Usuário'}
            </Text>

            {userLocation ? (
              <View
                style={
                  localStyles.locationContainer
                }
              >
                <Ionicons
                  name="location-outline"
                  size={15}
                  color={
                    theme.primary
                  }
                />

                <Text
                  numberOfLines={1}
                  style={[
                    localStyles.locationText,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  {userLocation}
                </Text>
              </View>
            ) : null}

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
              {formatPostDate(
                post?.created_at ||
                  post?.createdAt
              )}
            </Text>
          </View>
        </View>

        {/* BIOGRAFIA DO USUÁRIO */}
        {userBiography ? (
          <View
            style={[
              localStyles.biographyContainer,
              {
                backgroundColor:
                  theme.card,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <View
              style={
                localStyles.biographyHeader
              }
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={
                  theme.primary
                }
              />

              <Text
                style={[
                  localStyles.biographyTitle,
                  {
                    color:
                      theme.text,
                  },
                ]}
              >
                Sobre o responsável
              </Text>
            </View>

            <Text
              numberOfLines={3}
              style={[
                localStyles.biographyText,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {userBiography}
            </Text>
          </View>
        ) : null}

        {/* CARROSSEL DE IMAGENS */}
        {postImages.length > 0 ? (
          <>
            <View
              style={
                localStyles.carouselContainer
              }
            >
              <FlatList
                ref={carouselRef}
                data={postImages}
                horizontal
                pagingEnabled
                nestedScrollEnabled
                bounces={false}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={
                  false
                }
                keyExtractor={(
                  item,
                  index
                ) =>
                  `${post?.id || 'post'}-${item}-${index}`
                }
                renderItem={
                  renderPostImage
                }
                onMomentumScrollEnd={
                  handleImageScrollEnd
                }
                getItemLayout={(
                  _,
                  index
                ) => ({
                  length:
                    SCREEN_WIDTH,

                  offset:
                    SCREEN_WIDTH *
                    index,

                  index,
                })}
                initialNumToRender={1}
                windowSize={3}
              />

              {/* CONTADOR 1/3 */}
              {postImages.length > 1 ? (
                <View
                  pointerEvents="none"
                  style={
                    localStyles.imageCounter
                  }
                >
                  <Text
                    style={
                      localStyles.imageCounterText
                    }
                  >
                    {activeImageIndex + 1}/
                    {postImages.length}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* BOLINHAS */}
            {postImages.length > 1 ? (
              <View
                style={
                  localStyles.pagination
                }
              >
                {postImages.map(
                  (
                    _,
                    index
                  ) => {
                    const isActive =
                      index ===
                      activeImageIndex;

                    return (
                      <View
                        key={`detail-dot-${post?.id}-${index}`}
                        style={[
                          localStyles.paginationDot,
                          {
                            width:
                              isActive
                                ? 18
                                : 7,

                            backgroundColor:
                              isActive
                                ? theme.primary
                                : theme
                                    .textSecondary,

                            opacity:
                              isActive
                                ? 1
                                : 0.35,
                          },
                        ]}
                      />
                    );
                  }
                )}
              </View>
            ) : null}
          </>
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

        {/* DESCRIÇÃO COMPLETA */}
        <View
          style={[
            styles.content,
            localStyles.descriptionContainer,
          ]}
        >
          <Text
            style={[
              localStyles.descriptionTitle,
              {
                color:
                  theme.text,
              },
            ]}
          >
            Descrição completa
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {fullDescription ||
              'Nenhuma descrição informada.'}
          </Text>
        </View>

        {/* BOTÃO CONVERSAR */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenChat}
          disabled={
            !post?.user?.id
          }
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

const localStyles =
  StyleSheet.create({
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

      minWidth: 0,
    },

    /*
     * LOCALIZAÇÃO
     */
    locationContainer: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 4,
    },

    locationText: {
      flex: 1,

      marginLeft: 4,

      fontSize: 13,
    },

    /*
     * AVATAR PADRÃO
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
     * FOTO REAL
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
     * BIOGRAFIA DO USUÁRIO
     */
    biographyContainer: {
      marginHorizontal: 20,

      marginBottom: 18,

      paddingHorizontal: 16,

      paddingVertical: 14,

      borderWidth: 1,

      borderRadius: 16,
    },

    biographyHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 8,
    },

    biographyTitle: {
      marginLeft: 7,

      fontSize: 14,

      fontWeight: '700',
    },

    biographyText: {
      fontSize: 14,

      lineHeight: 21,
    },

    /*
     * CARROSSEL
     */
    carouselContainer: {
      position: 'relative',

      width: SCREEN_WIDTH,

      height:
        POST_IMAGE_HEIGHT,

      overflow: 'hidden',
    },

    postImage: {
      width: SCREEN_WIDTH,

      height:
        POST_IMAGE_HEIGHT,
    },

    unavailableImage: {
      alignItems: 'center',

      justifyContent: 'center',
    },

    unavailableText: {
      marginTop: 10,

      fontSize: 14,

      fontWeight: '600',
    },

    /*
     * CONTADOR 1/3
     */
    imageCounter: {
      position: 'absolute',

      top: 12,

      right: 12,

      minWidth: 42,

      height: 28,

      borderRadius: 14,

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 9,

      backgroundColor:
        'rgba(0, 0, 0, 0.62)',
    },

    imageCounterText: {
      color: '#ffffff',

      fontSize: 12,

      fontWeight: '800',
    },

    /*
     * BOLINHAS DO CARROSSEL
     */
    pagination: {
      minHeight: 30,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingTop: 10,

      paddingBottom: 6,

      paddingHorizontal: 16,
    },

    paginationDot: {
      height: 7,

      borderRadius: 4,

      marginHorizontal: 3,
    },

    /*
     * DESCRIÇÃO COMPLETA
     */
    descriptionContainer: {
      paddingTop: 16,
    },

    descriptionTitle: {
      marginBottom: 10,

      fontSize: 17,

      fontWeight: '800',
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