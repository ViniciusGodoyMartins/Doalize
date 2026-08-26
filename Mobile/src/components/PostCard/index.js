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

import {
  formatDate,
} from '../../utils/dateHelper';

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
   * QUANTIDADE DE PESSOAS
   * QUE PROMOVERAM
   */
  const promotionCount =
    Math.max(
      0,
      Number(
        post
          ?.promotion_count ||
          0
      )
    );

  /*
   * INFORMA SE O USUÁRIO
   * LOGADO PROMOVEU O POST
   */
  const promotedByMe =
    Boolean(
      post?.promoted_by_me
    );

  /*
   * TEXTO DO CONTADOR
   */
  const promotionCountText =
    promotionCount === 1
      ? '1 promoção'
      : `${promotionCount} promoções`;

  /*
   * AVATAR PADRÃO
   */
  const defaultAvatarSource =
    useMemo(() => {
      return darkMode
        ? imageUserLight
        : imageUserDark;
    }, [darkMode]);

  /*
   * IMAGENS DO POST
   */
  const postImages =
    useMemo(() => {
      return parsePostImages(
        post?.images
      );
    }, [post?.images]);

  /*
   * RESUMO DO FEED
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
        typeof post
          ?.description ===
          'string' &&
        post.description.trim()
      ) {
        return post
          .description
          .trim();
      }

      return '';
    }, [
      post?.summary,
      post?.description,
    ]);

  /*
   * FOTO REAL DO USUÁRIO
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

  useEffect(() => {
    setRemoteAvatarFailed(
      false
    );
  }, [remoteAvatarUrl]);

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
          'ERRO AO REINICIAR CARROSSEL:',
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

  function handleCarouselLayout(
    event
  ) {
    const measuredWidth =
      event.nativeEvent
        ?.layout
        ?.width;

    if (
      measuredWidth &&
      measuredWidth !==
        imageWidth
    ) {
      setImageWidth(
        measuredWidth
      );
    }
  }

  function handleImageScrollEnd(
    event
  ) {
    if (
      !imageWidth ||
      postImages.length <= 1
    ) {
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

  function handleRemoteAvatarError(
    event
  ) {
    console.log(
      'ERRO AO CARREGAR AVATAR:',
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

  function handlePostImageError(
    image,
    index,
    event
  ) {
    console.log(
      'ERRO AO CARREGAR IMAGEM:',
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

  function handleOpenPost() {
    if (onPress) {
      onPress(post);
    }
  }

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
                  theme
                    .textSecondary,
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
        onPress={
          handleOpenPost
        }
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
                    theme
                      .textSecondary,
                },
              ]}
            >
              {formatDate(
                post?.created_at ||
                  post?.createdAt
              )}
            </Text>
          </View>

          {/* CONTADOR NO SELO */}
          {promotionCount > 0 ? (
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
                numberOfLines={1}
                style={[
                  localStyles.promotedText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                {promotionCountText}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* CARROSSEL */}
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
                  imageWidth,

                offset:
                  imageWidth *
                  index,

                index,
              })}
              initialNumToRender={1}
              windowSize={3}
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

      {/* RESUMO */}
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
                  theme
                    .textSecondary,
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
          style={
            styles.actionButton
          }
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
          style={
            styles.actionButton
          }
          onPress={
            handlePromotePress
          }
        >
          <Ionicons
            name={
              promotedByMe
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
            {promotedByMe
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
    defaultAvatarContainer: {
      width: 48,

      height: 48,

      marginRight: 12,

      alignItems: 'center',

      justifyContent:
        'center',

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

    promotedBadge: {
      maxWidth: 120,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 9,

      paddingVertical: 6,

      borderRadius: 14,

      marginLeft: 8,
    },

    promotedText: {
      flexShrink: 1,

      marginLeft: 5,

      fontSize: 11,

      fontWeight: '700',
    },

    carouselContainer: {
      position: 'relative',

      width: '100%',

      overflow: 'hidden',
    },

    unavailableImage: {
      alignItems: 'center',

      justifyContent:
        'center',
    },

    unavailableText: {
      marginTop: 8,

      fontSize: 14,

      fontWeight: '600',
    },

    imageCounter: {
      position: 'absolute',

      top: 12,

      right: 12,

      minWidth: 42,

      height: 28,

      borderRadius: 14,

      alignItems: 'center',

      justifyContent:
        'center',

      paddingHorizontal: 9,

      backgroundColor:
        'rgba(0, 0, 0, 0.62)',
    },

    imageCounterText: {
      color: '#ffffff',

      fontSize: 12,

      fontWeight: '800',
    },

    pagination: {
      minHeight: 26,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      paddingHorizontal: 12,

      paddingTop: 9,

      paddingBottom: 5,
    },

    paginationDot: {
      height: 7,

      borderRadius: 4,

      marginHorizontal: 3,
    },

    summaryLabel: {
      marginBottom: 5,

      fontSize: 12,

      fontWeight: '700',

      textTransform:
        'uppercase',

      letterSpacing: 0.4,
    },

    detailsHint: {
      alignSelf:
        'flex-start',

      marginTop: 8,

      fontSize: 13,

      fontWeight: '700',
    },
  });