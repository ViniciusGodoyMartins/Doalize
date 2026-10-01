import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import Header from '../../components/Header';

import {
  useTheme,
} from '../../hooks/useTheme';

import {
  resolveImageUrl,
} from '../../utils/imageHelper';

import api from '../../services/api';

import imageUserLight from '../../../assets/imageuserlight.png';
import imageUserDark from '../../../assets/imageuserdark.png';

import styles from './styles';


/*
 * ============================================================
 * CORES
 * ============================================================
 */

const COLORS = {
  /*
   * MODO ESCURO
   */

  darkBackground:
    '#141414',

  darkCard:
    '#141414',

  darkText:
    '#F5F5F5',

  darkTextSecondary:
    '#AEB8BD',

  darkBorder:
    'rgba(245, 245, 245, 0.18)',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightCard:
    '#F5F5F5',

  lightText:
    '#141414',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.68)',

  lightBorder:
    'rgba(20, 20, 20, 0.22)',


  /*
   * CORES COMPARTILHADAS
   */

  primary:
    '#3AC2F8',

  badgeText:
    '#141414',
};


/*
 * ============================================================
 * ITEM INDIVIDUAL DA LISTA
 * ============================================================
 */

function ContactItem({
  item,
  onPress,
  formatTime,
  darkMode,
  currentTheme,
}) {
  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);


  /*
   * ==========================================================
   * AVATAR PADRÃO
   * ==========================================================
   *
   * Modo escuro:
   * imageuserlight.png
   *
   * Modo claro:
   * imageuserdark.png
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
   * FOTO REMOTA
   * ==========================================================
   */

  const remoteAvatarUrl =
    useMemo(() => {
      const photo =
        item?.user?.photo;


      if (
        !photo ||
        typeof photo !==
          'string' ||
        !photo.trim()
      ) {
        return null;
      }


      try {
        return resolveImageUrl(
          photo
        );
      } catch (error) {
        console.log(
          'ERRO AO RESOLVER FOTO DO CONTATO:',
          {
            contactId:
              item?.id,

            userId:
              item?.user?.id,

            photo,

            message:
              error?.message,
          }
        );


        return null;
      }
    }, [
      item?.id,
      item?.user?.id,
      item?.user?.photo,
    ]);


  /*
   * Sempre que a URL mudar, permitimos
   * uma nova tentativa de carregamento.
   */

  useEffect(() => {
    setRemoteAvatarFailed(
      false
    );
  }, [
    remoteAvatarUrl,
  ]);


  const hasRemoteAvatar =
    Boolean(
      remoteAvatarUrl
    ) &&
    !remoteAvatarFailed;


  /*
   * ==========================================================
   * ERRO AO CARREGAR FOTO
   * ==========================================================
   */

  function handleRemoteAvatarError(
    event
  ) {
    console.log(
      'ERRO AO CARREGAR FOTO DO CONTATO:',
      {
        contactId:
          item?.id,

        userId:
          item?.user?.id,

        originalPhoto:
          item?.user?.photo,

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
   * Quantidade de mensagens não lidas.
   */

  const unreadCount =
    Math.max(
      0,
      Number(
        item?.unreadCount ||
        0
      )
    );


  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        onPress(
          item
        )
      }
      style={[
        styles.contactItem,

        {
          backgroundColor:
            currentTheme.card,

          borderBottomColor:
            currentTheme.border,
        },
      ]}
    >
      {/* ====================================================
          AVATAR
          ==================================================== */}

      {hasRemoteAvatar ? (
        <View
          style={
            styles.remoteAvatarContainer
          }
        >
          <Image
            source={{
              uri:
                remoteAvatarUrl,
            }}
            style={
              styles.remoteAvatar
            }
            resizeMode="cover"
            onError={
              handleRemoteAvatarError
            }
          />
        </View>
      ) : (
        <View
          style={
            styles.defaultAvatarContainer
          }
        >
          <Image
            source={
              defaultAvatarSource
            }
            style={
              styles.defaultAvatar
            }
            resizeMode="contain"
          />
        </View>
      )}


      {/* ====================================================
          NOME E ÚLTIMA MENSAGEM
          ==================================================== */}

      <View
        style={
          styles.contactInfo
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.name,

            {
              color:
                currentTheme.text,

              fontWeight:
                unreadCount > 0
                  ? '800'
                  : '600',
            },
          ]}
        >
          {item?.user?.name ||
            'Usuário'}
        </Text>


        <Text
          numberOfLines={1}
          style={[
            styles.lastMessage,

            {
              color:
                currentTheme.textSecondary,

              fontWeight:
                unreadCount > 0
                  ? '500'
                  : '400',
            },
          ]}
        >
          {item?.lastMessage ||
            'Nenhuma mensagem'}
        </Text>
      </View>


      {/* ====================================================
          HORÁRIO E CONTADOR
          ==================================================== */}

      <View
        style={
          styles.rightContent
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.time,

            {
              color:
                unreadCount > 0
                  ? currentTheme.primary
                  : currentTheme.textSecondary,
            },
          ]}
        >
          {formatTime(
            item?.lastMessageTime
          )}
        </Text>


        {unreadCount > 0 ? (
          <View
            style={[
              styles.badge,

              {
                backgroundColor:
                  currentTheme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,

                {
                  color:
                    COLORS.badgeText,
                },
              ]}
            >
              {unreadCount > 99
                ? '99+'
                : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}


/*
 * ============================================================
 * TELA DE CONTATOS
 * ============================================================
 */

export default function ContactsScreen() {
  const navigation =
    useNavigation();


  /*
   * ==========================================================
   * TEMA
   * ==========================================================
   */

  const {
    theme,
    darkMode,
  } = useTheme();


  /*
   * O fallback garante as cores mesmo se alguma
   * propriedade não existir dentro de theme.
   */

  const currentTheme =
    useMemo(() => {
      return {
        background:
          theme?.background ||
          (
            darkMode
              ? COLORS.darkBackground
              : COLORS.lightBackground
          ),

        card:
          theme?.card ||
          (
            darkMode
              ? COLORS.darkCard
              : COLORS.lightCard
          ),

        text:
          theme?.text ||
          (
            darkMode
              ? COLORS.darkText
              : COLORS.lightText
          ),

        textSecondary:
          theme?.textSecondary ||
          (
            darkMode
              ? COLORS.darkTextSecondary
              : COLORS.lightTextSecondary
          ),

        primary:
          theme?.primary ||
          COLORS.primary,

        border:
          theme?.border ||
          (
            darkMode
              ? COLORS.darkBorder
              : COLORS.lightBorder
          ),
      };
    }, [
      theme,
      darkMode,
    ]);


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  const [
    contacts,
    setContacts,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  /*
   * ==========================================================
   * BUSCAR CONVERSAS
   * ==========================================================
   */

  const loadContacts =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );


          const response =
            await api.get(
              '/chat'
            );


          const receivedContacts =
            Array.isArray(
              response.data
            )
              ? response.data
              : [];


          setContacts(
            receivedContacts
          );
        } catch (error) {
          console.log(
            'ERRO AO BUSCAR CONTATOS:',
            error.response
              ?.data ||
            error.message
          );


          setContacts(
            []
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  /*
   * ==========================================================
   * ATUALIZAR AO VOLTAR PARA A TELA
   * ==========================================================
   */

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [
      loadContacts,
    ])
  );


  /*
   * ==========================================================
   * ABRIR CHAT
   * ==========================================================
   */

  function openChat(
    contact
  ) {
    navigation.navigate(
      'ChatScreen',
      {
        chatId:
          contact.id,

        user:
          contact.user,
      }
    );
  }


  /*
   * ==========================================================
   * FORMATAR HORÁRIO
   * ==========================================================
   */

  function formatTime(
    date
  ) {
    if (!date) {
      return '';
    }


    const parsedDate =
      new Date(
        date
      );


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '';
    }


    return parsedDate
      .toLocaleTimeString(
        'pt-BR',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',
        }
      );
  }


  /*
   * ==========================================================
   * RENDERIZAR ITEM
   * ==========================================================
   */

  function renderItem({
    item,
  }) {
    return (
      <ContactItem
        item={
          item
        }
        onPress={
          openChat
        }
        formatTime={
          formatTime
        }
        darkMode={
          darkMode
        }
        currentTheme={
          currentTheme
        }
      />
    );
  }


  /*
   * ==========================================================
   * RENDER DA TELA
   * ==========================================================
   */

  return (
    <View
      style={[
        styles.container,

        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      <Header
        title="Contatos"
      />


      <FlatList
        data={
          contacts
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ??
            item?.user?.id ??
            index
          )
        }

        renderItem={
          renderItem
        }

        style={{
          backgroundColor:
            currentTheme.background,
        }}

        contentContainerStyle={[
          styles.list,

          {
            backgroundColor:
              currentTheme.background,
          },

          contacts.length === 0
            ? styles.emptyList
            : null,
        ]}

        showsVerticalScrollIndicator={
          false
        }

        refreshing={
          loading
        }

        onRefresh={
          loadContacts
        }

        ListEmptyComponent={
          !loading ? (
            <View
              style={[
                styles.emptyContainer,

                {
                  backgroundColor:
                    currentTheme.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyTitle,

                  {
                    color:
                      currentTheme.text,
                  },
                ]}
              >
                Nenhuma conversa
              </Text>


              <Text
                style={[
                  styles.emptyText,

                  {
                    color:
                      currentTheme.textSecondary,
                  },
                ]}
              >
                Suas conversas aparecerão aqui.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}