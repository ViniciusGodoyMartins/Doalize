import React, {
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
  DEFAULT_AVATAR,
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

export default function PostCard({
  post,
  onPress,
  onShare,
  onPromote,
}) {
  const { theme } = useTheme();

  const [imageFailed, setImageFailed] =
    useState(false);

  const images = useMemo(
    () => parsePostImages(post?.images),
    [post?.images]
  );

  const firstImage =
    images.length > 0
      ? images[0]
      : null;

  const avatar =
    resolveImageUrl(post?.user?.photo) ||
    DEFAULT_AVATAR;

  function handleShare(event) {
    if (event?.stopPropagation) {
      event.stopPropagation();
    }

    if (onShare) {
      onShare(post);
    }
  }

  function handlePromote(event) {
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
          backgroundColor: theme.card,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: avatar,
            }}
            style={styles.avatar}
          />

          <View>
            <Text
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

      {firstImage && !imageFailed ? (
        <Image
          source={{
            uri: firstImage,
          }}
          style={styles.postImage}
          resizeMode="cover"
          onError={(event) => {
            console.log(
              'ERRO NA IMAGEM DO POST:',
              {
                image: firstImage,
                error:
                  event.nativeEvent,
              }
            );

            setImageFailed(true);
          }}
        />
      ) : null}

      {firstImage && imageFailed ? (
        <View
          style={[
            styles.postImage,
            {
              alignItems: 'center',
              justifyContent: 'center',
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
            style={{
              marginTop: 8,
              color: theme.textSecondary,
            }}
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
          {post?.description}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
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
          style={styles.actionButton}
          onPress={handlePromote}
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