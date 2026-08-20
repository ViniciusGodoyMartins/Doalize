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
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import styles from './styles';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

export default function PostCard({
  post,
  onPress,
  onShare,
  onPromote,
}) {
  const {
    theme,
    darkMode,
  } = useTheme();

  const carouselRef =
    useRef(null);

  const [
    imageWidth,
    setImageWidth,
  ] = useState(0);

  const [
    activeImageIndex,
    setActiveImageIndex,
  ] = useState(0);

  const [
    failedPostImages,
    setFailedPostImages,
  ] = useState({});

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  /*
   * AVATAR PADRÃO
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
   * NORMALIZAR TODAS AS IMAGENS
   * DA PUBLICAÇÃO
   */
  const postImages =
    useMemo(() => {
      return parsePostImages(
        post?.images
      );
    }, [post?.images]);

  /*
   * RESUMO EXIBIDO NO FEED
   *
   * Para publicações novas:
   * post.summary
   *
   * Para publicações antigas:
   * post.description
   */
  const feedSummary =
    useMemo(() => {
      if (
        typeof post?.summary ===
          'string' &&
        post.summary.trim()
      ) {
        return post.summary.trim();
      }

      if (
        typeof post?.description ===
          'string' &&
        post.description.trim()
      ) {
        return post.description.trim();
      }

      return '';
    }, [
      post?.summary,
      post?.description,
    ]);

  /*
   * RESOLVER FOTO REAL DO USUÁRIO
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
   * REINICIA O AVATAR QUANDO
   * A FOTO DO USUÁRIO MUDAR
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);

  /*
   * REINICIA O CARROSSEL QUANDO
   * A PUBLICAÇÃO OU AS IMAGENS MUDAREM
   */
  useEffect(() => {
    setActiveImageIndex(0);
    setFailedPostImages({});

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
          'NÃO FOI POSSÍVEL REINICIAR O CARROSSEL:',
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
   * MEDIR A LARGURA REAL DO CARTÃO
   *
   * Não utilizamos a largura total da tela,
   * porque o Feed possui espaçamentos laterais.
   */
  function handleCarouselLayout(
    event
  ) {
    const measuredWidth =
      event.nativeEvent
        ?.layout
        ?.width;

    if (
      measuredWidth &&
      measuredWidth !== imageWidth
    ) {
      setImageWidth(
        measuredWidth
      );
    }
  }

  /*
   * ATUALIZAR A BOLINHA ATIVA
   * APÓS O DESLIZE
   */
  function handleImageScrollEnd(
    event
  ) {
    if (!imageWidth) {
      return;
    }

    const offsetX =
      event.nativeEvent
        ?.contentOffset
        ?.x || 0;

    const calculatedIndex =
      Math.round(
        offsetX /
        imageWidth
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
   * ERRO NA FOTO DO USUÁRIO
   */
  function handleRemoteAvatarError(
    event
  ) {
    console.log(
      'ERRO AO CARREGAR AVATAR NO FEED:',
      {
        originalPhoto:
          post?.user?.photo,

        resolvedUrl:
          remoteAvatarUrl,

        error:
          event?.nativeEvent,
      }
    );

    setRemoteAvatarFailed(true);
  }

  /*
   * ERRO EM UMA IMAGEM ESPECÍFICA
   *
   * Uma imagem com erro não impede que
   * as outras imagens sejam exibidas.
   */
  function handlePostImageError(
    image,
    index,
    event
  ) {
    console.log(
      'ERRO AO CARREGAR IMAGEM DO POST:',
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
   * ABRIR DETALHES
   */
  function handleOpenPost() {
    if (onPress) {
      onPress(post);
    }
  }

  /*
   * COMPARTILHAR
   */
  function handleSharePress(
    event
  ) {
    if (
      event?.stopPropagation
    ) {
      event.stopPropagation();
    }

    if (onShare) {
      onShare(post);
    }
  }

  /*
   * PROMOVER
   */
  function handlePromotePress(
    event
  ) {
    if (
      event?.stopPropagation
    ) {
      event.stopPropagation();
    }

    if (onPromote) {
      onPromote(post);
    }
  }

  /*
   * ITEM DO CARROSSEL
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={
            handleOpenPost
          }
          style={[
            styles.postImage,
            localStyles.unavailableImage,
            {
              width:
                imageWidth ||
                '100%',

              backgroundColor:
                theme.background,
            },
          ]}
        >
          <Ionicons
            name="image-outline"
            size={46}
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
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={
          handleOpenPost
        }
        style={{
          width:
            imageWidth ||
            '100%',
        }}
      >
        <Image
          source={{
            uri: item,
          }}
          style={[
            styles.postImage,
            {
              width:
                imageWidth ||
                '100%',
            },
          ]}
          resizeMode="cover"
          onError={(event) => {
            handlePostImageError(
              item,
              index,
              event
            );
          }}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.card,
        },
      ]}
    >
      {/* CABEÇALHO */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleOpenPost}
        style={styles.header}
      >
        <View
          style={styles.userInfo}
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
            style={
              localStyles.userTextContainer
            }
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
                'Agora'}
            </Text>
          </View>

          {post?.promoted ? (
            <View
              style={[
                localStyles.promotedBadge,
                {
                  backgroundColor:
                    `${theme.primary}20`,
                },
              ]}
            >
              <Ionicons
                name="rocket"
                size={15}
                color={
                  theme.primary
                }
              />

              <Text
                style={[
                  localStyles.promotedText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                Promovido
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* CARROSSEL DE IMAGENS */}
      {postImages.length > 0 ? (
        <View
          onLayout={
            handleCarouselLayout
          }
          style={
            localStyles.carouselContainer
          }
        >
          {imageWidth > 0 ? (
            <FlatList
              ref={carouselRef}
              data={postImages}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              showsHorizontalScrollIndicator={
                false
              }
              bounces={false}
              decelerationRate="fast"
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
                  imageWidth,

                offset:
                  imageWidth *
                  index,

                index,
              })}
              initialNumToRender={1}
              windowSize={3}
              removeClippedSubviews
            />
          ) : (
            <View
              style={[
                styles.postImage,
                {
                  width: '100%',

                  backgroundColor:
                    theme.background,
                },
              ]}
            />
          )}

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
      ) : null}

      {/* BOLINHAS DO CARROSSEL */}
      {postImages.length > 1 ? (
        <View
          style={
            localStyles.pagination
          }
        >
          {postImages.map(
            (
              image,
              index
            ) => {
              const isActive =
                index ===
                activeImageIndex;

              return (
                <View
                  key={`dot-${post?.id}-${index}`}
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

      {/* RESUMO PARA O FEED */}
      {feedSummary ? (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={
            handleOpenPost
          }
          style={styles.content}
        >
          <Text
            style={[
              localStyles.summaryLabel,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Resumo
          </Text>

          <Text
            numberOfLines={3}
            style={[
              styles.description,
              {
                color:
                  theme.text,
              },
            ]}
          >
            {feedSummary}
          </Text>

          <Text
            style={[
              localStyles.detailsHint,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            Ver detalhes
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* AÇÕES */}
      <View
        style={[
          styles.actions,
          {
            borderTopColor:
              theme.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionButton}
          onPress={
            handleSharePress
          }
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={
              theme.primary
            }
          />

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            Compartilhar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionButton}
          onPress={
            handlePromotePress
          }
        >
          <Ionicons
            name={
              post?.promoted
                ? 'rocket'
                : 'rocket-outline'
            }
            size={24}
            color={
              theme.primary
            }
          />

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.primary,
              },
            ]}
          >
            {post?.promoted
              ? 'Promovido'
              : 'Promover'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles =
  StyleSheet.create({
    /*
     * AVATAR PADRÃO
     */
    defaultAvatarContainer: {
      width: 48,

      height: 48,

      marginRight: 12,

      alignItems: 'center',

      justifyContent: 'center',

      overflow: 'hidden',

      backgroundColor:
        'transparent',
    },

    defaultAvatar: {
      width: 48,

      height: 48,

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
      width: 48,

      height: 48,

      marginRight: 12,

      borderRadius: 24,

      overflow: 'hidden',

      backgroundColor:
        'transparent',
    },

    remoteAvatar: {
      width: '100%',

      height: '100%',
    },

    userTextContainer: {
      flex: 1,

      minWidth: 0,
    },

    /*
     * PUBLICAÇÃO PROMOVIDA
     */
    promotedBadge: {
      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 12,

      marginLeft: 8,
    },

    promotedText: {
      marginLeft: 4,

      fontSize: 11,

      fontWeight: '700',
    },

    /*
     * CARROSSEL
     */
    carouselContainer: {
      position: 'relative',

      width: '100%',

      overflow: 'hidden',
    },

    unavailableImage: {
      alignItems: 'center',

      justifyContent: 'center',
    },

    unavailableText: {
      marginTop: 8,

      fontSize: 14,

      fontWeight: '600',
    },

    /*
     * CONTADOR DA IMAGEM
     *
     * Exemplo:
     * 1/3
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
     * PAGINAÇÃO
     */
    pagination: {
      minHeight: 26,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      paddingHorizontal: 12,

      paddingTop: 9,

      paddingBottom: 5,
    },

    paginationDot: {
      height: 7,

      borderRadius: 4,

      marginHorizontal: 3,
    },

    /*
     * RESUMO
     */
    summaryLabel: {
      marginBottom: 5,

      fontSize: 12,

      fontWeight: '700',

      textTransform:
        'uppercase',

      letterSpacing: 0.4,
    },

    detailsHint: {
      alignSelf: 'flex-start',

      marginTop: 8,

      fontSize: 13,

      fontWeight: '700',
    },
  });