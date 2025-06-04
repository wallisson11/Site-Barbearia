const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Proteger rotas
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obter token do cabeçalho
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Obter token dos cookies
    token = req.cookies.token;
  }

  // Verificar se o token existe
  if (!token) {
    return next(new ErrorResponse('Não autorizado para acessar esta rota', 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar usuário à requisição
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Não autorizado para acessar esta rota', 401));
  }
});

// Verificar se o e-mail foi confirmado
exports.emailConfirmado = asyncHandler(async (req, res, next) => {
  if (!req.user.emailConfirmado) {
    return next(
      new ErrorResponse('Por favor, confirme seu e-mail para acessar esta rota', 403)
    );
  }
  next();
});

// Conceder acesso a funções específicas
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Função ${req.user.role} não está autorizada a acessar esta rota`,
          403
        )
      );
    }
    next();
  };
};
