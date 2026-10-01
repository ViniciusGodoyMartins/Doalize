import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import Header from '../../components/Header';

import PostCard from '../../components/PostCard';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import api from '../../services/api';

import {
  normalizePost,
} from '../../utils/imageHelper';

import styles from './style';


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
    'rgba(245, 245, 245, 0.68)',

  darkBorder:
    'rgba(245, 245, 245, 0.18)',

  darkRefreshBackground:
    '#155269',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightText:
    '#141414',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.68)',

  lightBorder:
    'rgba(20, 20, 20, 0.18)',

  lightRefreshBackground:
    '#E8E8E8',


  /*
   * CORES COMPARTILHADAS
   */

  primary:
    '#3AC2F8',

  danger:
    '#D83A3A',

  white:
    '#FFFFFF',
};


/*
 * ============================================================
 * PUBLISHED SCREEN
 * ============================================================
 */

export default function PublishedScreen({
  navigation,
}) {
  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    darkMode,
  } = useTheme();


  /*
   * ==========================================================
   * CORES DO TEMA
   * ==========================================================
   */

  const backgroundColor =
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


  const borderColor =
    darkMode
      ? COLORS.darkBorder
      : COLORS.lightBorder;


  const refreshBackgroundColor =
    darkMode
      ? COLORS.darkRefreshBackground
      : COLORS.lightRefreshBackground;


  /*
   * ==========================================================
   * USUÁRIO
   * ==========================================================
   */

  const {
    user,
  } = useAuth();


  /*
   * ==========================================================
   * PUBLICAÇÕES
   * ==========================================================
   */

  const [
    posts,
    setPosts,
  ] = useState([]);


  /*
   * ==========================================================
   * CARREGAMENTO
   * ==========================================================
   */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /*
   * ==========================================================
   * EXCLUSÃO
   * ==========================================================
   */

  const [
    deletingPostId,
    setDeletingPostId,
  ] = useState(null);


  /*
   * ==========================================================
   * BUSCAR PUBLICAÇÕES
   * ==========================================================
   */

  const loadPosts =
    useCallback(
      async (
        showLoading = true
      ) => {
        if (!user?.id) {
          setPosts(
            []
          );

          setLoading(
            false
          );

          setRefreshing(
            false
          );

          return;
        }


        try {
          if (
            showLoading
          ) {
            setLoading(
              true
            );
          }


          const response =
            await api.get(
              '/posts'
            );


          const receivedPosts =
            Array.isArray(
              response.data
            )
              ? response.data
              : (
                  Array.isArray(
                    response.data?.posts
                  )
                    ? response.data.posts
                    : []
                );


          const userPosts =
            receivedPosts
              .filter(
                (
                  post
                ) => {
                  const postUserId =
                    post?.user_id ??
                    post?.userId ??
                    post?.user?.id;


                  return (
                    Number(
                      postUserId
                    ) ===
                    Number(
                      user.id
                    )
                  );
                }
              )
              .map(
                (
                  post
                ) => {
                  try {
                    return normalizePost(
                      post
                    );
                  } catch (error) {
                    console.log(
                      'ERRO AO NORMALIZAR PUBLICAÇÃO:',
                      {
                        postId:
                          post?.id,

                        message:
                          error?.message,
                      }
                    );

                    return post;
                  }
                }
              )
              .filter(
                Boolean
              );


          console.log(
            'PUBLICAÇÕES DO USUÁRIO:',
            {
              userId:
                user.id,

              total:
                userPosts.length,
            }
          );


          setPosts(
            userPosts
          );
        } catch (error) {
          console.log(
            'ERRO AO BUSCAR PUBLICAÇÕES DO USUÁRIO:',
            {
              message:
                error.message,

              status:
                error.response
                  ?.status,

              response:
                error.response
                  ?.data,
            }
          );


          Alert.alert(
            'Erro',
            error.response
              ?.data
              ?.message ||
            'Não foi possível carregar suas publicações.'
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [
        user?.id,
      ]
    );


  /*
   * ==========================================================
   * ATUALIZAR AO RECEBER FOCO
   * ==========================================================
   */

  useFocusEffect(
    useCallback(() => {
      loadPosts(
        true
      );
    }, [
      loadPosts,
    ])
  );


  /*
   * ==========================================================
   * ATUALIZAR MANUALMENTE
   * ==========================================================
   */

  function handleRefresh() {
    if (
      refreshing ||
      loading
    ) {
      return;
    }


    setRefreshing(
      true
    );


    loadPosts(
      false
    );
  }


  /*
   * ==========================================================
   * ABRIR DETALHES
   * ==========================================================
   */

  function handleOpenPost(
    post
  ) {
    if (!post) {
      return;
    }


    navigation.navigate(
      'DetailsScreen',
      {
        post,
      }
    );
  }


  /*
   * ==========================================================
   * PROMOVER PUBLICAÇÃO
   * ==========================================================
   */

  async function handlePromote(
    post
  ) {
    if (!post?.id) {
      Alert.alert(
        'Erro',
        'A publicação selecionada é inválida.'
      );

      return;
    }


    try {
      const response =
        await api.post(
          `/posts/promote/${post.id}`
        );


      const responseData =
        response.data ||
        {};


      const promoted =
        Boolean(
          responseData
            .promoted
        );


      const promotedByMe =
        Boolean(
          responseData
            .promoted_by_me
        );


      const promotionCount =
        Math.max(
          0,
          Number(
            responseData
              .promotion_count ||
            0
          )
        );


      setPosts(
        (
          currentPosts
        ) =>
          currentPosts.map(
            (
              currentPost
            ) => {
              if (
                Number(
                  currentPost.id
                ) !==
                Number(
                  post.id
                )
              ) {
                return currentPost;
              }


              return {
                ...currentPost,

                promoted,

                promoted_by_me:
                  promotedByMe,

                promotion_count:
                  promotionCount,
              };
            }
          )
      );


      Alert.alert(
        'Sucesso',
        responseData
          ?.message ||
        (
          promotedByMe
            ? 'Publicação promovida.'
            : 'Promoção removida.'
        )
      );
    } catch (error) {
      console.log(
        'ERRO AO PROMOVER PUBLICAÇÃO:',
        {
          postId:
            post?.id,

          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );


      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
        'Não foi possível promover a publicação.'
      );
    }
  }


  /*
   * ==========================================================
   * CONFIRMAR EXCLUSÃO
   * ==========================================================
   */

  function handleDelete(
    post
  ) {
    Alert.alert(
      'Excluir publicação',
      'Deseja realmente excluir esta publicação? Essa ação não poderá ser desfeita.',
      [
        {
          text:
            'Cancelar',

          style:
            'cancel',
        },

        {
          text:
            'Excluir',

          style:
            'destructive',

          onPress: () => {
            confirmDelete(
              post
            );
          },
        },
      ]
    );
  }


  /*
   * ==========================================================
   * EXCLUSÃO REAL
   * ==========================================================
   */

  async function confirmDelete(
    post
  ) {
    if (!post?.id) {
      Alert.alert(
        'Erro',
        'A publicação selecionada é inválida.'
      );

      return;
    }


    try {
      setDeletingPostId(
        post.id
      );


      const response =
        await api.delete(
          `/posts/${post.id}`
        );


      setPosts(
        (
          currentPosts
        ) =>
          currentPosts.filter(
            (
              currentPost
            ) =>
              Number(
                currentPost.id
              ) !==
              Number(
                post.id
              )
          )
      );


      Alert.alert(
        'Sucesso',
        response.data
          ?.message ||
        'Publicação excluída.'
      );
    } catch (error) {
      console.log(
        'ERRO AO EXCLUIR PUBLICAÇÃO:',
        {
          postId:
            post.id,

          message:
            error.message,

          status:
            error.response
              ?.status,

          response:
            error.response
              ?.data,
        }
      );


      Alert.alert(
        'Erro',
        error.response
          ?.data
          ?.message ||
        'Não foi possível excluir a publicação.'
      );
    } finally {
      setDeletingPostId(
        null
      );
    }
  }


  /*
   * ==========================================================
   * COMPARTILHAMENTO
   * ==========================================================
   */

  function handleShare() {
    Alert.alert(
      'Compartilhar',
      'A função de compartilhamento será adicionada em breve.'
    );
  }


  /*
   * ==========================================================
   * ITEM DA LISTA
   * ==========================================================
   */

  function renderItem({
    item,
  }) {
    const isDeleting =
      Number(
        deletingPostId
      ) ===
      Number(
        item.id
      );


    return (
      <View
        style={[
          localStyles.postContainer,

          {
            backgroundColor:
              backgroundColor,
          },
        ]}
      >
        <PostCard
          post={
            item
          }
          onPress={() =>
            handleOpenPost(
              item
            )
          }
          onShare={() =>
            handleShare(
              item
            )
          }
          onPromote={() =>
            handlePromote(
              item
            )
          }
        />


        <TouchableOpacity
          activeOpacity={0.8}
          disabled={
            isDeleting
          }
          onPress={() =>
            handleDelete(
              item
            )
          }
          style={[
            localStyles.removeButton,

            {
              opacity:
                isDeleting
                  ? 0.65
                  : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Excluir publicação"
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color={
                COLORS.white
              }
            />
          ) : (
            <View
              style={
                localStyles.removeButtonContent
              }
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={
                  COLORS.white
                }
              />


              <Text
                style={
                  localStyles.removeButtonText
                }
              >
                Excluir publicação
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <View
        style={[
          styles.container,

          localStyles.loadingContainer,

          {
            backgroundColor:
              backgroundColor,
          },
        ]}
      >
        <Header
          title="Publicados"
          showBackButton
        />


        <View
          style={[
            localStyles.loadingContent,

            {
              backgroundColor:
                backgroundColor,
            },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />


          <Text
            style={[
              localStyles.loadingText,

              {
                color:
                  secondaryTextColor,
              },
            ]}
          >
            Carregando publicações...
          </Text>
        </View>
      </View>
    );
  }


  /*
   * ==========================================================
   * TELA PRINCIPAL
   * ==========================================================
   */

  return (
    <View
      style={[
        styles.container,

        {
          backgroundColor:
            backgroundColor,
        },
      ]}
    >
      <Header
        title="Publicados"
        showBackButton
      />


      <FlatList
        data={
          posts
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ??
            index
          )
        }

        renderItem={
          renderItem
        }

        style={{
          backgroundColor:
            backgroundColor,
        }}

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          localStyles.list,

          {
            backgroundColor:
              backgroundColor,
          },

          posts.length === 0
            ? [
                localStyles.emptyList,

                {
                  backgroundColor:
                    backgroundColor,
                },
              ]
            : null,
        ]}

        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              COLORS.primary,
            ]}
            tintColor={
              COLORS.primary
            }
            progressBackgroundColor={
              refreshBackgroundColor
            }
          />
        }

        ListEmptyComponent={
          <View
            style={[
              localStyles.emptyContainer,

              {
                backgroundColor:
                  backgroundColor,
              },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={58}
              color={
                secondaryTextColor
              }
            />


            <Text
              style={[
                localStyles.emptyTitle,

                {
                  color:
                    mainTextColor,
                },
              ]}
            >
              Nenhuma publicação
            </Text>


            <Text
              style={[
                localStyles.emptyDescription,

                {
                  color:
                    secondaryTextColor,
                },
              ]}
            >
              As publicações criadas por você aparecerão aqui.
            </Text>
          </View>
        }
      />
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
    /*
     * ========================================================
     * LISTA
     * ========================================================
     */

    list: {
      paddingHorizontal:
        16,

      paddingTop:
        16,

      paddingBottom:
        35,

      backgroundColor:
        COLORS.darkBackground,
    },


    emptyList: {
      flexGrow:
        1,

      backgroundColor:
        COLORS.darkBackground,
    },


    /*
     * ========================================================
     * PUBLICAÇÃO
     * ========================================================
     */

    postContainer: {
      width:
        '100%',

      marginBottom:
        20,

      backgroundColor:
        COLORS.darkBackground,
    },


    /*
     * ========================================================
     * BOTÃO EXCLUIR
     * ========================================================
     */

    removeButton: {
      width:
        '100%',

      minHeight:
        50,

      marginTop:
        -8,

      borderRadius:
        10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.danger,

      overflow:
        'hidden',
    },


    removeButtonContent: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    removeButtonText: {
      marginLeft:
        8,

      color:
        COLORS.white,

      fontSize:
        15,

      lineHeight:
        19,

      fontWeight:
        '600',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * LOADING
     * ========================================================
     */

    loadingContainer: {
      flex:
        1,

      backgroundColor:
        COLORS.darkBackground,
    },


    loadingContent: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        COLORS.darkBackground,
    },


    loadingText: {
      marginTop:
        12,

      fontSize:
        15,

      lineHeight:
        20,

      color:
        COLORS.darkTextSecondary,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    /*
     * ========================================================
     * ESTADO VAZIO
     * ========================================================
     */

    emptyContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        30,

      paddingBottom:
        60,

      backgroundColor:
        COLORS.darkBackground,
    },


    emptyTitle: {
      marginTop:
        16,

      fontSize:
        20,

      lineHeight:
        25,

      fontWeight:
        '700',

      color:
        COLORS.darkText,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },


    emptyDescription: {
      marginTop:
        8,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        COLORS.darkTextSecondary,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },
  });