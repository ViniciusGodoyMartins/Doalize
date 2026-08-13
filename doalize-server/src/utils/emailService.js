import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

function getTransporter() {
  const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASSWORD,
  } = process.env;

  if (
    !MAIL_HOST ||
    !MAIL_PORT ||
    !MAIL_USER ||
    !MAIL_PASSWORD
  ) {
    throw new Error(
      'O serviço de e-mail não está configurado no servidor.'
    );
  }

  return nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure:
      String(MAIL_SECURE)
        .toLowerCase() ===
      'true',
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });
}

export async function sendPasswordCode({
  email,
  name,
  code,
}) {
  const transporter =
    getTransporter();

  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject:
      'Código de verificação do Doalize',
    text:
      `Olá, ${name}.\n\n` +
      `Seu código para alterar a senha é: ${code}\n\n` +
      'O código expira em 10 minutos.\n\n' +
      'Se você não solicitou essa alteração, ignore este e-mail.',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Doalize</h2>

        <p>Olá, ${name}.</p>

        <p>
          Seu código para alterar a senha é:
        </p>

        <div
          style="
            display: inline-block;
            padding: 14px 22px;
            background: #f1f5f9;
            border-radius: 10px;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
          "
        >
          ${code}
        </div>

        <p>
          O código expira em 10 minutos.
        </p>

        <p>
          Se você não solicitou essa alteração,
          ignore este e-mail.
        </p>
      </div>
    `,
  });
}