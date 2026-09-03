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

/*
 * FileSystem é utilizado para baixar
 * temporariamente a imagem do post
 * para o cache do aplicativo.
 */
import * as FileSystem from 'expo-file-system/legacy';

/*
 * react-native-share permite compartilhar
 * texto e arquivo no mesmo menu nativo.
 */
import {
  Share,
} from 'react-native';

import Header from '../../components/Header';

import PostCard from '../../components/PostCard';

import {
  useTheme,
} from '../../hooks/useTheme';

import api from '../../services/api';

import {
  normalizePost,
  parsePostImages,
  resolveImageUrl,
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

  const [
    sharingPostId,
    setSharingPostId,
  ] = useState(null);

  /*
   * CARREGAR PUBLICAÇÕES
   */
  const loadPosts =
    useCallback(
      async ({
        showInitialLoading = false,
        showRefreshLoading = false,
      } = {}) => {
        try {
          if (
            showInitialLoading
          ) {
            setLoading(true);
          }

          if (
            showRefreshLoading
          ) {
            setRefreshing(true);
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
              : Array.isArray(
                  response.data
                    ?.posts
                )
                ? response.data
                    .posts
                : [];

          const normalizedPosts =
            receivedPosts
              .map(
                (post) => {
                  const normalized =
                    normalizePost(
                      post
                    );

                  if (!normalized) {
                    return null;
                  }

                  return {
                    ...normalized,

                    /*
                     * Preserva os dados extras
                     * da resposta da API.
                     */
                    user: {
                      ...post?.user,
                      ...normalized?.user,
                    },

                    promoted:
                      Boolean(
                        post?.promoted
                      ),

                    promoted_by_me:
                      Boolean(
                        post
                          ?.promoted_by_me
                      ),

                    promotion_count:
                      Math.max(
                        0,
                        Number(
                          post
                            ?.promotion_count ||
                            0
                        )
                      ),
                  };
                }
              )
              .filter(Boolean);

          console.log(
            'FEED CARREGADO:',
            normalizedPosts.map(
              (post) => ({
                id:
                  post?.id,

                imageCount:
                  Array.isArray(
                    post?.images
                  )
                    ? post.images
                        .length
                    : 0,

                summary:
                  post?.summary,

                responsible:
                  post?.user
                    ?.name,

                contactEmail:
                  post?.user
                    ?.contact_email ||
                  post?.user
                    ?.email ||
                  null,

                promotionCount:
                  post
                    ?.promotion_count,
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

          setRefreshing(
            false
          );
        }
      },
      []
    );

  /*
   * RECARREGAR O FEED QUANDO
   * A HOME RECEBER FOCO.
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
   * ATUALIZAR ARRASTANDO
   * PARA BAIXO.
   */
  function handleRefresh() {
    loadPosts({
      showRefreshLoading:
        true,
    });
  }

  /*
   * ABRIR DETALHES.
   */
  function handleOpenPost(
    post
  ) {
    navigation.navigate(
      'DetailsScreen',
      {
        post,
      }
    );
  }

  /*
   * IDENTIFICAR A EXTENSÃO DA IMAGEM.
   */
  function getImageExtension(
    imageUrl
  ) {
    if (
      !imageUrl ||
      typeof imageUrl !==
        'string'
    ) {
      return 'jpg';
    }

    const cleanUrl =
      imageUrl
        .split('?')[0]
        .toLowerCase();

    if (
      cleanUrl.endsWith(
        '.png'
      )
    ) {
      return 'png';
    }

    if (
      cleanUrl.endsWith(
        '.webp'
      )
    ) {
      return 'webp';
    }

    if (
      cleanUrl.endsWith(
        '.jpeg'
      )
    ) {
      return 'jpeg';
    }

    return 'jpg';
  }

  /*
   * IDENTIFICAR O MIME TYPE.
   */
  function getImageMimeType(
    extension
  ) {
    if (extension === 'png') {
      return 'image/png';
    }

    if (extension === 'webp') {
      return 'image/webp';
    }

    return 'image/jpeg';
  }

  /*
   * MONTAR O TEXTO DO
   * COMPARTILHAMENTO.
   */
  function createShareMessage(
    post
  ) {
    const responsibleName =
      typeof post?.user?.name ===
        'string' &&
      post.user.name.trim()
        ? post.user.name.trim()
        : 'Usuário do Doalize';

    const summary =
      typeof post?.summary ===
        'string' &&
      post.summary.trim()
        ? post.summary.trim()
        : '';

    const description =
      typeof post?.description ===
        'string' &&
      post.description.trim()
        ? post.description.trim()
        : '';

    /*
     * Preferência:
     *
     * contact_email
     * email
     *
     * Se nenhum estiver disponível,
     * orienta o contato pelo Doalize.
     */
    const contactEmail =
      typeof post?.user
        ?.contact_email ===
        'string' &&
      post.user
        .contact_email
        .trim()
        ? post.user
            .contact_email
            .trim()
        : (
            typeof post?.user
              ?.email ===
              'string' &&
            post.user.email
              .trim()
              ? post.user.email
                  .trim()
              : ''
          );

    const messageParts = [
      'Confira esta publicação no Doalize!',
    ];

    if (summary) {
      messageParts.push(
        `Resumo:\n${summary}`
      );
    }

    if (
      description &&
      description !== summary
    ) {
      messageParts.push(
        `Descrição:\n${description}`
      );
    }

    messageParts.push(
      `Responsável:\n${responsibleName}`
    );

    if (contactEmail) {
      messageParts.push(
        `Contato:\n${contactEmail}`
      );
    } else {
      messageParts.push(
        'Contato:\nEntre em contato pelo aplicativo Doalize.'
      );
    }

    messageParts.push(
      'Doalize\nConectando pessoas a causas solidárias.'
    );

    return messageParts.join(
      '\n\n'
    );
  }

  /*
   * COMPARTILHAR IMAGEM REAL
   * JUNTO COM O TEXTO.
   *
   * Não inclui:
   *
   * - número de promoções;
   * - URL visível da imagem;
   * - caminhos internos;
   * - dados privados adicionais.
   */
  async function handleShare(
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
      sharingPostId !== null
    ) {
      return;
    }

    try {
      setSharingPostId(
        post.id
      );

      const parsedImages =
        parsePostImages(
          post?.images
        );

      if (
        parsedImages.length ===
        0
      ) {
        Alert.alert(
          'Imagem necessária',
          'Esta publicação não possui uma imagem para compartilhar.'
        );

        return;
      }

      /*
       * Compartilha a primeira imagem
       * da publicação.
       */
      const selectedImage =
        parsedImages[0];

      const imageUrl =
        resolveImageUrl(
          selectedImage
        );

      if (!imageUrl) {
        throw new Error(
          'Não foi possível localizar a imagem da publicação.'
        );
      }

      const extension =
        getImageExtension(
          imageUrl
        );

      const mimeType =
        getImageMimeType(
          extension
        );

      /*
       * O nome inclui o ID para evitar
       * conflito entre publicações.
       */
      const temporaryFileName =
        `doalize-post-${post.id}.${extension}`;

      const temporaryFileUri =
        `${FileSystem.cacheDirectory}${temporaryFileName}`;

      /*
       * Remove a versão anterior do
       * cache, caso exista.
       */
      const previousFile =
        await FileSystem
          .getInfoAsync(
            temporaryFileUri
          );

      if (
        previousFile.exists
      ) {
        await FileSystem
          .deleteAsync(
            temporaryFileUri,
            {
              idempotent: true,
            }
          );
      }

      console.log(
        'BAIXANDO IMAGEM PARA COMPARTILHAR:',
        {
          postId:
            post.id,

          imageUrl,

          temporaryFileUri,

          mimeType,
        }
      );

      const downloadResult =
        await FileSystem
          .downloadAsync(
            imageUrl,
            temporaryFileUri
          );

      if (
        !downloadResult?.uri
      ) {
        throw new Error(
          'A imagem não pôde ser preparada para compartilhamento.'
        );
      }

      const shareMessage =
        createShareMessage(
          post
        );

      /*
       * Abre um único menu de
       * compartilhamento contendo:
       *
       * - imagem real;
       * - resumo;
       * - descrição;
       * - responsável;
       * - contato;
       * - identificação do Doalize.
       */
      await Share.open({
        title:
          'Compartilhar publicação do Doalize',

        subject:
          'Publicação do Doalize',

        message:
          shareMessage,

        url:
          downloadResult.uri,

        type:
          mimeType,

        filename:
          temporaryFileName,

        failOnCancel:
          false,

        useInternalStorage:
          true,
      });

      console.log(
        'MENU DE COMPARTILHAMENTO ABERTO:',
        {
          postId:
            post.id,

          localImage:
            downloadResult.uri,
        }
      );
    } catch (error) {
      console.log(
        'ERRO AO COMPARTILHAR PUBLICAÇÃO:',
        {
          postId:
            post?.id,

          message:
            error.message,

          error,
        }
      );

      Alert.alert(
        'Erro',
        error.message ||
          'Não foi possível compartilhar a publicação.'
      );
    } finally {
      setSharingPostId(
        null
      );
    }
  }

  /*
   * PROMOVER OU REMOVER PROMOÇÃO.
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
        response.data || {};

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
        (currentPosts) =>
          currentPosts.map(
            (currentPost) => {
              if (
                Number(
                  currentPost.id
                ) !==
                Number(post.id)
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
        error.response?.data
          ?.message ||
          'Não foi possível alterar a promoção.'
      );
    }
  }

  /*
   * RENDERIZAR ITEM.
   */
  function renderItem({
    item,
  }) {
    return (
      <PostCard
        post={item}
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
    );
  }

  /*
   * CARREGAMENTO INICIAL.
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
        <Header
          title="DOALIZE"
        />

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
                  theme
                    .textSecondary,
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
        title="DOALIZE"
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
        nestedScrollEnabled
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
                theme
                  .textSecondary
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
                    theme
                      .textSecondary,
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

      justifyContent:
        'center',
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

      justifyContent:
        'center',

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