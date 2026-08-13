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
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/Header';

import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './style';

export default function ProfileScreen({
  navigation,
}) {
  const {
    theme,
    darkMode,
    toggleTheme,
  } = useTheme();

  const { user } = useAuth();

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  /*
   * MODO CLARO:
   * utiliza imageuserdark.png.
   *
   * MODO ESCURO:
   * utiliza imageuserlight.png.
   */
  const defaultAvatarSource = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);

  /*
   * Verifica se existe uma foto real cadastrada
   * para o usuário.
   */
  const remoteAvatarUrl = useMemo(() => {
    if (
      !user?.photo ||
      typeof user.photo !== 'string' ||
      !user.photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(
      user.photo
    );
  }, [user?.photo]);

  /*
   * Se a foto do usuário mudar, permite outra
   * tentativa de carregamento.
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;

  function handleAvatarError(event) {
    console.log(
      'ERRO AO CARREGAR FOTO DO PERFIL:',
      {
        originalPhoto:
          user?.photo,

        resolvedUrl:
          remoteAvatarUrl,

        error:
          event?.nativeEvent,
      }
    );

    setRemoteAvatarFailed(true);
  }

  function handlePublished() {
    navigation.navigate(
      'PublishedScreen'
    );
  }

  function handleSettings() {
    navigation.navigate(
      'SettingsScreen'
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
      <Header title="Conta" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          localStyles.scrollContent
        }
      >
        <View
          style={[
            styles.profileContainer,
            localStyles.profileContainer,
          ]}
        >
          {hasRemoteAvatar ? (
            /*
             * FOTO REAL DO USUÁRIO
             *
             * Continua circular para funcionar
             * como uma foto de perfil tradicional.
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
                  handleAvatarError
                }
              />
            </View>
          ) : (
            /*
             * IMAGEM PADRÃO
             *
             * Não existe fundo branco, borda ou
             * círculo adicional criado pelo código.
             *
             * O próprio PNG é exibido diretamente
             * sobre o fundo da tela.
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

          <Text
            style={[
              styles.name,
              localStyles.name,
              {
                color: theme.text,
              },
            ]}
          >
            {user?.name || 'Usuário'}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {user?.description ||
              'Nenhuma descrição adicionada.'}
          </Text>
        </View>

        <View
          style={
            styles.actionsContainer
          }
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePublished}
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <Ionicons
              name="images-outline"
              size={22}
              color={theme.primary}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: theme.text,
                },
              ]}
            >
              Publicados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTheme}
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <Ionicons
              name={
                darkMode
                  ? 'sunny-outline'
                  : 'moon-outline'
              }
              size={22}
              color={theme.primary}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: theme.text,
                },
              ]}
            >
              {darkMode
                ? 'Modo Claro'
                : 'Modo Escuro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSettings}
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  theme.card,
              },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.primary}
            />

            <Text
              style={[
                styles.actionText,
                {
                  color: theme.text,
                },
              ]}
            >
              Configurações
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },

  profileContainer: {
    paddingTop: 45,
    paddingBottom: 30,
    alignItems: 'center',
  },

  /*
   * CONTÊINER DO ÍCONE PADRÃO
   *
   * Não possui:
   * - backgroundColor;
   * - borderWidth;
   * - borderColor;
   * - sombra.
   *
   * Portanto, nenhuma área branca é criada
   * ao redor do PNG.
   */
  defaultAvatarContainer: {
    width: 150,
    height: 150,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',

    overflow: 'hidden',
  },

  /*
   * Os PNGs possuem bastante transparência
   * externa. O scale amplia o desenho interno
   * para ocupar a área destinada ao usuário.
   */
  defaultAvatar: {
    width: 150,
    height: 150,

    transform: [
      {
        scale: 4.2,
      },
    ],
  },

  /*
   * CONTÊINER DA FOTO REAL
   *
   * A foto real permanece circular.
   */
  remoteAvatarContainer: {
    width: 150,
    height: 150,

    borderRadius: 75,

    overflow: 'hidden',

    backgroundColor: 'transparent',
  },

  remoteAvatar: {
    width: '100%',
    height: '100%',
  },

  name: {
    marginTop: 22,
  },
});