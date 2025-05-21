const nodemailer = require('nodemailer');

// Simulação de envio de e-mail (apenas para desenvolvimento)
const sendEmail = async (options) => {
  // Criar um transportador para simulação
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'noreply@barbearia.com',
      pass: 'senha123'
    },
    // No ambiente de desenvolvimento, não envia e-mails reais
    // apenas registra no console
    logger: true,
    debug: true,
    tls: {
      rejectUnauthorized: false
    }
  });

  // Configurar opções de e-mail
  const message = {
    from: '"Barbearia App" <noreply@barbearia.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message.replace(/\n/g, '<br>')
  };

  // Em ambiente de desenvolvimento, apenas registra no console
  if (process.env.EMAIL_SERVICE === 'console') {
    console.log('==================== SIMULAÇÃO DE E-MAIL ====================');
    console.log(`Para: ${message.to}`);
    console.log(`Assunto: ${message.subject}`);
    console.log(`Mensagem: ${message.text}`);
    console.log('============================================================');
    return true;
  }

  // Em ambiente de produção, enviaria o e-mail
  const info = await transporter.sendMail(message);
  console.log('E-mail enviado: %s', info.messageId);
  return info;
};

module.exports = sendEmail;
