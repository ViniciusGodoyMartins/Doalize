import {
  Op,
} from 'sequelize';

import Message from '../models/Message.js';

import User from '../models/User.js';

/*
 * IDENTIFICAR CONTA ANONIMIZADA
 *
 * Quando uma conta é anonimizada,
 * o e-mail passa a utilizar o formato:
 *
 * conta-removida-ID-CODIGO@doalize.invalid
 */
function isAnonymousEmail(
  email
) {
  return (
    typeof email === 'string' &&
    /^conta-removida-\d+-[a-f0-9]+@doalize\.invalid$/i.test(
      email
    )
  );
}

/*
 * FORMATAR O USUÁRIO EXIBIDO
 * NAS CONVERSAS
 *
 * Conta ativa:
 * mantém nome e foto.
 *
 * Conta anonimizada:
 * apresenta somente "Usuário removido".
 */
function formatConversationUser(
  user,
  fallbackUserId
) {
  if (!user) {
    return {
      id:
        Number(
          fallbackUserId
        ),

      name:
        'Usuário removido',

      photo:
        null,

      anonymized:
        true,
    };
  }

  const accountIsAnonymous =
    isAnonymousEmail(
      user.email
    );

  if (accountIsAnonymous) {
    return {
      id:
        user.id,

      name:
        'Usuário removido',

      photo:
        null,

      anonymized:
        true,
    };
  }

  return {
    id:
      user.id,

    name:
      user.name ||
      'Usuário',

    photo:
      user.photo ||
      null,

    anonymized:
      false,
  };
}

/*
 * FORMATAR A PRÉVIA DA
 * ÚLTIMA MENSAGEM
 */
function getLastMessagePreview(
  message
) {
  if (
    typeof message?.message ===
      'string' &&
    message.message.trim()
  ) {
    return message.message.trim();
  }

  if (message?.image) {
    return 'Imagem';
  }

  if (message?.audio) {
    return 'Áudio';
  }

  return 'Mensagem';
}

class ChatController {
  /*
   * LISTAR CONVERSAS
   *
   * GET /chat/conversations
   *
   * As conversas com contas
   * anonimizadas continuam visíveis,
   * mas sem dados pessoais.
   */
  async getConversations(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      if (
        !Number.isInteger(
          userId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      /*
       * BUSCAR TODAS AS MENSAGENS
       * DO USUÁRIO
       *
       * A ordenação decrescente garante
       * que a primeira mensagem encontrada
       * para cada contato seja a mais recente.
       */
      const messages =
        await Message.findAll({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,
              },

              {
                receiver_id:
                  userId,
              },
            ],
          },

          order: [
            [
              'created_at',
              'DESC',
            ],
          ],
        });

      const conversationsMap = {};

      for (
        const message
        of messages
      ) {
        const senderId =
          Number(
            message.sender_id
          );

        const receiverId =
          Number(
            message.receiver_id
          );

        const otherUserId =
          senderId === userId
            ? receiverId
            : senderId;

        if (
          !Number.isInteger(
            otherUserId
          )
        ) {
          continue;
        }

        /*
         * Como as mensagens estão ordenadas
         * da mais recente para a mais antiga,
         * cada pessoa é registrada somente
         * na primeira ocorrência.
         */
        if (
          conversationsMap[
            otherUserId
          ]
        ) {
          continue;
        }

        const otherUser =
          await User.findByPk(
            otherUserId,
            {
              attributes: [
                'id',
                'name',
                'email',
                'photo',
              ],
            }
          );

        conversationsMap[
          otherUserId
        ] = {
          id:
            otherUserId,

          user:
            formatConversationUser(
              otherUser,
              otherUserId
            ),

          lastMessage:
            getLastMessagePreview(
              message
            ),

          lastMessageTime:
            message.created_at,

          /*
           * Mantém também os nomes
           * alternativos para compatibilidade
           * com diferentes telas do mobile.
           */
          last_message:
            getLastMessagePreview(
              message
            ),

          last_message_time:
            message.created_at,
        };
      }

