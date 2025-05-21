const Avaliacao = require('../models/Avaliacao');
const Agendamento = require('../models/Agendamento');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Obter todas as avaliações
// @route   GET /api/avaliacoes
// @access  Público
exports.getAvaliacoes = asyncHandler(async (req, res, next) => {
  const avaliacoes = await Avaliacao.find().populate([
    { path: 'usuario', select: 'nome' },
    { path: 'agendamento', select: 'servico', populate: { path: 'servico', select: 'nome tipo' } }
  ]);

  res.status(200).json({
    success: true,
    count: avaliacoes.length,
    data: avaliacoes
  });
});

// @desc    Obter uma avaliação específica
// @route   GET /api/avaliacoes/:id
// @access  Público
exports.getAvaliacao = asyncHandler(async (req, res, next) => {
  const avaliacao = await Avaliacao.findById(req.params.id).populate([
    { path: 'usuario', select: 'nome' },
    { path: 'agendamento', select: 'servico', populate: { path: 'servico', select: 'nome tipo' } }
  ]);

  if (!avaliacao) {
    return next(
      new ErrorResponse(`Avaliação não encontrada com id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: avaliacao
  });
});

// @desc    Criar uma nova avaliação
// @route   POST /api/avaliacoes
// @access  Privado
exports.createAvaliacao = asyncHandler(async (req, res, next) => {
  // Adicionar usuário ao corpo da requisição
  req.body.usuario = req.user.id;

  // Verificar se o agendamento existe e está concluído
  const agendamento = await Agendamento.findById(req.body.agendamento);

  if (!agendamento) {
    return next(
      new ErrorResponse(`Agendamento não encontrado com id ${req.body.agendamento}`, 404)
    );
  }

  // Verificar se o agendamento pertence ao usuário
  if (agendamento.usuario.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Usuário não autorizado a avaliar este agendamento`, 401)
    );
  }

  // Verificar se o agendamento está concluído
  if (agendamento.status !== 'concluído') {
    return next(
      new ErrorResponse(`Apenas agendamentos concluídos podem ser avaliados`, 400)
    );
  }

  // Verificar se o usuário já avaliou este agendamento
  const avaliacaoExistente = await Avaliacao.findOne({
    usuario: req.user.id,
    agendamento: req.body.agendamento
  });

  if (avaliacaoExistente) {
    return next(
      new ErrorResponse(`Usuário já avaliou este agendamento`, 400)
    );
  }

  const avaliacao = await Avaliacao.create(req.body);

  res.status(201).json({
    success: true,
    data: avaliacao
  });
});

// @desc    Atualizar uma avaliação
// @route   PUT /api/avaliacoes/:id
// @access  Privado
exports.updateAvaliacao = asyncHandler(async (req, res, next) => {
  let avaliacao = await Avaliacao.findById(req.params.id);

  if (!avaliacao) {
    return next(
      new ErrorResponse(`Avaliação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se a avaliação pertence ao usuário
  if (avaliacao.usuario.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Usuário não autorizado a atualizar esta avaliação`, 401)
    );
  }

  avaliacao = await Avaliacao.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: avaliacao
  });
});

// @desc    Excluir uma avaliação
// @route   DELETE /api/avaliacoes/:id
// @access  Privado
exports.deleteAvaliacao = asyncHandler(async (req, res, next) => {
  const avaliacao = await Avaliacao.findById(req.params.id);

  if (!avaliacao) {
    return next(
      new ErrorResponse(`Avaliação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se a avaliação pertence ao usuário ou se é admin
  if (avaliacao.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a excluir esta avaliação`, 401)
    );
  }

  await avaliacao.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
