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


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  /*
   * MODO ESCURO
   */

  darkBackground:
    '#141414',

  darkText:
    '#F5F5F5',

  darkTextSecondary:
    'rgba(245, 245, 245, 0.65)',

  darkDivider:
    'rgba(245, 245, 245, 0.22)',

  darkUnavailableBackground:
    '#155269',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightText:
    '#141414',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.65)',

  lightDivider:
    'rgba(20, 20, 20, 0.22)',

  lightUnavailableBackground:
    '#E8E8E8',


  /*
   * CORES COMPARTILHADAS
   */

  primary:
    '#3AC2F8',

  white:
    '#FFFFFF',

  black:
    '#141414',
};


/*
 * ============================================================
 * POST CARD
 * ============================================================
 */

export default function PostCard({
  post,
  onPress,
  onShare,
  onPromote,
}) {

  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    darkMode,
  } = useTheme();


  const cardBackgroundColor =
    darkMode
      ? COLORS.darkBackground
      : COLORS.lightBackground;


  const mainTextColor =
    darkMode
      ? COLORS.darkText
      : COLORS.lightText;


  const secondaryTextColor =
    darkMode
      ? COLORS.darkTextSecondary
      : COLORS.lightTextSecondary;


  const dividerColor =
    darkMode
      ? COLORS.darkDivider
      : COLORS.lightDivider;


  const unavailableBackgroundColor =
    darkMode
      ? COLORS.darkUnavailableBackground
      : COLORS.lightUnavailableBackground;


  const actionIconColor =
    darkMode
      ? COLORS.white
      : COLORS.black;


  /*
   * ==========================================================
   * REFERÊNCIAS
   * ==========================================================
   */

  const carouselRef =
    useRef(null);


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

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


  const [
    imageRatios,
    setImageRatios,
  ] = useState({});


  /*
   * ==========================================================
   * PROMOÇÕES
   * ==========================================================
   */

  const promotionCount =
    Math.max(
      0,
      Number(
        post?.promotion_count ||
        0
      )
    );


  const promotedByMe =
    Boolean(
      post?.promoted_by_me
    );


  const promotionCountText =
    promotionCount === 1
      ? '1 promoção'
      : `${promotionCount} promoções`;


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   */

  const defaultAvatarSource =
    useMemo(() => {

      return darkMode
        ? imageUserLight
        : imageUserDark;

    }, [
      darkMode,
    ]);


  /*
   * ==========================================================
   * IMAGENS DA PUBLICAÇÃO
   * ==========================================================
   */

  const postImages =
    useMemo(() => {

      try {

        const parsedImages =
          parsePostImages(
            post?.images ||
            post?.image
          );


        if (
          !Array.isArray(
            parsedImages
          )
        ) {

          return [];

        }


        return parsedImages
          .map(
            (
              image
            ) => {

              try {

                return resolveImageUrl(
                  image
                );

              } catch (error) {

                console.log(
                  'ERRO AO RESOLVER IMAGEM DA PUBLICAÇÃO:',
                  {
                    postId:
                      post?.id,

                    image,

                    message:
                      error?.message,
                  }
                );


                return null;

              }

            }
          )
          .filter(
            Boolean
          );

      } catch (error) {

        console.log(
          'ERRO AO PROCESSAR IMAGENS DA PUBLICAÇÃO:',
          {
            postId:
              post?.id,

            message:
              error?.message,
          }
        );


        return [];

      }

    }, [
      post?.id,
      post?.images,
      post?.image,
    ]);


  /*
   * ==========================================================
   * RESUMO
   * ==========================================================
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
   * ==========================================================
   * FOTO REAL DO USUÁRIO
   * ==========================================================
   */

  const remoteAvatarUrl =
    useMemo(() => {

      const photo =
        post?.user?.photo;


      if (
        typeof photo !==
          'string' ||
        !photo.trim()
      ) {

        return null;

      }


      try {

        return resolveImageUrl(
          photo
        );

      } catch (error) {

        console.log(
          'ERRO AO RESOLVER FOTO DO USUÁRIO:',
          {
            postId:
              post?.id,

            photo,

            message:
              error?.message,
          }
        );


        return null;

      }

    }, [
      post?.id,
      post?.user?.photo,
    ]);


  /*
   * ==========================================================
   * ALTURA DO CARROSSEL
   * ==========================================================
   */

  const activeImageRatio =
    imageRatios[
      activeImageIndex
    ] ||
    imageRatios[0] ||
    1.5;


  const calculatedCarouselHeight =
    imageWidth > 0 &&
    activeImageRatio > 0
      ? imageWidth /
        activeImageRatio
      : 180;


  const carouselHeight =
    Math.max(
      180,
      calculatedCarouselHeight
    );


  /*
   * ==========================================================
   * RESETAR AVATAR
   * ==========================================================
   */

  useEffect(() => {

    setRemoteAvatarFailed(
      false
    );

  }, [
    remoteAvatarUrl,
  ]);


  /*
   * ==========================================================
   * DESCOBRIR PROPORÇÃO DAS IMAGENS
   * ==========================================================
   */

  useEffect(() => {

    let effectIsActive =
      true;


    setImageRatios(
      {}
    );


    postImages.forEach(
      (
        imageUrl,
        index
      ) => {

        if (!imageUrl) {
          return;
        }


        Image.getSize(
          imageUrl,

          (
            width,
            height
          ) => {

            if (
              !effectIsActive ||
              width <= 0 ||
              height <= 0
            ) {

              return;

            }


            setImageRatios(
              (
                currentRatios
              ) => {

                return {
                  ...currentRatios,

                  [index]:
                    width /
                    height,
                };

              }
            );

          },

          (
            error
          ) => {

            console.log(
              'ERRO AO OBTER DIMENSÕES DA IMAGEM:',
              {
                postId:
                  post?.id,

                image:
                  imageUrl,

                index,

                message:
                  error?.message,
              }
            );

          }

        );

      }
    );


    return () => {

      effectIsActive =
        false;

    };

  }, [
    post?.id,
    postImages,
  ]);


  /*
   * ==========================================================
   * RESETAR CARROSSEL
   * ==========================================================
   */

  useEffect(() => {

    setActiveImageIndex(
      0
    );


    setFailedPostImages(
      {}
    );


    if (
      carouselRef.current &&
      postImages.length > 0
    ) {

      try {

        carouselRef.current
          .scrollToOffset({
            offset:
              0,

            animated:
              false,
          });

      } catch (error) {

        console.log(
          'ERRO AO REINICIAR CARROSSEL:',
          error?.message
        );

      }

    }

  }, [
    post?.id,
    postImages.length,
  ]);


  /*
   * ==========================================================
   * AVATAR
   * ==========================================================
   */

  const hasRemoteAvatar =
    Boolean(
      remoteAvatarUrl
    ) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * MEDIR LARGURA DO CARROSSEL
   * ==========================================================
   */

  function handleCarouselLayout(
    event
  ) {

    const measuredWidth =
      event.nativeEvent
        ?.layout
        ?.width;


    if (
      typeof measuredWidth !==
        'number' ||
      measuredWidth <= 0
    ) {

      return;

    }


    if (
      measuredWidth !==
      imageWidth
    ) {

      setImageWidth(
        measuredWidth
      );

    }

  }


  /*
   * ==========================================================
   * FINAL DO CARROSSEL
   * ==========================================================
   */

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
        ?.x ||
      0;


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
          postImages.length -
            1
        )
      );


    setActiveImageIndex(
      safeIndex
    );

  }


  /*
   * ==========================================================
   * ERRO NO AVATAR
   * ==========================================================
   */

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


  /*
   * ==========================================================
   * ERRO NA IMAGEM
   * ==========================================================
   */

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
      (
        currentErrors
      ) => {

        return {
          ...currentErrors,

          [index]:
            true,
        };

      }
    );

  }


  /*
   * ==========================================================
   * ABRIR PUBLICAÇÃO
   * ==========================================================
   */

  function handleOpenPost() {

    if (
      typeof onPress ===
      'function'
    ) {

      onPress(
        post
      );

    }

  }


  /*
   * ==========================================================
   * COMPARTILHAR
   * ==========================================================
   */

  function handleSharePress(
    event
  ) {

    if (
      typeof event
        ?.stopPropagation ===
      'function'
    ) {

      event.stopPropagation();

    }


    if (
      typeof onShare ===
      'function'
    ) {

      onShare(
        post
      );

    }

  }


  /*
   * ==========================================================
   * PROMOVER
   * ==========================================================
   */

  function handlePromotePress(
    event
  ) {

    if (
      typeof event
        ?.stopPropagation ===
      'function'
    ) {

      event.stopPropagation();

    }


    if (
      typeof onPromote ===
      'function'
    ) {

      onPromote(
        post
      );

    }

  }


  /*
   * ==========================================================
   * RENDERIZAR IMAGEM
   * ==========================================================
   */

  function renderPostImage({
    item,
    index,
  }) {

    const imageFailed =
      failedPostImages[
        index
      ] === true;


    if (
      imageFailed ||
      !item
    ) {

      return (

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={
            handleOpenPost
          }
          style={[
            localStyles.imageWrapper,

            localStyles.unavailableImage,

            {
              width:
                imageWidth ||
                '100%',

              height:
                carouselHeight,

              backgroundColor:
                unavailableBackgroundColor,
            },
          ]}
        >

          <Ionicons
            name="image-outline"
            size={46}
            color={
              secondaryTextColor
            }
          />


          <Text
            style={[
              localStyles.unavailableText,

              {
                color:
                  secondaryTextColor,
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
        style={[
          localStyles.imageWrapper,

          {
            width:
              imageWidth ||
              '100%',

            height:
              carouselHeight,

            backgroundColor:
              cardBackgroundColor,
          },
        ]}
      >

        <Image
          source={{
            uri:
              item,
          }}
          style={[
            styles.postImage,

            {
              width:
                '100%',

              height:
                '100%',

              backgroundColor:
                cardBackgroundColor,
            },
          ]}
          resizeMode="contain"
          onError={(
            event
          ) => {

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


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <View
      style={[
        styles.container,

        {
          backgroundColor:
            cardBackgroundColor,
        },
      ]}
    >

      {/* ======================================================
          CABEÇALHO
          ====================================================== */}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={
          handleOpenPost
        }
        style={[
          styles.header,

          {
            backgroundColor:
              cardBackgroundColor,
          },
        ]}
      >

        <View
          style={
            styles.userInfo
          }
        >

          {/* AVATAR */}

          {
            hasRemoteAvatar ? (

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

            )
          }


          {/* NOME */}

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
                    mainTextColor,
                },
              ]}
            >
              {
                post?.user?.name ||
                'Usuário'
              }
            </Text>

          </View>


          {/* PROMOÇÕES */}

          {
            promotionCount > 0 ? (

              <View
                style={
                  localStyles.promotedBadge
                }
              >

                <Ionicons
                  name="rocket"
                  size={15}
                  color={
                    COLORS.primary
                  }
                />


                <Text
                  numberOfLines={1}
                  style={
                    localStyles.promotedText
                  }
                >
                  {
                    promotionCountText
                  }
                </Text>

              </View>

            ) : null
          }

        </View>

      </TouchableOpacity>


      {/* ======================================================
          CARROSSEL
          ====================================================== */}

      {
        postImages.length > 0 ? (

          <View
            onLayout={
              handleCarouselLayout
            }
            style={[
              localStyles.carouselContainer,

              {
                height:
                  carouselHeight,

                backgroundColor:
                  cardBackgroundColor,
              },
            ]}
          >

            {
              imageWidth > 0 ? (

                <FlatList
                  ref={
                    carouselRef
                  }
                  data={
                    postImages
                  }
                  horizontal
                  pagingEnabled
                  nestedScrollEnabled
                  bounces={false}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={
                    false
                  }
                  style={{
                    width:
                      imageWidth,

                    height:
                      carouselHeight,

                    flexGrow:
                      0,

                    flexShrink:
                      0,

                    backgroundColor:
                      cardBackgroundColor,
                  }}
                  contentContainerStyle={{
                    height:
                      carouselHeight,

                    backgroundColor:
                      cardBackgroundColor,
                  }}
                  keyExtractor={(
                    item,
                    index
                  ) =>
                    `${post?.id || 'post'}-${String(item)}-${index}`
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
                  initialNumToRender={
                    1
                  }
                  windowSize={
                    3
                  }
                />

              ) : (

                <View
                  style={[
                    styles.postImage,

                    {
                      width:
                        '100%',

                      height:
                        carouselHeight,

                      backgroundColor:
                        cardBackgroundColor,
                    },
                  ]}
                />

              )
            }


            {/* CONTADOR */}

            {
              postImages.length > 1 ? (

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
                    {
                      activeImageIndex +
                      1
                    }/
                    {
                      postImages.length
                    }
                  </Text>

                </View>

              ) : null
            }

          </View>

        ) : null
      }


      {/* ======================================================
          PAGINAÇÃO
          ====================================================== */}

      {
        postImages.length > 1 ? (

          <View
            style={[
              localStyles.pagination,

              {
                backgroundColor:
                  cardBackgroundColor,
              },
            ]}
          >

            {
              postImages.map(
                (
                  _,
                  index
                ) => {

                  const isActive =
                    index ===
                    activeImageIndex;


                  return (

                    <View
                      key={
                        `dot-${post?.id}-${index}`
                      }
                      style={[
                        localStyles.paginationDot,

                        {
                          width:
                            isActive
                              ? 18
                              : 7,

                          backgroundColor:
                            isActive
                              ? COLORS.primary
                              : secondaryTextColor,

                          opacity:
                            isActive
                              ? 1
                              : 0.35,
                        },
                      ]}
                    />

                  );

                }
              )
            }

          </View>

        ) : null
      }


      {/* ======================================================
          RESUMO
          ====================================================== */}

      {
        feedSummary ? (

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={
              handleOpenPost
            }
            style={[
              styles.content,

              {
                backgroundColor:
                  cardBackgroundColor,
              },
            ]}
          >

            <Text
              numberOfLines={3}
              style={[
                styles.description,

                {
                  color:
                    mainTextColor,
                },
              ]}
            >
              {
                feedSummary
              }
            </Text>

          </TouchableOpacity>

        ) : null
      }


      {/* ======================================================
          AÇÕES E DATA
          ====================================================== */}

      <View
        style={[
          styles.actions,

          {
            backgroundColor:
              cardBackgroundColor,

            borderBottomColor:
              dividerColor,
          },
        ]}
      >

        <View
          style={
            localStyles.actionGroup
          }
        >

          {/* COMPARTILHAR */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.actionButton,

              localStyles.shareActionButton,
            ]}
            onPress={
              handleSharePress
            }
            accessibilityRole="button"
            accessibilityLabel="Compartilhar publicação"
          >

            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={
                actionIconColor
              }
            />

          </TouchableOpacity>


          {/* PROMOVER */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={
              styles.actionButton
            }
            onPress={
              handlePromotePress
            }
            accessibilityRole="button"
            accessibilityLabel={
              promotedByMe
                ? 'Remover promoção'
                : 'Promover publicação'
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
                promotedByMe
                  ? COLORS.primary
                  : actionIconColor
              }
            />

          </TouchableOpacity>

        </View>


        {/* DATA */}

        <Text
          numberOfLines={1}
          style={[
            styles.date,

            {
              color:
                secondaryTextColor,
            },
          ]}
        >
          {
            formatDate(
              post?.created_at ||
              post?.createdAt
            )
          }
        </Text>

      </View>

    </View>

  );

}


/*
 * ============================================================
 * ESTILOS LOCAIS
 * ============================================================
 */

const localStyles =
  StyleSheet.create({

    defaultAvatarContainer: {
      width:
        48,

      height:
        48,

      marginRight:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    defaultAvatar: {
      width:
        48,

      height:
        48,

      transform: [
        {
          scale:
            4.2,
        },
      ],
    },


    remoteAvatarContainer: {
      width:
        48,

      height:
        48,

      marginRight:
        12,

      borderRadius:
        24,

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    remoteAvatar: {
      width:
        '100%',

      height:
        '100%',

      borderRadius:
        24,
    },


    userTextContainer: {
      flex:
        1,

      minWidth:
        0,
    },


    promotedBadge: {
      maxWidth:
        125,

      minHeight:
        30,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        9,

      paddingVertical:
        5,

      borderRadius:
        15,

      marginLeft:
        8,

      backgroundColor:
        'rgba(58, 194, 248, 0.12)',

      flexShrink:
        0,
    },


    promotedText: {
      flexShrink:
        1,

      marginLeft:
        5,

      fontSize:
        10,

      lineHeight:
        14,

      fontWeight:
        '600',

      color:
        COLORS.primary,

      includeFontPadding:
        false,
    },


    carouselContainer: {
      position:
        'relative',

      width:
        '100%',

      flexGrow:
        0,

      flexShrink:
        0,

      overflow:
        'hidden',

      backgroundColor:
        COLORS.darkBackground,
    },


    imageWrapper: {
      flexGrow:
        0,

      flexShrink:
        0,

      alignSelf:
        'flex-start',

      overflow:
        'hidden',

      backgroundColor:
        COLORS.darkBackground,
    },


    unavailableImage: {
      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkUnavailableBackground,
    },


    unavailableText: {
      marginTop:
        8,

      fontSize:
        13,

      fontWeight:
        '500',

      color:
        COLORS.darkTextSecondary,

      includeFontPadding:
        false,
    },


    imageCounter: {
      position:
        'absolute',

      top:
        10,

      right:
        10,

      minWidth:
        42,

      height:
        26,

      borderRadius:
        13,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        9,

      backgroundColor:
        'rgba(20, 20, 20, 0.78)',
    },


    imageCounterText: {
      color:
        COLORS.white,

      fontSize:
        11,

      lineHeight:
        14,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },


    pagination: {
      minHeight:
        25,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        12,

      paddingTop:
        7,

      paddingBottom:
        4,

      backgroundColor:
        COLORS.darkBackground,
    },


    paginationDot: {
      height:
        7,

      borderRadius:
        4,

      marginHorizontal:
        3,
    },


    actionGroup: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'flex-start',

      flexShrink:
        0,
    },


    shareActionButton: {
      marginRight:
        25,
    },

  });