import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import Header from '../../components/Header';

import ChatBubble from '../../components/ChatBubble';

import {
  useSocket,
} from '../../hooks/useSocket';

import {
  useAuth,
} from '../../hooks/useAuth';

import {
  useTheme,
} from '../../hooks/useTheme';

import api from '../../services/api';

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
    '#1B1B1B',

  darkText:
    '#F5F5F5',

  darkTextSecondary:
    '#AEB8BD',

  darkInputBackground:
    '#05618D',

  darkInputBorder:
    'rgba(245, 245, 245, 0.28)',

  darkBorder:
    'rgba(245, 245, 245, 0.18)',

  darkPlaceholder:
    'rgba(245, 245, 245, 0.68)',


  /*
   * MODO CLARO
   */

  lightBackground:
    '#F5F5F5',

  lightCard:
    '#FFFFFF',

  lightText:
    '#141414',

  lightTextSecondary:
    'rgba(20, 20, 20, 0.68)',

  lightInputBackground:
    '#FFFFFF',

  lightInputBorder:
    'rgba(20, 20, 20, 0.65)',

  lightBorder:
    'rgba(20, 20, 20, 0.28)',

  lightPlaceholder:
    'rgba(20, 20, 20, 0.55)',


  /*
   * CORES COMPARTILHADAS
   */

  primary:
    '#3AC2F8',

  white:
    '#FFFFFF',

  black:
    '#141414',
};


/*
 * ============================================================
 * CHAT SCREEN
 * ============================================================
 */