      const conversations =
        Object.values(
          conversationsMap
        );

      return res
        .status(200)
        .json(
          conversations
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR CONVERSAS:',
        {
          userId:
            req.userId,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar conversas.',
        });
    }
  }

  /*
   * LISTAR MENSAGENS
   *
   * GET /chat/messages/:receiverId
   *
   * As mensagens antigas são preservadas,
   * inclusive quando uma das contas foi
   * anonimizada.
   */
  async getMessages(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      const receiverId =
        Number(
          req.params.receiverId
        );

      if (
        !Number.isInteger(
          userId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (
        !Number.isInteger(
          receiverId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Contato inválido.',
          });
      }

      const messages =
        await Message.findAll({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,

                receiver_id:
                  receiverId,
              },

              {
                sender_id:
                  receiverId,

                receiver_id:
                  userId,
              },
            ],
          },

          order: [
            [
              'created_at',
              'ASC',
            ],
          ],
        });

      return res
        .status(200)
        .json(
          messages
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR MENSAGENS:',
        {
          userId:
            req.userId,

          receiverId:
            req.params
              ?.receiverId,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar mensagens.',
        });
    }
  }

  /*
   * ENVIAR MENSAGEM
   *
   * POST /chat/messages
   *
   * Contas anonimizadas permanecem no
   * histórico, mas não podem receber
   * mensagens novas.
   */
  async sendMessage(
    req,
    res
  ) {
    try {
      const senderId =
        Number(
          req.userId
        );

      const {
        receiver_id,
        message,
        image,
        audio,
      } = req.body;

      const receiverId =
        Number(
          receiver_id
        );

      if (
        !Number.isInteger(
          senderId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (
        !Number.isInteger(
          receiverId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Destinatário inválido.',
          });
      }

      if (
        senderId ===
        receiverId
      ) {
        return res
          .status(400)
          .json({
            message:
              'Não é possível enviar uma mensagem para a própria conta.',
          });
      }

      const normalizedMessage =
        typeof message ===
          'string'
          ? message.trim()
          : '';

      const normalizedImage =
        typeof image ===
          'string' &&
        image.trim()
          ? image.trim()
          : null;

      const normalizedAudio =
        typeof audio ===
          'string' &&
        audio.trim()
          ? audio.trim()
          : null;

      /*
       * A mensagem precisa possuir
       * texto, imagem ou áudio.
       */
      if (
        !normalizedMessage &&
        !normalizedImage &&
        !normalizedAudio
      ) {
        return res
          .status(400)
          .json({
            message:
              'Mensagem inválida.',
          });
      }

      /*
       * VERIFICAR O DESTINATÁRIO
       */
      const receiver =
        await User.findByPk(
          receiverId,
          {
            attributes: [
              'id',
              'email',
            ],
          }
        );

      if (!receiver) {
        return res
          .status(404)
          .json({
            message:
              'Destinatário não encontrado.',
          });
      }

      /*
       * Uma conta anonimizada não possui
       * mais acesso ao aplicativo.
       *
       * As mensagens antigas permanecem,
       * mas novas mensagens não podem ser
       * enviadas para essa conta.
       */
      if (
        isAnonymousEmail(
          receiver.email
        )
      ) {
        return res
          .status(410)
          .json({
            message:
              'Esta conta foi removida e não pode receber novas mensagens.',
          });
      }

      /*
       * CRIAR MENSAGEM
       */
      const newMessage =
        await Message.create({
          sender_id:
            senderId,

          receiver_id:
            receiverId,

          message:
            normalizedMessage ||
            null,

          image:
            normalizedImage,

          audio:
            normalizedAudio,
        });

      return res
        .status(201)
        .json(
          newMessage
        );
    } catch (error) {
      console.error(
        'ERRO AO ENVIAR MENSAGEM:',
        {
          senderId:
            req.userId,

          receiverId:
            req.body
              ?.receiver_id,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao enviar mensagem.',
        });
    }
  }
}

export default new ChatController();