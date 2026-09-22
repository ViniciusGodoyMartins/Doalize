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
 * EXTRAIR PUBLICAÇÕES
 * DA RESPOSTA DA API
 */
function extractPostsFromResponse(
  responseData
) {
  if (
    Array.isArray(
      responseData
    )
  ) {
    return responseData;
  }

  if (
    Array.isArray(
      responseData?.posts
    )
  ) {
    return responseData.posts;
  }

  if (
    Array.isArray(
      responseData?.data
    )
  ) {
    return responseData.data;
  }

  if (
    Array.isArray(
      responseData
        ?.data
        ?.posts
    )
  ) {
    return responseData
      .data
      .posts;
  }

  if (
    Array.isArray(
      responseData?.results
    )
  ) {
    return responseData.results;
  }

  return [];
}

/*
 * NORMALIZAR PUBLICAÇÃO
 * COM SEGURANÇA
 */
function normalizeUserPost(
  post
) {
  if (
    !post ||
    typeof post !==
      'object'
  ) {
    return null;
  }

  try {
    const normalizedPost =
      normalizePost(
        post
      );

    if (
      normalizedPost &&
      typeof normalizedPost ===
        'object'
    ) {
      return {
        ...post,
        ...normalizedPost,

        user: {
          ...post?.user,
          ...normalizedPost?.user,
        },

        promoted:
          Boolean(
            normalizedPost
              ?.promoted ??
            post?.promoted
          ),

        promoted_by_me:
          Boolean(
            normalizedPost
              ?.promoted_by_me ??
            post?.promoted_by_me
          ),

        promotion_count:
          Math.max(
            0,
            Number(
              normalizedPost
                ?.promotion_count ??
              post
                ?.promotion_count ??
              0
            )
          ),
      };
    }

    return post;
  } catch (error) {
    console.log(
      'ERRO AO NORMALIZAR PUBLICAÇÃO DO USUÁRIO:',
      {
        postId:
          post?.id,

        message:
          error.message,
      }
    );

    return post;
  }
}

