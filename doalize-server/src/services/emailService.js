import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

function createTransporter() {
  const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASSWORD,
  } = process.env;

  if (!MAIL_HOST) {
    throw new Error(
      'MAIL_HOST não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_PORT) {
    throw new Error(
      'MAIL_PORT não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_USER) {
    throw new Error(
      'MAIL_USER não foi configurado no arquivo .env.'
    );
  }

  if (!MAIL_PASSWORD) {
    throw new Error(
      'MAIL_PASSWORD não foi configurado no arquivo .env.'
    );
  }

  const transporter =
    nodemailer.createTransport({
      host: MAIL_HOST,

      port: Number(
        MAIL_PORT
      ),

      secure:
        String(
          MAIL_SECURE
        ).toLowerCase() ===
        'true',

      auth: {
        user: MAIL_USER,

        pass: MAIL_PASSWORD,
      },
    });

  return transporter;
}

export async function verifyEmailConnection() {
  const transporter =
    createTransporter();

  await transporter.verify();

  return true;
}

export async function sendPasswordCode({
  email,
  name,
  code,
}) {
  if (!email) {
    throw new Error(
      'O e-mail do destinatário não foi informado.'
    );
  }

  if (!code) {
    throw new Error(
      'O código de verificação não foi informado.'
    );
  }

  const transporter =
    createTransporter();

  const sender =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER;

  const userName =
    name?.trim() ||
    'usuário';

  const mailOptions = {
    from: sender,

    to: email,

    subject:
      'Código de verificação do Doalize',

    text:
      `Olá, ${userName}.\n\n` +
      `Seu código para alterar a senha é: ${code}\n\n` +
      'O código expira em 10 minutos.\n\n' +
      'Se você não solicitou essa alteração, ignore este e-mail.',

    html: `
      <div
        style="
          max-width: 560px;
          margin: 0 auto;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
          background-color: #ffffff;
        "
      >
        <h1
          style="
            margin: 0 0 24px;
            color: #2563eb;
            font-size: 28px;
          "
        >
          Doalize
        </h1>

        <p
          style="
            margin: 0 0 16px;
            font-size: 16px;
            line-height: 1.6;
          "
        >
          Olá, ${userName}.
        </p>

        <p
          style="
            margin: 0 0 18px;
            font-size: 16px;
            line-height: 1.6;
          "
        >
          Recebemos uma solicitação para alterar
          a senha da sua conta.
        </p>

        <p
          style="
            margin: 0 0 12px;
            font-size: 16px;
          "
        >
          Seu código de verificação é:
        </p>

        <div
          style="
            display: inline-block;
            margin: 5px 0 22px;
            padding: 15px 24px;
            border-radius: 10px;
            background-color: #eff6ff;
            color: #1d4ed8;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 7px;
          "
        >
          ${code}
        </div>

        <p
          style="
            margin: 0 0 16px;
            font-size: 15px;
            line-height: 1.6;
          "
        >
          O código expira em 10 minutos.
        </p>

        <p
          style="
            margin: 0;
            font-size: 14px;
            line-height: 1.6;
            color: #6b7280;
          "
        >
          Se você não solicitou essa alteração,
          ignore este e-mail.
        </p>
      </div>
    `,
  };

  const information =
    await transporter.sendMail(
      mailOptions
    );

  return information;
}
