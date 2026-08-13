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
 * Componente separado para cada contato.
 *
 * Isso permite que cada avatar tenha seu próprio
 * controle de erro. Se a imagem de um contato
 * falhar, somente aquele contato utiliza o
 * avatar padrão.
 */
function ContactItem({
  item,
  theme,
  darkMode,
  onPress,
  formatTime,
}) {
  const [
    remoteAvatarFailed,
    setRemoteAvatarFailed,
  ] = useState(false);

  /*
   * REGRA DO AVATAR PADRÃO:
   *
   * Modo claro:
   * imageuserdark.png
   *
   * Modo escuro:
   * imageuserlight.png
   */
  const defaultAvatarSource = useMemo(() => {
    return darkMode
      ? imageUserLight
      : imageUserDark;
  }, [darkMode]);

  /*
   * Resolve a foto remota do contato.
   *
   * Se a propriedade photo estiver vazia,
   * inválida ou ausente, retorna null.
   */
  const remoteAvatarUrl = useMemo(() => {
    const photo =
      item?.user?.photo;

    if (
      !photo ||
      typeof photo !== 'string' ||
      !photo.trim()
    ) {
      return null;
    }

    return resolveImageUrl(photo);
  }, [item?.user?.photo]);

  /*
   * Quando a foto do contato mudar,
   * permite uma nova tentativa de carregamento.
   */
  useEffect(() => {
    setRemoteAvatarFailed(false);
  }, [remoteAvatarUrl]);

  const hasRemoteAvatar =
    Boolean(remoteAvatarUrl) &&
    !remoteAvatarFailed;

  function handleRemoteAvatarError(event) {
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

    /*
     * Se a foto remota falhar, este contato
     * passa a exibir imediatamente:
     *
     * imageuserdark no modo claro;
     * imageuserlight no modo escuro.
     */
    setRemoteAvatarFailed(true);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      style={[
        styles.contactItem,
        {
          backgroundColor:
            theme.card,

          borderColor:
            theme.border ||
            'transparent',
        },
      ]}
    >
      {hasRemoteAvatar ? (
        /*
         * FOTO REAL DO CONTATO
         *
         * A fotografia ocupa normalmente
         * toda a área circular de 58 × 58.
         */
        <View
          style={
            styles.remoteAvatarContainer
          }
        >
          <Image
            source={{
              uri: remoteAvatarUrl,
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
        /*
         * AVATAR PADRÃO
         *
         * O contêiner é transparente e não
         * adiciona fundo branco ou borda.
         *
         * A imagem é ampliada porque os PNGs
         * possuem uma grande área transparente
         * ao redor do desenho central.
         */
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

      <View style={styles.contactInfo}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: theme.text,
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
                theme.textSecondary,
            },
          ]}
        >
          {item?.lastMessage ||
            'Nenhuma mensagem'}
        </Text>
      </View>

      <View style={styles.rightContent}>
        <Text
          style={[
            styles.time,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {formatTime(
            item?.lastMessageTime
          )}
        </Text>

        {Number(item?.unreadCount) > 0 ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {Number(item.unreadCount) > 99
                ? '99+'
                : item.unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function ContactsScreen() {
  const navigation =
    useNavigation();

  const {
    theme,
    darkMode,
  } = useTheme();

  const [
    contacts,
    setContacts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * BUSCAR CONVERSAS
   */
  const loadContacts =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get('/chat');

        const receivedContacts =
          Array.isArray(response.data)
            ? response.data
            : [];

        setContacts(
          receivedContacts
        );
      } catch (error) {
        console.log(
          'ERRO AO BUSCAR CONTATOS:',
          error.response?.data ||
            error.message
        );

        setContacts([]);
      } finally {
        setLoading(false);
      }
    }, []);

  /*
   * ATUALIZA A LISTA SEMPRE QUE
   * A TELA DE CONTATOS RECEBE FOCO.
   */
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  /*
   * ABRIR CHAT
   */
  function openChat(contact) {
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
   * FORMATAR HORÁRIO DA ÚLTIMA MENSAGEM
   */
  function formatTime(date) {
    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(date);

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
          hour: '2-digit',
          minute: '2-digit',
        }
      );
  }

  /*
   * RENDERIZAR CONTATO
   */
  function renderItem({ item }) {
    return (
      <ContactItem
        item={item}
        theme={theme}
        darkMode={darkMode}
        onPress={openChat}
        formatTime={formatTime}
      />
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
      <Header title="Contatos" />

      <FlatList
        data={contacts}
        keyExtractor={(item, index) =>
          String(
            item?.id ??
              item?.user?.id ??
              index
          )
        }
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,

          contacts.length === 0
            ? styles.emptyList
            : null,
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadContacts}
        ListEmptyComponent={
          !loading ? (
            <View
              style={
                styles.emptyContainer
              }
            >
              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      theme.text,
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
                      theme.textSecondary,
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