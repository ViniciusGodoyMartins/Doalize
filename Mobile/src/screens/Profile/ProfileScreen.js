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

import {
  Ionicons,
} from '@expo/vector-icons';

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
  darkBackground:
    '#141414',

  lightBackground:
    '#F5F5F5',

  darkText:
    '#F5F5F5',

  lightText:
    '#141414',

  darkTextSecondary:
    'rgba(245, 245, 245, 0.68)',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.68)',

  darkDivider:
    'rgba(245, 245, 245, 0.20)',

  lightDivider:
    'rgba(20, 20, 20, 0.20)',

  primary:
    '#3AC2F8',
};


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
   */

  const {
    darkMode,
    toggleTheme,
  } = useTheme();


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


  const dividerColor =
    darkMode
      ? COLORS.darkDivider
      : COLORS.lightDivider;


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
   * AVATAR PADRÃO
   * ==========================================================
   */

  const defaultAvatarSource =
    useMemo(() => {

      return darkMode
        ? imageUserLight
        : imageUserDark;

    }, [
      darkMode,
    ]);


  /*
   * ==========================================================
   * FOTO REAL DO USUÁRIO
   * ==========================================================
   */

  const remoteAvatarUrl =
    useMemo(() => {

      if (
        !user?.photo ||
        typeof user.photo !==
          'string' ||
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
            originalPhoto:
              user?.photo,

            message:
              error?.message,
          }
        );


        return null;

      }

    }, [
      user?.photo,
    ]);


  /*
   * ==========================================================
   * REINICIAR ERRO DO AVATAR
   * ==========================================================
   */

  useEffect(() => {

    setRemoteAvatarFailed(
      false
    );

  }, [
    remoteAvatarUrl,
  ]);


  /*
   * ==========================================================
   * AVATAR DISPONÍVEL
   * ==========================================================
   */

  const hasRemoteAvatar =
    Boolean(
      remoteAvatarUrl
    ) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * ERRO AO CARREGAR AVATAR
   * ==========================================================
   */

  function handleAvatarError(
    event
  ) {

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


    setRemoteAvatarFailed(
      true
    );

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
   * RENDERIZAR AÇÃO DO PERFIL
   * ==========================================================
   */

  function renderAction({
    icon,
    label,
    accessibilityLabel,
    onPress,
    isLast = false,
  }) {

    return (

      <TouchableOpacity
        activeOpacity={0.78}
        onPress={
          onPress
        }
        style={[
          styles.actionButton,

          {
            backgroundColor:
              'transparent',

            borderBottomColor:
              dividerColor,

            borderBottomWidth:
              isLast
                ? 0
                : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel
        }
      >

        <View
          style={[
            styles.actionIconContainer,

            {
              backgroundColor:
                'transparent',
            },
          ]}
        >

          <Ionicons
            name={
              icon
            }
            size={22}
            color={
              COLORS.primary
            }
          />

        </View>


        <Text
          style={[
            styles.actionText,

            {
              color:
                mainTextColor,
            },
          ]}
        >
          {
            label
          }
        </Text>


        <Ionicons
          name="chevron-forward"
          size={19}
          color={
            secondaryTextColor
          }
        />

      </TouchableOpacity>

    );

  }


  /*
   * ==========================================================
   * RENDER
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
        title="Conta"
      />


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        style={{
          backgroundColor:
            backgroundColor,
        }}
        contentContainerStyle={[
          localStyles.scrollContent,

          {
            backgroundColor:
              backgroundColor,
          },
        ]}
      >

        {/* ==================================================
            PERFIL
            ================================================== */}

        <View
          style={[
            styles.profileContainer,

            {
              backgroundColor:
                'transparent',
            },
          ]}
        >

          {
            hasRemoteAvatar ? (

              <View
                style={[
                  localStyles.remoteAvatarContainer,

                  {
                    borderColor:
                      dividerColor,
                  },
                ]}
              >

                <Image
                  source={{
                    uri:
                      remoteAvatarUrl,
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

            )
          }


          <Text
            numberOfLines={2}
            style={[
              styles.name,

              {
                color:
                  mainTextColor,
              },
            ]}
          >
            {
              user?.name ||
              'Usuário'
            }
          </Text>


          <Text
            style={[
              styles.description,

              {
                color:
                  secondaryTextColor,
              },
            ]}
          >
            {
              user?.description ||
              'Nenhuma descrição adicionada.'
            }
          </Text>

        </View>


        {/* ==================================================
            AÇÕES
            ================================================== */}

        <View
          style={[
            styles.actionsContainer,

            {
              backgroundColor:
                'transparent',

              borderColor:
                dividerColor,
            },
          ]}
        >

          {
            renderAction({
              icon:
                'images-outline',

              label:
                'Publicados',

              accessibilityLabel:
                'Ver publicações',

              onPress:
                handlePublished,
            })
          }


          {
            renderAction({
              icon:
                darkMode
                  ? 'sunny-outline'
                  : 'moon-outline',

              label:
                darkMode
                  ? 'Modo Claro'
                  : 'Modo Escuro',

              accessibilityLabel:
                darkMode
                  ? 'Ativar modo claro'
                  : 'Ativar modo escuro',

              onPress:
                toggleTheme,
            })
          }


          {
            renderAction({
              icon:
                'settings-outline',

              label:
                'Configurações',

              accessibilityLabel:
                'Abrir configurações',

              onPress:
                handleSettings,

              isLast:
                true,
            })
          }

        </View>

      </ScrollView>

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

    scrollContent: {
      flexGrow:
        1,

      paddingBottom:
        24,
    },


    defaultAvatarContainer: {
      width:
        126,

      height:
        126,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    defaultAvatar: {
      width:
        126,

      height:
        126,

      transform: [
        {
          scale:
            4.2,
        },
      ],
    },


    remoteAvatarContainer: {
      width:
        126,

      height:
        126,

      borderRadius:
        63,

      borderWidth:
        1,

      overflow:
        'hidden',

      backgroundColor:
        'transparent',
    },


    remoteAvatar: {
      width:
        '100%',

      height:
        '100%',

      borderRadius:
        63,
    },

  });