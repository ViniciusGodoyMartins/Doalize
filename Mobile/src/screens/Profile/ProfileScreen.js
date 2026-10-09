import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

import Header from '../../components/Header';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './style';


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  darkBackground: '#141414',
  lightBackground: '#F5F5F5',

  darkText: '#F5F5F5',
  lightText: '#141414',

  darkTextSecondary: 'rgba(245, 245, 245, 0.68)',
  lightTextSecondary: 'rgba(20, 20, 20, 0.68)',

  darkDivider: 'rgba(245, 245, 245, 0.20)',
  lightDivider: 'rgba(20, 20, 20, 0.20)',

  primary: '#3AC2F8',
};


/*
 * ============================================================
 * COMPONENTES ANIMADOS
 * ============================================================
 */

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedIonicons =
  Animated.createAnimatedComponent(Ionicons);


/*
 * ============================================================
 * AÇÃO DO PERFIL
 * ============================================================
 *
 * Mantém o fundo do botão e do ícone transparentes.
 */

function ProfileAction({
  icon,
  label,
  accessibilityLabel,
  onPress,
  animatedTextStyle,
  animatedSecondaryStyle,
  animatedBorderStyle,
  isLast = false,
}) {
  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.actionButton,
        localStyles.transparent,
        animatedBorderStyle,
        {
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View
        style={[
          styles.actionIconContainer,
          localStyles.transparent,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={COLORS.primary}
        />
      </View>

      <Animated.Text
        style={[
          styles.actionText,
          animatedTextStyle,
        ]}
      >
        {label}
      </Animated.Text>

      <AnimatedIonicons
        name="chevron-forward"
        size={19}
        style={animatedSecondaryStyle}
      />
    </AnimatedTouchableOpacity>
  );
}


/*
 * ============================================================
 * PROFILE SCREEN
 * ============================================================
 */

export default function ProfileScreen({
  navigation,
}) {
  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   *
   * themeProgress vem do ThemeContext:
   *
   * 0 = modo claro
   * 1 = modo escuro
   */

  const {
    darkMode,
    toggleTheme,
    themeProgress,
  } = useTheme();


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
   * CONTROLE DE ERRO DA FOTO
   * ==========================================================
   */

  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);


  /*
   * ==========================================================
   * CORES ANIMADAS
   * ==========================================================
   *
   * Não altera altura, largura, escala ou opacidade.
   */

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        themeProgress.value,
        [0, 1],
        [
          COLORS.lightBackground,
          COLORS.darkBackground,
        ]
      ),
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [
          COLORS.lightText,
          COLORS.darkText,
        ]
      ),
    };
  });

  const animatedSecondaryStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [
          COLORS.lightTextSecondary,
          COLORS.darkTextSecondary,
        ]
      ),
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      themeProgress.value,
      [0, 1],
      [
        COLORS.lightDivider,
        COLORS.darkDivider,
      ]
    );

    return {
      borderColor,
      borderBottomColor: borderColor,
    };
  });


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   */

  const defaultAvatarSource = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);


  /*
   * ==========================================================
   * FOTO REAL DO USUÁRIO
   * ==========================================================
   */

  const remoteAvatarUrl = useMemo(() => {
    if (
      !user?.photo ||
      typeof user.photo !== 'string' ||
      !user.photo.trim()
    ) {
      return null;
    }

    try {
      return resolveImageUrl(
        user.photo
      );
    } catch (error) {
      console.log(
        'ERRO AO RESOLVER FOTO DO PERFIL:',
        {
          originalPhoto: user?.photo,
          message: error?.message,
        }
      );

      return null;
    }
  }, [user?.photo]);


  /*
   * ==========================================================
   * REINICIAR ERRO DO AVATAR
   * ==========================================================
   */

  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);


  /*
   * ==========================================================
   * AVATAR DISPONÍVEL
   * ==========================================================
   */

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * ERRO AO CARREGAR AVATAR
   * ==========================================================
   */

  function handleAvatarError(event) {
    console.log(
      'ERRO AO CARREGAR FOTO DO PERFIL:',
      {
        originalPhoto: user?.photo,
        resolvedUrl: remoteAvatarUrl,
        error: event?.nativeEvent,
      }
    );

    setRemoteAvatarFailed(true);
  }


  /*
   * ==========================================================
   * ABRIR PUBLICAÇÕES
   * ==========================================================
   */

  function handlePublished() {
    navigation.navigate(
      'PublishedScreen'
    );
  }


  /*
   * ==========================================================
   * ABRIR CONFIGURAÇÕES
   * ==========================================================
   */

  function handleSettings() {
    navigation.navigate(
      'SettingsScreen'
    );
  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <Animated.View
      style={[
        styles.container,
        animatedBackgroundStyle,
      ]}
    >
      <Header
        title="Conta"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={animatedBackgroundStyle}
        contentContainerStyle={localStyles.scrollContent}
      >
        {/* PERFIL */}

        <View
          style={[
            styles.profileContainer,
            localStyles.transparent,
          ]}
        >
          {/* AVATAR */}

          {hasRemoteAvatar ? (
            <Animated.View
              style={[
                localStyles.remoteAvatarContainer,
                animatedBorderStyle,
              ]}
            >
              <Image
                source={{
                  uri: remoteAvatarUrl,
                }}
                style={localStyles.remoteAvatar}
                resizeMode="cover"
                onError={handleAvatarError}
              />
            </Animated.View>
          ) : (
            <View
              style={localStyles.defaultAvatarContainer}
            >
              <Image
                source={defaultAvatarSource}
                style={localStyles.defaultAvatar}
                resizeMode="contain"
              />
            </View>
          )}

          {/* NOME */}

          <Animated.Text
            numberOfLines={2}
            style={[
              styles.name,
              animatedTextStyle,
            ]}
          >
            {user?.name || 'Usuário'}
          </Animated.Text>

          {/* DESCRIÇÃO */}

          <Animated.Text
            style={[
              styles.description,
              animatedSecondaryStyle,
            ]}
          >
            {user?.description ||
              'Nenhuma descrição adicionada.'}
          </Animated.Text>
        </View>

        {/* AÇÕES */}

        <Animated.View
          style={[
            styles.actionsContainer,
            localStyles.transparent,
            animatedBorderStyle,
          ]}
        >
          <ProfileAction
            icon="images-outline"
            label="Publicados"
            accessibilityLabel="Ver publicações"
            onPress={handlePublished}
            animatedTextStyle={animatedTextStyle}
            animatedSecondaryStyle={animatedSecondaryStyle}
            animatedBorderStyle={animatedBorderStyle}
          />

          <ProfileAction
            icon={
              darkMode
                ? 'sunny-outline'
                : 'moon-outline'
            }
            label={
              darkMode
                ? 'Modo Claro'
                : 'Modo Escuro'
            }
            accessibilityLabel={
              darkMode
                ? 'Ativar modo claro'
                : 'Ativar modo escuro'
            }
            onPress={toggleTheme}
            animatedTextStyle={animatedTextStyle}
            animatedSecondaryStyle={animatedSecondaryStyle}
            animatedBorderStyle={animatedBorderStyle}
          />

          <ProfileAction
            icon="settings-outline"
            label="Configurações"
            accessibilityLabel="Abrir configurações"
            onPress={handleSettings}
            animatedTextStyle={animatedTextStyle}
            animatedSecondaryStyle={animatedSecondaryStyle}
            animatedBorderStyle={animatedBorderStyle}
            isLast
          />
        </Animated.View>
      </Animated.ScrollView>
    </Animated.View>
  );
}


/*
 * ============================================================
 * ESTILOS LOCAIS
 * ============================================================
 */

const localStyles = StyleSheet.create({
  transparent: {
    backgroundColor: 'transparent',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  defaultAvatarContainer: {
    width: 126,
    height: 126,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  defaultAvatar: {
    width: 126,
    height: 126,

    transform: [
      {
        scale: 4.2,
      },
    ],
  },

  remoteAvatarContainer: {
    width: 126,
    height: 126,

    borderRadius: 63,
    borderWidth: 1,

    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  remoteAvatar: {
    width: '100%',
    height: '100%',

    borderRadius: 63,
  },
});