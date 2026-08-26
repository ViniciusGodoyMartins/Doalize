import React from 'react';

import {
  View,
  Text,
  Image,
} from 'react-native';

import {
  useTheme,
} from '../../hooks/useTheme';

import styles from './styles';

/*
 * FORMATA SOMENTE A EXIBIÇÃO DA DATA.
 *
 * Entrada:
 *
 * 2026-08-26T16:57:38.000Z
 *
 * Saída:
 *
 * 26/08/2026
 *
 * A função não modifica a mensagem,
 * não modifica o banco e não interfere
 * na exibição do texto ou da imagem.
 */
function formatMessageDate(
  dateValue
) {
  if (!dateValue) {
    return '';
  }

  /*
   * Se o valor começar com YYYY-MM-DD,
   * utiliza diretamente os componentes
   * da data.
   *
   * Isso evita alteração do dia causada
   * pelo fuso horário.
   */
  if (
    typeof dateValue ===
    'string'
  ) {
    const dateMatch =
      dateValue.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

    if (dateMatch) {
      const [
        ,
        year,
        month,
        day,
      ] = dateMatch;

      return `${day}/${month}/${year}`;
    }
  }

  /*
   * Fallback para outros formatos.
   */
  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(
      dateValue
    );
  }

  const day =
    String(
      parsedDate.getDate()
    ).padStart(
      2,
      '0'
    );

  const month =
    String(
      parsedDate.getMonth() +
        1
    ).padStart(
      2,
      '0'
    );

  const year =
    parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
}

export default function ChatBubble({
  message,
  currentUserId,
}) {
  const {
    theme,
  } = useTheme();

  /*
   * VERIFICAR SE É MINHA
   */
  const isMine =
    Number(
      message?.sender_id
    ) ===
      Number(
        currentUserId
      ) ||
    Number(
      message?.senderId
    ) ===
      Number(
        currentUserId
      );

  /*
   * TEXTO DA MENSAGEM
   */
  const content =
    message?.message ||
    message?.content ||
    '';

  /*
   * TIPO
   */
  const type =
    message?.type ||
    (
      message?.image
        ? 'image'
        : 'text'
    );

  /*
   * DATA ORIGINAL
   *
   * Mantém os mesmos campos utilizados
   * anteriormente e acrescenta createdAt
   * como compatibilidade.
   */
  const time =
    message?.created_at ||
    message?.createdAt ||
    message?.time ||
    '';

  return (
    <View
      style={[
        styles.container,

        isMine
          ? styles.myMessageContainer
          : styles.otherMessageContainer,
      ]}
    >
      {/* TEXTO */}
      {type === 'text' && (
        <View
          style={[
            styles.bubble,

            {
              backgroundColor:
                isMine
                  ? theme.primary
                  : theme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,

              {
                color:
                  isMine
                    ? '#ffffff'
                    : theme.text,
              },
            ]}
          >
            {content}
          </Text>
        </View>
      )}

      {/* IMAGEM */}
      {type === 'image' && (
        <Image
          source={{
            uri:
              message?.image ||
              content,
          }}
          style={
            styles.image
          }
        />
      )}

      {/* DATA */}
      <Text
        style={[
          styles.time,

          {
            color:
              theme.textSecondary,
          },
        ]}
      >
        {formatMessageDate(
          time
        )}
      </Text>
    </View>
  );
}