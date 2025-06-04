const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Criar transportador SMTP com dados do .env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,       // Exemplo: 'smtp.gmail.com'
    port: process.env.SMTP_PORT,       // Exemplo: 587
    secure: process.env.SMTP_SECURE === 'true',  // true para porta 465, false para 587
    auth: {
      user: process.env.SMTP_USER,     // Seu e-mail real, ex: 'seuemail@gmail.com'
      pass: process.env.SMTP_PASS      // Senha do app ou senha da conta
    },
    logger: true,
    debug: true,
    tls: {
      rejectUnauthorized: false
    }
  });

  // Configurar opções do e-mail
  const message = {
    from: `"Barbearia App" <${process.env.SMTP_USER}>`,  // Remetente do e-mail
    to: options.email,       // Destinatário
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>')
  };

  // Se estiver em modo console (dev), só imprime no terminal
  if (process.env.EMAIL_SERVICE === 'console') {
    console.log('==================== SIMULAÇÃO DE E-MAIL ====================');
    console.log(`Para: ${message.to}`);
    console.log(`Assunto: ${message.subject}`);
    console.log(`Mensagem: ${message.text}`);
    console.log('============================================================');
    return true;
  }

  // Em produção, envia o e-mail de verdade
  const info = await transporter.sendMail(message);
  console.log('E-mail enviado: %s', info.messageId);
  return info;
};

module.exports = sendEmail;
