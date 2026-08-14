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

export default function PublishedScreen({
  navigation,
}) {
  const { theme } = useTheme();

  const { user } = useAuth();

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

  /*
   * BUSCAR AS PUBLICAÇÕES
   *
   * A API atual retorna todos os posts.
   * A tela filtra somente aqueles cujo
   * user_id pertence ao usuário logado.
   */
  const loadPosts = useCallback(
    async (
      showLoading = true
    ) => {
      if (!user?.id) {
        setPosts([]);
        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        const response =
          await api.get('/posts');

        const receivedPosts =
          Array.isArray(
            response.data
          )
            ? response.data
            : response.data?.posts ||
              [];

        const userPosts =
          receivedPosts
            .filter((post) => {
              const postUserId =
                post?.user_id ??
                post?.userId ??
                post?.user?.id;

              return (
                Number(postUserId) ===
                Number(user.id)
              );
            })
            .map((post) =>
              normalizePost(post)
            );

        console.log(
          'PUBLICAÇÕES DO USUÁRIO:',
          {
            userId: user.id,
            total:
              userPosts.length,
          }
        );

        setPosts(userPosts);
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
          error.response?.data
            ?.message ||
            'Não foi possível carregar suas publicações.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  /*
   * ATUALIZA SEMPRE QUE A TELA
   * PUBLICADOS RECEBER FOCO.
   *
   * Assim, uma publicação recém-criada
   * aparece quando o usuário abre a tela.
   */
  useFocusEffect(
    useCallback(() => {
      loadPosts(true);
    }, [loadPosts])
  );

  /*
   * ATUALIZAR ARRASTANDO A LISTA.
   */
  function handleRefresh() {
    setRefreshing(true);
    loadPosts(false);
  }

  /*
   * ABRIR DETALHES DA PUBLICAÇÃO.
   */
  function handleOpenPost(post) {
    navigation.navigate(
      'DetailsScreen',
      {
        post,
      }
    );
  }

  /*
   * PROMOVER PUBLICAÇÃO.
   */
  async function handlePromote(post) {
    try {
      const response =
        await api.post(
          `/posts/promote/${post.id}`
        );

      const promoted =
        Boolean(
          response.data?.promoted
        );

      setPosts(
        (currentPosts) =>
          currentPosts.map(
            (currentPost) =>
              currentPost.id ===
              post.id
                ? {
                    ...currentPost,
                    promoted,
                  }
                : currentPost
          )
      );

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          (promoted
            ? 'Publicação promovida.'
            : 'Promoção removida.')
      );
    } catch (error) {
      console.log(
        'ERRO AO PROMOVER PUBLICAÇÃO:',
        {
          postId: post?.id,

          message:
            error.message,

          response:
            error.response
              ?.data,
        }
      );

      Alert.alert(
        'Erro',
        error.response?.data
          ?.message ||
          'Não foi possível promover a publicação.'
      );
    }
  }

  /*
   * CONFIRMAÇÃO DE EXCLUSÃO.
   */
  function handleDelete(post) {
    Alert.alert(
      'Excluir publicação',
      'Deseja realmente excluir esta publicação? Essa ação não poderá ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {
          text: 'Excluir',
          style: 'destructive',

          onPress: () => {
            confirmDelete(post);
          },
        },
      ]
    );
  }

  /*
   * EXCLUSÃO REAL PELA API.
   */
  async function confirmDelete(post) {
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
        (currentPosts) =>
          currentPosts.filter(
            (currentPost) =>
              currentPost.id !==
              post.id
          )
      );

      Alert.alert(
        'Sucesso',
        response.data?.message ||
          'Publicação excluída.'
      );
    } catch (error) {
      console.log(
        'ERRO AO EXCLUIR PUBLICAÇÃO:',
        {
          postId: post.id,

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
        error.response?.data
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
   * COMPARTILHAMENTO.
   */
  function handleShare() {
    Alert.alert(
      'Compartilhar',
      'A função de compartilhamento será adicionada em breve.'
    );
  }

  /*
   * ITEM DA LISTA.
   */
  function renderItem({
    item,
  }) {
    const isDeleting =
      deletingPostId ===
      item.id;

    return (
      <View
        style={
          localStyles.postContainer
        }
      >
        <PostCard
          post={item}
          onPress={() =>
            handleOpenPost(item)
          }
          onShare={() =>
            handleShare(item)
          }
          onPromote={() =>
            handlePromote(item)
          }
        />

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isDeleting}
          onPress={() =>
            handleDelete(item)
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
        >
          {isDeleting ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={20}
                color="#ffffff"
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
   * CARREGAMENTO INICIAL.
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
            color={theme.primary}
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
        data={posts}
        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ??
              index
          )
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          localStyles.list,

          posts.length === 0
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
              name="images-outline"
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
              Nenhuma publicação
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
              As publicações criadas por você aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const localStyles =
  StyleSheet.create({
    list: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 35,
    },

    emptyList: {
      flexGrow: 1,
    },

    postContainer: {
      width: '100%',
      marginBottom: 20,
    },

    removeButton: {
      width: '100%',
      minHeight: 50,

      marginTop: -8,

      borderRadius: 14,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#ef4444',
    },

    removeButtonText: {
      marginLeft: 8,

      color: '#ffffff',

      fontSize: 15,

      fontWeight: '700',
    },

    loadingContainer: {
      flex: 1,
    },

    loadingContent: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      marginTop: 12,

      fontSize: 15,
    },

    emptyContainer: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      paddingHorizontal: 30,
      paddingBottom: 60,
    },

    emptyTitle: {
      marginTop: 16,

      fontSize: 20,

      fontWeight: '800',

      textAlign: 'center',
    },

    emptyDescription: {
      marginTop: 8,

      fontSize: 14,

      lineHeight: 21,

      textAlign: 'center',
    },
  });

  // Hi