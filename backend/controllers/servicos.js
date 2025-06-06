const Servico = require("../models/Servico");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { uploadServicoImagem } = require("../utils/fileUpload"); // Importar o middleware de upload
const path = require("path");
const fs = require("fs");

// @desc    Obter todos os serviços
// @route   GET /api/servicos
// @access  Público
exports.getServicos = asyncHandler(async (req, res, next) => {
  const servicos = await Servico.find();

  res.status(200).json({
    success: true,
    count: servicos.length,
    data: servicos,
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
    data: servico,
  });
});

// @desc    Criar um novo serviço (com upload de imagem)
// @route   POST /api/servicos
// @access  Privado/Admin
exports.createServico = asyncHandler(async (req, res, next) => {
  // Usar o middleware de upload ANTES desta função na rota
  // O middleware colocará o arquivo em req.file e os campos de texto em req.body

  const servicoData = { ...req.body };

  if (req.file) {
    servicoData.imagem = req.file.filename;
  } else {
    // Se nenhuma imagem for enviada, usa a padrão definida no modelo
    // servicoData.imagem = \'default-servico.jpg\"; // Não precisa, o modelo já faz isso
  }

  const servico = await Servico.create(servicoData);

  res.status(201).json({
    success: true,
    data: servico,
  });
});

// @desc    Atualizar um serviço (com upload de imagem opcional)
// @route   PUT /api/servicos/:id
// @access  Privado/Admin
exports.updateServico = asyncHandler(async (req, res, next) => {
  // Usar o middleware de upload ANTES desta função na rota

  let servico = await Servico.findById(req.params.id);

  if (!servico) {
    return next(
      new ErrorResponse(`Serviço não encontrado com id ${req.params.id}`, 404)
    );
  }

  const updateData = { ...req.body };

  if (req.file) {
    // Se uma nova imagem foi enviada, atualiza o campo
    updateData.imagem = req.file.filename;

    // Opcional: Remover imagem antiga se não for a padrão
    if (servico.imagem && servico.imagem !== "default-servico.jpg") {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "servicos",
        servico.imagem
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error("Erro ao remover imagem antiga:", err);
          // Não bloquear a atualização se a remoção falhar, apenas logar
        }
      });
    }
  }

  servico = await Servico.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: servico,
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

  // Remover imagem associada se não for a padrão
  if (servico.imagem && servico.imagem !== "default-servico.jpg") {
    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "servicos",
      servico.imagem
    );
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Erro ao remover imagem do serviço excluído:", err);
      }
    });
  }

  await servico.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

