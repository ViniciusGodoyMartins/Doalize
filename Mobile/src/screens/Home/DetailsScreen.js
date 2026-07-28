import React, { useMemo } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';

import { useTheme } from '../../hooks/useTheme';

import {
  DEFAULT_AVATAR,
  normalizePost,
  parsePostImages,
  resolveImageUrl,
} from '../../utils/imageHelper';

import styles from './styles';

const { width: SCREEN_WIDTH } =
  Dimensions.get('window');

export default function DetailsScreen({
  route,
  navigation,
}) {
  const { theme } = useTheme();

  const post = useMemo(
    () =>
      normalizePost(
        route?.params?.post
      ),
    [route?.params?.post]
  );

  const images = useMemo(
    () => parsePostImages(post?.images),
    [post?.images]
  );

  const avatar =
    resolveImageUrl(post?.user?.photo) ||
    DEFAULT_AVATAR;

  function handleOpenChat() {
    if (!post?.user?.id) {
      return;
    }

    navigation.navigate('Contatos', {
      screen: 'ChatScreen',
      params: {
        chatId: post.user.id,
        user: post.user,
      },
    });
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
        title="Detalhes"
        showBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userContainer}>
          <Image
            source={{
              uri: avatar,
            }}
            style={styles.avatar}
          />

          <View style={styles.userInfo}>
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
                ''}
            </Text>
          </View>
        </View>

        {images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map(
              (image, index) => (
                <Image
                  key={`${image}-${index}`}
                  source={{
                    uri: image,
                  }}
                  style={[
                    styles.image,
                    {
                      width: SCREEN_WIDTH,
                    },
                  ]}
                  resizeMode="cover"
                  onError={(event) => {
                    console.log(
                      'ERRO NA IMAGEM DOS DETALHES:',
                      {
                        image,
                        error:
                          event.nativeEvent,
                      }
                    );
                  }}
                />
              )
            )}
          </ScrollView>
        ) : null}

        <View style={styles.content}>
          <Text
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

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenChat}
          disabled={!post?.user?.id}
          style={[
            styles.chatButton,
            {
              backgroundColor:
                theme.primary,
              opacity: post?.user?.id
                ? 1
                : 0.5,
            },
          ]}
        >
          <Ionicons
            name="chatbubble"
            size={22}
            color="#ffffff"
          />

          <Text
            style={styles.chatButtonText}
          >
            Conversar
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}