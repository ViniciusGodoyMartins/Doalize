import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import styles from './styles';

import { useTheme } from '../../hooks/useTheme';

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

  const [
    postImageFailed,
    setPostImageFailed,
  ] = useState(false);

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  /*
   * IMAGEM PADRÃO DO USUÁRIO
   *
   * Modo claro:
   * utiliza imageuserdark.png.
   *
   * Modo escuro:
   * utiliza imageuserlight.png.
   */
  const defaultAvatarSource = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);

  /*
   * Normaliza as imagens da publicação.
   */
  const postImages = useMemo(() => {
    return parsePostImages(
      post?.images
    );
  }, [post?.images]);

  const firstPostImage =
    postImages.length > 0
      ? postImages[0]
      : null;

  /*
   * Resolve a foto enviada pelo usuário.
   *
   * Se não existir foto, o resultado será null
   * e o componente utilizará a imagem local.
   */
  const remoteAvatarUrl = useMemo(() => {
    if (
      !post?.user?.photo ||
      typeof post.user.photo !== 'string' ||
      !post.user.photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(
      post.user.photo
    );
  }, [post?.user?.photo]);

  /*
   * Quando a publicação mudar, permite uma nova
   * tentativa de carregar sua imagem.
   */
  useEffect(() => {
    setPostImageFailed(false);
  }, [firstPostImage]);

  /*
   * Quando a foto do usuário mudar, permite uma
   * nova tentativa de carregamento.
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;

  function handleRemoteAvatarError(event) {
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

    /*
     * Ao falhar, troca automaticamente para:
     *
     * imageuserdark no modo claro;
     * imageuserlight no modo escuro.
     */
    setRemoteAvatarFailed(true);
  }

  function handlePostImageError(event) {
    console.log(
      'ERRO AO CARREGAR IMAGEM DO POST:',
      {
        image:
          firstPostImage,

        error:
          event?.nativeEvent,
      }
    );

    setPostImageFailed(true);
  }

  function handleSharePress(event) {
    /*
     * Evita que o botão Compartilhar também
     * abra a tela de detalhes.
     */
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    if (onShare) {
      onShare(post);
    }
  }

  function handlePromotePress(event) {
    /*
     * Evita que o botão Promover também
     * abra a tela de detalhes.
     */
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    if (onPromote) {
      onPromote(post);
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor:
            theme.card,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {hasRemoteAvatar ? (
            /*
             * FOTO REAL DO USUÁRIO
             *
             * A fotografia preenche normalmente
             * a área circular de 48 × 48.
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
             * ÍCONE PADRÃO
             *
             * Não possui fundo branco.
             *
             * O PNG é ampliado porque contém
             * uma grande área transparente
             * ao redor do desenho.
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
            style={
              localStyles.userTextContainer
            }
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
                'Agora'}
            </Text>
          </View>
        </View>
      </View>

      {firstPostImage &&
      !postImageFailed ? (
        <Image
          source={{
            uri: firstPostImage,
          }}
          style={styles.postImage}
          resizeMode="cover"
          onError={
            handlePostImageError
          }
        />
      ) : null}

      {firstPostImage &&
      postImageFailed ? (
        <View
          style={[
            styles.postImage,
            localStyles.unavailableImage,
            {
              backgroundColor:
                theme.background,
            },
          ]}
        >
          <Ionicons
            name="image-outline"
            size={44}
            color={theme.textSecondary}
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
      ) : null}

      <View style={styles.content}>
        <Text
          numberOfLines={4}
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

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionButton}
          onPress={handleSharePress}
        >
          <Ionicons
            name="paper-plane-outline"
            size={24}
            color={theme.primary}
          />

          <Text
            style={[
              styles.actionText,
              {
                color: theme.primary,
              },
            ]}
          >
            Compartilhar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionButton}
          onPress={handlePromotePress}
        >
          <Ionicons
            name="rocket-outline"
            size={24}
            color={theme.primary}
          />

          <Text
            style={[
              styles.actionText,
              {
                color: theme.primary,
              },
            ]}
          >
            Promover
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = {
  /*
   * ÁREA DO ÍCONE PADRÃO
   *
   * O contêiner não possui fundo nem borda.
   * O overflow impede que o PNG ampliado
   * ultrapasse a área do avatar.
   */
  defaultAvatarContainer: {
    width: 48,
    height: 48,

    marginRight: 12,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    backgroundColor: 'transparent',
  },

  /*
   * Os PNGs possuem grande área transparente.
   *
   * A escala aumenta somente a imagem padrão,
   * fazendo o desenho ocupar aproximadamente
   * toda a área de 48 × 48.
   */
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
   * FOTO REAL
   *
   * Uma fotografia real não recebe o aumento
   * usado nos PNGs padrão.
   */
  remoteAvatarContainer: {
    width: 48,
    height: 48,

    marginRight: 12,

    borderRadius: 24,

    overflow: 'hidden',

    backgroundColor: 'transparent',
  },

  remoteAvatar: {
    width: '100%',
    height: '100%',
  },

  userTextContainer: {
    flex: 1,
  },

  unavailableImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  unavailableText: {
    marginTop: 8,
    fontSize: 14,
  },
};