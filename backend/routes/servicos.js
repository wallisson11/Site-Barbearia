const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { uploadServicoImagem } = require("../utils/fileUpload"); // Importar middleware de upload

const {
  getServicos,
  getServico,
  createServico,
  updateServico,
  deleteServico,
} = require("../controllers/servicos");

const router = express.Router();

// Rotas públicas
router.route("/").get(getServicos);
router.route("/:id").get(getServico);

// Middleware de proteção para rotas de admin
router.use(protect);
router.use(authorize("admin"));

// Rotas protegidas (apenas admin) com upload de imagem
// O middleware uploadServicoImagem.single("imagemServico") processa o upload
// O nome "imagemServico" deve corresponder ao nome do campo no formulário frontend
router
  .route("/")
  .post(uploadServicoImagem.single("imagemServico"), createServico);

router
  .route("/:id")
  .put(uploadServicoImagem.single("imagemServico"), updateServico)
  .delete(deleteServico);

module.exports = router;

