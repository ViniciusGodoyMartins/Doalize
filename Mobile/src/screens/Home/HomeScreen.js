import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  ActivityIndicator,
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

import api from '../../services/api';

import {
  normalizePost,
} from '../../utils/imageHelper';

import styles from './styles';

export default function HomeScreen({
  navigation,
}) {
  const {
    theme,
  } = useTheme();

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

  /*
   * CARREGAR PUBLICAÇÕES
   *
   * IMPORTANTE:
   *
   * A publicação completa é mantida,
   * incluindo todas as imagens.
   *
   * Não reduzimos mais images para apenas
   * a primeira imagem.
   */
  const loadPosts = useCallback(
    async ({
      showInitialLoading = false,
      showRefreshLoading = false,
    } = {}) => {
      try {
        if (showInitialLoading) {
          setLoading(true);
        }

        if (showRefreshLoading) {
          setRefreshing(true);
        }

        const response =
          await api.get('/posts');

        const responsePosts =
          Array.isArray(
            response.data
          )
            ? response.data
            : Array.isArray(
                response.data?.posts
              )
              ? response.data.posts
              : [];

        /*
         * normalizePost garante:
         *
         * - images como array;
         * - URLs das imagens normalizadas;
         * - compatibilidade com posts antigos;
         * - preservação de summary e description.
         */
        const normalizedPosts =
          responsePosts
            .map((post) =>
              normalizePost(post)
            )
            .filter(Boolean);

        console.log(
          'FEED CARREGADO:',
          normalizedPosts.map(
            (post) => ({
              id:
                post?.id,

              summary:
                post?.summary,

              imageCount:
                Array.isArray(
                  post?.images
                )
                  ? post.images.length
                  : 0,

              images:
                post?.images,
            })
          )
        );

        setPosts(
          normalizedPosts
        );
      } catch (error) {
        console.log(
          'ERRO AO CARREGAR FEED:',
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
            'Não foi possível carregar o Feed.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /*
   * CARREGA NOVAMENTE SEMPRE QUE
   * A HOME RECEBE FOCO.
   *
   * Isso faz uma publicação recém-criada
   * aparecer ao voltar para o Feed.
   */
  useFocusEffect(
    useCallback(() => {
      loadPosts({
        showInitialLoading:
          posts.length === 0,
      });
    }, [
      loadPosts,
      posts.length,
    ])
  );

  /*
   * ATUALIZAR ARRASTANDO A LISTA.
   */
  function handleRefresh() {
    loadPosts({
      showRefreshLoading: true,
    });
  }

  /*
   * ABRIR DETALHES
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
   * COMPARTILHAR
   */
  function handleShare(post) {
    Alert.alert(
      'Compartilhar',
      `Compartilhar publicação de ${
        post?.user?.name ||
        'Usuário'
      }`
    );
  }

  /*
   * PROMOVER OU REMOVER PROMOÇÃO
   */
  async function handlePromote(post) {
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

      const promoted =
        Boolean(
          response.data?.promoted
        );

      /*
       * Atualiza apenas o post alterado,
       * sem apagar ou reduzir seu array
       * de imagens.
       */
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
        'ERRO AO PROMOVER:',
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
        error.response?.data
          ?.message ||
          'Não foi possível alterar a promoção.'
      );
    }
  }

  /*
   * ITEM DO FEED
   *
   * O item completo é enviado ao PostCard.
   *
   * Antes, a Home transformava:
   *
   * [imagem1, imagem2, imagem3]
   *
   * em:
   *
   * [imagem1]
   *
   * Isso impedia o carrossel de funcionar.
   */
  function renderItem({
    item,
  }) {
    return (
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
    );
  }

  /*
   * CARREGAMENTO INICIAL
   */
  if (
    loading &&
    posts.length === 0
  ) {
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
        <Header title="DOALIZE" />

        <View
          style={
            localStyles.loadingContainer
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
      <Header title="DOALIZE" />

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
        renderItem={
          renderItem
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.feed,

          posts.length === 0
            ? localStyles.emptyList
            : null,
        ]}
        /*
         * Permite listas horizontais dentro
         * da lista vertical no Android.
         */
        nestedScrollEnabled
        /*
         * Melhora a distinção entre o gesto
         * vertical do Feed e o gesto horizontal
         * do carrossel.
         */
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              theme.primary
            }
            colors={[
              theme.primary,
            ]}
          />
        }
        ListEmptyComponent={
          <View
            style={
              localStyles.emptyContainer
            }
          >
            <Ionicons
              name="newspaper-outline"
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
              As publicações criadas pelos usuários aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const localStyles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',
    },

    loadingText: {
      marginTop: 12,

      fontSize: 15,
    },

    emptyList: {
      flexGrow: 1,
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