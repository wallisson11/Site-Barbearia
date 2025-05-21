const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para o console para desenvolvimento
  console.log(err);

  // Mongoose erro de ID inválido
  if (err.name === 'CastError') {
    const message = `Recurso não encontrado`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose erro de campo duplicado
  if (err.code === 11000) {
    const message = 'Valor duplicado inserido';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose erro de validação
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro do servidor'
  });
};

module.exports = errorHandler;
