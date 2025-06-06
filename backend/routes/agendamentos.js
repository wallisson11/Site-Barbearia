const express = require("express");
const { protect, emailConfirmado } = require("../middleware/auth");
// Corrigir a importação para pegar especificamente o middleware de upload de referência
const { uploadReferencia } = require("../utils/fileUpload");

const {
  getAgendamentos,
  getAgendamento,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  uploadImagem, // Controlador que lida com a lógica após o upload
} = require("../controllers/agendamentos");

const router = express.Router();

// Proteger todas as rotas
router.use(protect);
router.use(emailConfirmado);

router.route("/").get(getAgendamentos).post(createAgendamento);

router
  .route("/:id")
  .get(getAgendamento)
  .put(updateAgendamento)
  .delete(deleteAgendamento);

// Rota para upload de imagem de referência
// Usar o middleware 'uploadReferencia' importado corretamente
// O nome 'imagem' deve corresponder ao nome do campo no formulário frontend
router
  .route("/:id/imagem")
  .put(uploadReferencia.single("imagem"), uploadImagem);

module.exports = router;