export default function PublishedScreen({
  navigation,
}) {
  const {
    theme,
  } = useTheme();

  const {
    user,
  } = useAuth();

  const [
    posts,
    setPosts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    deletingPostId,
    setDeletingPostId,
  ] = useState(null);

  const [
    promotingPostId,
    setPromotingPostId,
  ] = useState(null);

  const [
    loadError,
    setLoadError,
  ] = useState(false);

  /*
   * BUSCAR PUBLICAÇÕES
   * DO USUÁRIO LOGADO
   */
  const loadPosts =
    useCallback(
      async (
        showLoading = true
      ) => {
        if (!user?.id) {
          setPosts([]);
          setLoading(false);
          setRefreshing(false);
          setLoadError(false);

          return;
        }

        try {
          setLoadError(
            false
          );

          if (showLoading) {
            setLoading(
              true
            );
          }

          const response =
            await api.get(
              '/posts'
            );

          const receivedPosts =
            extractPostsFromResponse(
              response.data
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
                normalizeUserPost
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

          setLoadError(
            true
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
   * ATUALIZAR QUANDO
   * A TELA RECEBER FOCO
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
   * ATUALIZAR ARRASTANDO
   * PARA BAIXO
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
   * TENTAR CARREGAR
   * NOVAMENTE
   */
  function handleRetry() {
    if (
      loading ||
      refreshing
    ) {
      return;
    }

    loadPosts(
      true
    );
  }

  /*
   * ABRIR DETALHES
   * DA PUBLICAÇÃO
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
   * PROMOVER OU REMOVER
   * A PROMOÇÃO
   */
  async function handlePromote(
    post
  ) {
    if (
      !post?.id ||
      promotingPostId !==
        null ||
      deletingPostId !==
        null
    ) {
      return;
    }

    try {
      setPromotingPostId(
        post.id
      );

      const response =
        await api.post(
          `/posts/promote/${post.id}`
        );

      const responseData =
        response.data ||
        {};

      const promoted =
        Boolean(
          responseData.promoted
        );

      const promotedByMe =
        Boolean(
          responseData
            .promoted_by_me ??
          promoted
        );

      const promotionCount =
        Math.max(
          0,
          Number(
            responseData
              .promotion_count ??
            post
              ?.promotion_count ??
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
          'Não foi possível alterar a promoção.'
      );
    } finally {
      setPromotingPostId(
        null
      );
    }
  }

  /*
   * CONFIRMAR EXCLUSÃO
   */
  function handleDelete(
    post
  ) {
    if (
      !post?.id ||
      deletingPostId !==
        null ||
      promotingPostId !==
        null
    ) {
      return;
    }

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
      ],
      {
        cancelable:
          true,
      }
    );
  }

  /*
   * EXCLUIR PUBLICAÇÃO
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

    if (
      deletingPostId !==
      null
    ) {
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
   * COMPARTILHAMENTO
   */
  function handleShare() {
    Alert.alert(
      'Compartilhar',
      'A função de compartilhamento será adicionada em breve.'
    );
  }

  /*
   * RENDERIZAR PUBLICAÇÃO
   */
  function renderItem({
    item,
  }) {
    const isDeleting =
      Number(
        deletingPostId
      ) ===
      Number(
        item?.id
      );

    const isPromoting =
      Number(
        promotingPostId
      ) ===
      Number(
        item?.id
      );

    const itemBusy =
      isDeleting ||
      isPromoting;

    return (
      <View
        style={
          localStyles.postContainer
        }
      >
        <PostCard
          post={
            item
          }
          onPress={() => {
            if (!itemBusy) {
              handleOpenPost(
                item
              );
            }
          }}
          onShare={() => {
            if (!itemBusy) {
              handleShare(
                item
              );
            }
          }}
          onPromote={() => {
            if (!itemBusy) {
              handlePromote(
                item
              );
            }
          }}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={
            itemBusy
          }
          onPress={() => {
            handleDelete(
              item
            );
          }}
          accessibilityRole="button"
          accessibilityLabel="Excluir publicação"
          accessibilityState={{
            disabled:
              itemBusy,
          }}
          style={[
            localStyles.removeButton,
            {
              opacity:
                itemBusy
                  ? 0.65
                  : 1,
            },
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  localStyles.removeButtonText
                }
              >
                Excluir publicação
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * CARREGAMENTO INICIAL
   */
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          localStyles.loadingContainer,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <Header
          title="Publicados"
          showBackButton
        />

        <View
          style={
            localStyles.loadingContent
          }
        >
          <ActivityIndicator
            size="large"
            color={
              theme.primary
            }
          />

          <Text
            style={[
              localStyles.loadingText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Carregando publicações...
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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          localStyles.list,

          posts.length ===
          0
            ? localStyles.emptyList
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
              theme.primary,
            ]}
            tintColor={
              theme.primary
            }
          />
        }
        ListEmptyComponent={
          <View
            style={
              localStyles.emptyContainer
            }
          >
            <Ionicons
              name={
                loadError
                  ? 'cloud-offline-outline'
                  : 'images-outline'
              }
              size={58}
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
              {loadError
                ? 'Não foi possível carregar'
                : 'Nenhuma publicação'}
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
              {loadError
                ? 'Não foi possível carregar suas publicações.'
                : 'As publicações criadas por você aparecerão aqui.'}
            </Text>

            {loadError ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={
                  handleRetry
                }
                disabled={
                  loading ||
                  refreshing
                }
                style={[
                  localStyles.retryButton,
                  {
                    backgroundColor:
                      theme.primary,

                    opacity:
                      loading ||
                      refreshing
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                {loading ||
                refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        localStyles.retryButtonText
                      }
                    >
                      Tentar novamente
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
    </View>
  );
}

const localStyles =
  StyleSheet.create({
    list: {
      paddingHorizontal:
        16,

      paddingTop:
        16,

      paddingBottom:
        35,
    },

    emptyList: {
      flexGrow:
        1,
    },

    postContainer: {
      width:
        '100%',

      marginBottom:
        20,
    },

    removeButton: {
      width:
        '100%',

      minHeight:
        50,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        -8,

      borderRadius:
        14,

      backgroundColor:
        '#EF4444',
    },

    removeButtonText: {
      marginLeft:
        8,

      color:
        '#FFFFFF',

      fontSize:
        15,

      fontWeight:
        '700',
    },

    loadingContainer: {
      flex:
        1,
    },

    loadingContent: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop:
        12,

      fontSize:
        15,
    },

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
    },

    emptyTitle: {
      maxWidth:
        320,

      marginTop:
        16,

      fontSize:
        20,

      fontWeight:
        '800',

      textAlign:
        'center',
    },

    emptyDescription: {
      maxWidth:
        320,

      marginTop:
        8,

      fontSize:
        14,

      lineHeight:
        21,

      textAlign:
        'center',
    },

    retryButton: {
      minWidth:
        190,

      minHeight:
        48,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        22,

      paddingHorizontal:
        20,

      borderRadius:
        24,
    },

    retryButtonText: {
      marginLeft:
        8,

      color:
        '#FFFFFF',

      fontSize:
        14,

      fontWeight:
        '800',
    },
  });