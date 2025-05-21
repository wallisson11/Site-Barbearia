const Servico = require('../models/Servico');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Obter todos os serviços
// @route   GET /api/servicos
// @access  Público
exports.getServicos = asyncHandler(async (req, res, next) => {
  const servicos = await Servico.find();

  res.status(200).json({
    success: true,
    count: servicos.length,
    data: servicos
  });
});

// @desc    Obter um serviço específico
// @route   GET /api/servicos/:id
// @access  Público
exports.getServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.findById(req.params.id);

  if (!servico) {
    return next(
      new ErrorResponse(`Serviço não encontrado com id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: servico
  });
});

// @desc    Criar um novo serviço
// @route   POST /api/servicos
// @access  Privado/Admin
exports.createServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.create(req.body);

  res.status(201).json({
    success: true,
    data: servico
  });
});

// @desc    Atualizar um serviço
// @route   PUT /api/servicos/:id
// @access  Privado/Admin
exports.updateServico = asyncHandler(async (req, res, next) => {
  let servico = await Servico.findById(req.params.id);

  if (!servico) {
    return next(
      new ErrorResponse(`Serviço não encontrado com id ${req.params.id}`, 404)
    );
  }

  servico = await Servico.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: servico
  });
});

// @desc    Excluir um serviço
// @route   DELETE /api/servicos/:id
// @access  Privado/Admin
exports.deleteServico = asyncHandler(async (req, res, next) => {
  const servico = await Servico.findById(req.params.id);

  if (!servico) {
    return next(
      new ErrorResponse(`Serviço não encontrado com id ${req.params.id}`, 404)
    );
  }

  await servico.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
