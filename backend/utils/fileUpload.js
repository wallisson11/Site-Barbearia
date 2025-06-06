const path = require("path");
const multer = require("multer");
const ErrorResponse = require("./errorResponse");

// Configuração de armazenamento para imagens de referência de agendamento
const storageReferencias = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/referencias/");
  },
  filename: function (req, file, cb) {
    // Usar ID do agendamento (se disponível) ou timestamp + nome original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configuração de armazenamento para imagens de serviços
const storageServicos = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/servicos/");
  },
  filename: function (req, file, cb) {
    // Usar ID do serviço (se disponível na atualização) ou timestamp + nome original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Função de filtro de arquivo para aceitar apenas imagens
function checkFileType(file, cb) {
  // Tipos de arquivo permitidos
  const filetypes = /jpeg|jpg|png|gif/;
  // Checar extensão
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Checar mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse("Erro: Apenas imagens são permitidas!", 400));
  }
}

// Middleware de upload para imagens de referência
const uploadReferencia = multer({
  storage: storageReferencias,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Middleware de upload para imagens de serviços
const uploadServicoImagem = multer({
  storage: storageServicos,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = { uploadReferencia, uploadServicoImagem };