export default function ChatScreen({
  route,
}) {

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
   * ==========================================================
   * CORES ATUAIS
   * ==========================================================
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

        inputBackground:
          darkMode
            ? COLORS.darkInputBackground
            : COLORS.lightInputBackground,

        inputBorder:
          darkMode
            ? COLORS.darkInputBorder
            : COLORS.lightInputBorder,

        border:
          theme?.border ||
          (
            darkMode
              ? COLORS.darkBorder
              : COLORS.lightBorder
          ),

        placeholder:
          darkMode
            ? COLORS.darkPlaceholder
            : COLORS.lightPlaceholder,

        sendIcon:
          darkMode
            ? COLORS.white
            : COLORS.black,
      };

    }, [
      theme,
      darkMode,
    ]);


  /*
   * ==========================================================
   * DADOS RECEBIDOS DA NAVEGAÇÃO
   * ==========================================================
   */

  const {
    chatId,
    user,
  } = route.params;


  /*
   * ==========================================================
   * SOCKET
   * ==========================================================
   */

  const {
    socket,
    joinRoom,
    sendMessage,
  } = useSocket();


  /*
   * ==========================================================
   * USUÁRIO LOGADO
   * ==========================================================
   */

  const {
    user: currentUser,
  } = useAuth();


  /*
   * ==========================================================
   * REFERÊNCIA DA LISTA
   * ==========================================================
   */

  const flatListRef =
    useRef(null);


  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  const [
    message,
    setMessage,
  ] = useState('');


  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    sendingMessage,
    setSendingMessage,
  ] = useState(false);


  /*
   * ==========================================================
   * IDENTIFICAR CONTA ANONIMIZADA
   * ==========================================================
   */

  const isAnonymized =
    user?.anonymized === true ||
    user?.name ===
      'Usuário removido';


  /*
   * ==========================================================
   * NOME DO CHAT
   * ==========================================================
   */

  const chatTitle =
    isAnonymized
      ? 'Usuário removido'
      : user?.name ||
        'Usuário';


  /*
   * ==========================================================
   * VOLTAR PARA CONTATOS
   * ==========================================================
   */

  function handleBackToContacts() {

    navigation.navigate(
      'ContactsScreen'
    );

  }


  /*
   * ==========================================================
   * BUSCAR MENSAGENS
   * ==========================================================
   */

  async function loadMessages() {

    try {

      const response =
        await api.get(
          `/chat/messages/${user.id}`
        );


      const receivedMessages =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];


      setMessages(
        receivedMessages
      );

    } catch (error) {

      console.log(
        'ERRO AO BUSCAR MENSAGENS:',
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


      /*
       * O backend retorna 410 quando
       * a conta foi removida.
       */

      if (
        error.response?.status ===
        410
      ) {

        setMessage(
          ''
        );


        setMessages(
          []
        );


        Alert.alert(
          'Conversa indisponível',

          error.response?.data
            ?.message ||
            'Esta conta foi removida e a conversa não está mais disponível.',

          [
            {
              text:
                'Voltar para contatos',

              onPress:
                handleBackToContacts,
            },
          ],

          {
            cancelable:
              false,
          }
        );


        return;

      }


      Alert.alert(
        'Erro',

        error.response?.data
          ?.message ||
        'Não foi possível carregar as mensagens.'
      );

    }

  }


  /*
   * ==========================================================
   * INICIAR CHAT E SOCKET
   * ==========================================================
   */

  useEffect(() => {

    /*
     * Conta anonimizada:
     *
     * Não carregamos mensagens e não
     * entramos na sala do Socket.
     */

    if (isAnonymized) {

      setMessages(
        []
      );


      return undefined;

    }


    /*
     * Carregar histórico.
     */

    loadMessages();


    /*
     * Entrar na sala do Socket.
     */

    if (chatId) {

      joinRoom(
        chatId
      );

    }


    /*
     * ========================================================
     * RECEBER NOVAS MENSAGENS
     * ========================================================
     */

    function handleReceiveMessage(
      newMessage
    ) {

      const isCurrentChat =
        Number(
          newMessage?.sender_id
        ) ===
          Number(
            user?.id
          ) ||
        Number(
          newMessage?.receiver_id
        ) ===
          Number(
            user?.id
          );


      /*
       * Ignora mensagens de outras conversas.
       */

      if (!isCurrentChat) {

        return;

      }


      /*
       * Adiciona a mensagem somente
       * se ela ainda não existir.
       */

      setMessages(
        (
          oldMessages
        ) => {

          const exists =
            oldMessages.some(
              (
                savedMessage
              ) =>
                Number(
                  savedMessage.id
                ) ===
                Number(
                  newMessage.id
                )
            );


          if (exists) {

            return oldMessages;

          }


          return [
            ...oldMessages,
            newMessage,
          ];

        }
      );


      /*
       * Rolar para a última mensagem.
       */

      setTimeout(() => {

        flatListRef.current
          ?.scrollToEnd({
            animated:
              true,
          });

      }, 100);

    }


    /*
     * Registrar listener do Socket.
     */

    if (socket) {

      socket.on(
        'receive_message',
        handleReceiveMessage
      );

    }


    /*
     * Remover listener ao sair.
     */

    return () => {

      if (socket) {

        socket.off(
          'receive_message',
          handleReceiveMessage
        );

      }

    };

  }, [
    chatId,
    isAnonymized,
    joinRoom,
    socket,
    user?.id,
  ]);


  /*
   * ==========================================================
   * ENVIAR MENSAGEM
   * ==========================================================
   */

  async function handleSendMessage() {

    /*
     * Conta anonimizada não pode
     * receber novas mensagens.
     */

    if (isAnonymized) {

      Alert.alert(
        'Conta removida',

        'Esta conta foi anonimizada e não pode receber novas mensagens.',

        [
          {
            text:
              'Voltar para contatos',

            onPress:
              handleBackToContacts,
          },
        ]
      );


      return;

    }


    /*
     * Evita vários envios ao mesmo tempo.
     */

    if (sendingMessage) {

      return;

    }


    /*
     * Remove espaços extras.
     */

    const normalizedMessage =
      message.trim();


    /*
     * Não envia mensagem vazia.
     */

    if (!normalizedMessage) {

      return;

    }


    try {

      setSendingMessage(
        true
      );


      /*
       * Corpo enviado para o backend.
       */

      const body = {
        receiver_id:
          user.id,

        message:
          normalizedMessage,
      };


      /*
       * ======================================================
       * SALVAR NO BANCO
       * ======================================================
       */

      const response =
        await api.post(
          '/chat/send',
          body
        );


      const savedMessage =
        response.data;


      /*
       * ======================================================
       * ENVIAR PELO SOCKET
       * ======================================================
       */

      sendMessage(
        savedMessage
      );


      /*
       * ======================================================
       * ADICIONAR LOCALMENTE
       * ======================================================
       */

      setMessages(
        (
          oldMessages
        ) => {

          const alreadyExists =
            oldMessages.some(
              (
                savedItem
              ) =>
                Number(
                  savedItem.id
                ) ===
                Number(
                  savedMessage.id
                )
            );


          if (alreadyExists) {

            return oldMessages;

          }


          return [
            ...oldMessages,
            savedMessage,
          ];

        }
      );


      /*
       * Limpa o campo.
       */

      setMessage(
        ''
      );


      /*
       * Vai para a última mensagem.
       */

      setTimeout(() => {

        flatListRef.current
          ?.scrollToEnd({
            animated:
              true,
          });

      }, 100);

    } catch (error) {

      console.log(
        'ERRO AO ENVIAR MENSAGEM:',
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


      /*
       * Destinatário anonimizado.
       */

      if (
        error.response?.status ===
        410
      ) {

        setMessage(
          ''
        );


        setMessages(
          []
        );


        Alert.alert(
          'Conta removida',

          error.response?.data
            ?.message ||
            'Esta conta foi removida e não pode receber mensagens.',

          [
            {
              text:
                'Voltar para contatos',

              onPress:
                handleBackToContacts,
            },
          ],

          {
            cancelable:
              false,
          }
        );


        return;

      }


      Alert.alert(
        'Erro',

        error.response?.data
          ?.message ||
        'Não foi possível enviar a mensagem.'
      );

    } finally {

      setSendingMessage(
        false
      );

    }

  }


  /*
   * ==========================================================
   * RENDER DA TELA
   * ==========================================================
   */

  return (

    <KeyboardAvoidingView
      style={[
        styles.container,

        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
      }
    >

      {/* ====================================================
          CABEÇALHO
          ==================================================== */}

      <Header
        title={
          chatTitle
        }
        showBackButton
        onBackPress={
          handleBackToContacts
        }
      />


      {/* ====================================================
          AVISO DE CONTA ANONIMIZADA
          ==================================================== */}

      {
        isAnonymized ? (

          <View
            style={[
              localStyles.anonymizedNotice,

              {
                backgroundColor:
                  currentTheme.card,

                borderBottomColor:
                  currentTheme.border,
              },
            ]}
          >

            <Ionicons
              name="information-circle-outline"
              size={20}
              color={
                currentTheme.textSecondary
              }
            />


            <Text
              style={[
                localStyles.anonymizedNoticeText,

                {
                  color:
                    currentTheme.textSecondary,
                },
              ]}
            >
              Esta conta foi removida e a conversa não está mais disponível.
            </Text>

          </View>

        ) : null
      }


      {/* ====================================================
          LISTA DE MENSAGENS
          ==================================================== */}

      <FlatList
        ref={
          flatListRef
        }

        data={
          isAnonymized
            ? []
            : messages
        }

        keyExtractor={(
          item,
          index
        ) =>
          String(
            item?.id ||
            index
          )
        }

        style={{
          backgroundColor:
            currentTheme.background,
        }}

        contentContainerStyle={[
          styles.messagesContainer,

          {
            backgroundColor:
              currentTheme.background,

            flexGrow:
              1,
          },
        ]}

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"

        renderItem={({
          item,
        }) => (

          <ChatBubble
            message={
              item
            }
            currentUserId={
              currentUser?.id
            }
          />

        )}

        onContentSizeChange={() => {

          if (
            !isAnonymized
          ) {

            flatListRef.current
              ?.scrollToEnd({
                animated:
                  true,
              });

          }

        }}

        ListEmptyComponent={

          <View
            style={[
              localStyles.emptyContainer,

              {
                backgroundColor:
                  currentTheme.background,
              },
            ]}
          >

            <Ionicons
              name={
                isAnonymized
                  ? 'lock-closed-outline'
                  : 'chatbubble-ellipses-outline'
              }
              size={42}
              color={
                currentTheme.textSecondary
              }
            />


            <Text
              style={[
                localStyles.emptyText,

                {
                  color:
                    currentTheme.textSecondary,
                },
              ]}
            >
              {
                isAnonymized
                  ? 'Esta conversa não está mais disponível.'
                  : 'Nenhuma mensagem nesta conversa.'
              }
            </Text>

          </View>

        }
      />


      {/* ====================================================
          ÁREA DE ENVIO
          ==================================================== */}

      <View
        style={[
          styles.inputContainer,

          {
            backgroundColor:
              currentTheme.background,

            borderTopColor:
              currentTheme.border,

            opacity:
              isAnonymized
                ? 0.7
                : 1,
          },
        ]}
      >

        {/* ==================================================
            CAMPO DE TEXTO
            ================================================== */}

        <TextInput
          style={[
            styles.input,

            {
              color:
                currentTheme.text,

              backgroundColor:
                currentTheme.inputBackground,

              borderWidth:
                1,

              borderColor:
                currentTheme.inputBorder,
            },
          ]}

          placeholder={
            isAnonymized
              ? 'Conversa indisponível'
              : 'Digite uma mensagem...'
          }

          placeholderTextColor={
            currentTheme.placeholder
          }

          value={
            message
          }

          onChangeText={
            setMessage
          }

          editable={
            !isAnonymized &&
            !sendingMessage
          }

          multiline

          maxLength={2000}

          returnKeyType="send"

          blurOnSubmit={false}

          selectionColor={
            currentTheme.primary
          }

          cursorColor={
            currentTheme.primary
          }
        />


        {/* ==================================================
            BOTÃO ENVIAR
            ================================================== */}

        <TouchableOpacity
          activeOpacity={0.8}

          onPress={
            handleSendMessage
          }

          disabled={
            isAnonymized ||
            sendingMessage ||
            !message.trim()
          }

          style={[
            styles.sendButton,

            {
              backgroundColor:
                currentTheme.primary,

              opacity:
                isAnonymized ||
                sendingMessage ||
                !message.trim()
                  ? 0.4
                  : 1,
            },
          ]}

          accessibilityRole="button"

          accessibilityLabel={
            isAnonymized
              ? 'Conversa indisponível'
              : 'Enviar mensagem'
          }
        >

          <Ionicons
            name={
              isAnonymized
                ? 'lock-closed-outline'
                : 'send'
            }
            size={21}
            color={
              currentTheme.sendIcon
            }
          />

        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>

  );

}


/*
 * ============================================================
 * ESTILOS LOCAIS
 * ============================================================
 */

const localStyles =
  StyleSheet.create({

    /*
     * ========================================================
     * AVISO DE CONTA ANONIMIZADA
     * ========================================================
     */

    anonymizedNotice: {
      width:
        '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        16,

      paddingVertical:
        11,

      backgroundColor:
        '#1B1B1B',

      borderBottomWidth:
        1,

      borderBottomColor:
        'rgba(245, 245, 245, 0.16)',
    },


    anonymizedNoticeText: {
      flex:
        1,

      marginLeft:
        9,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        '#AEB8BD',
    },


    /*
     * ========================================================
     * LISTA SEM MENSAGENS
     * ========================================================
     */

    emptyContainer: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        30,

      paddingVertical:
        50,
    },


    emptyText: {
      marginTop:
        12,

      fontSize:
        14,

      lineHeight:
        21,

      color:
        '#AEB8BD',

      textAlign:
        'center',
    },

  });