const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Público
exports.register = asyncHandler(async (req, res, next) => {
  const { nome, email, telefone, senha } = req.body;

  // Criar usuário
  const user = await User.create({
    nome,
    email,
    telefone,
    senha
  });

  // Enviar e-mail de confirmação
  const confirmationToken = user.getSignedJwtToken();

  const confirmationUrl = `${req.protocol}://${req.get('host')}/confirmar-email/${confirmationToken}`;

  const message = `Olá ${nome},\n\nBem-vindo à Barbearia! Por favor, confirme seu e-mail clicando no link abaixo:\n\n${confirmationUrl}\n\nAtenciosamente,\nEquipe Barbearia`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Confirmação de Cadastro - Barbearia',
      message
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse('Erro ao enviar e-mail de confirmação', 500));
  }
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Público
exports.login = asyncHandler(async (req, res, next) => {
  const { email, senha } = req.body;

  // Validar email e senha
  if (!email || !senha) {
    return next(new ErrorResponse('Por favor, forneça um email e senha', 400));
  }

  // Verificar usuário
  const user = await User.findOne({ email }).select('+senha');

  if (!user) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  // Verificar se a senha corresponde
  const isMatch = await user.matchPassword(senha);

  if (!isMatch) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Confirmar e-mail do usuário
// @route   GET /api/auth/confirmar-email/:token
// @access  Público
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('Usuário não encontrado', 404));
    }

    user.emailConfirmado = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'E-mail confirmado com sucesso'
    });
  } catch (err) {
    return next(new ErrorResponse('Token inválido ou expirado', 400));
  }
});

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Privado
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Logout / limpar cookie
// @route   GET /api/auth/logout
// @access  Privado
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Função auxiliar para enviar token de resposta
// Função auxiliar para enviar token de resposta
const sendTokenResponse = (user, statusCode, res) => {
  // Criar token
  const token = user.getSignedJwtToken();

  // Converter a expiração de string para número (com fallback)
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30;

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
