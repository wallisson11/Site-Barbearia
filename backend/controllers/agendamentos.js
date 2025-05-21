const Agendamento = require('../models/Agendamento');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

// @desc    Obter todos os agendamentos
// @route   GET /api/agendamentos
// @access  Privado
exports.getAgendamentos = asyncHandler(async (req, res, next) => {
  // Se o usuário não for admin, mostrar apenas seus agendamentos
  let query;
  
  if (req.user.role !== 'admin') {
    query = Agendamento.find({ usuario: req.user.id });
  } else {
    query = Agendamento.find();
  }

  // Adicionar populate
  query = query.populate([
    { path: 'usuario', select: 'nome email telefone' },
    { path: 'servico', select: 'nome descricao preco duracao tipo' }
  ]);

  const agendamentos = await query;

  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos
  });
});

// @desc    Obter um agendamento específico
// @route   GET /api/agendamentos/:id
// @access  Privado
exports.getAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id).populate([
    { path: 'usuario', select: 'nome email telefone' },
    { path: 'servico', select: 'nome descricao preco duracao tipo' }
  ]);

  if (!agendamento) {
    return next(
      new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o agendamento pertence ao usuário ou se é admin
  if (agendamento.usuario._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a acessar este agendamento`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: agendamento
  });
});

// @desc    Criar um novo agendamento
// @route   POST /api/agendamentos
// @access  Privado
exports.createAgendamento = asyncHandler(async (req, res, next) => {
  // Adicionar usuário ao corpo da requisição
  req.body.usuario = req.user.id;

  const agendamento = await Agendamento.create(req.body);

  // Enviar e-mail de confirmação
  try {
    const servico = await agendamento.populate('servico');
    
    const message = `Olá ${req.user.nome},\n\nSeu agendamento foi realizado com sucesso!\n\nDetalhes do agendamento:\nServiço: ${servico.servico.nome}\nData: ${new Date(agendamento.data).toLocaleDateString('pt-BR')}\nHorário: ${agendamento.horario}\n\nAtenciosamente,\nEquipe Barbearia`;

    await sendEmail({
      email: req.user.email,
      subject: 'Confirmação de Agendamento - Barbearia',
      message
    });
  } catch (err) {
    console.log('Erro ao enviar e-mail de confirmação:', err);
    // Não interrompe o fluxo se o e-mail falhar
  }

  res.status(201).json({
    success: true,
    data: agendamento
  });
});

// @desc    Atualizar um agendamento
// @route   PUT /api/agendamentos/:id
// @access  Privado
exports.updateAgendamento = asyncHandler(async (req, res, next) => {
  let agendamento = await Agendamento.findById(req.params.id);

  if (!agendamento) {
    return next(
      new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o agendamento pertence ao usuário ou se é admin
  if (agendamento.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a atualizar este agendamento`, 401)
    );
  }

  agendamento = await Agendamento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: agendamento
  });
});

// @desc    Excluir um agendamento
// @route   DELETE /api/agendamentos/:id
// @access  Privado
exports.deleteAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id);

  if (!agendamento) {
    return next(
      new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o agendamento pertence ao usuário ou se é admin
  if (agendamento.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a excluir este agendamento`, 401)
    );
  }

  // Se houver imagem de referência, excluir
  if (agendamento.imagemReferencia) {
    const imagePath = path.join(__dirname, '../uploads/referencias/', agendamento.imagemReferencia);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await agendamento.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload de imagem de referência para agendamento
// @route   PUT /api/agendamentos/:id/imagem
// @access  Privado
exports.uploadImagem = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id);

  if (!agendamento) {
    return next(
      new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o agendamento pertence ao usuário ou se é admin
  if (agendamento.usuario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a atualizar este agendamento`, 401)
    );
  }

  if (!req.file) {
    return next(new ErrorResponse(`Por favor, envie um arquivo`, 400));
  }

  // Se já existir uma imagem, excluir
  if (agendamento.imagemReferencia) {
    const imagePath = path.join(__dirname, '../uploads/referencias/', agendamento.imagemReferencia);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  // Atualizar agendamento com o nome do arquivo
  agendamento.imagemReferencia = req.file.filename;
  await agendamento.save();

  res.status(200).json({
    success: true,
    data: agendamento
  });
});
