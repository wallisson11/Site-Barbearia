const express = require('express');
const { protect, emailConfirmado } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

const {
  getAgendamentos,
  getAgendamento,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
  uploadImagem
} = require('../controllers/agendamentos');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);
router.use(emailConfirmado);

router
  .route('/')
  .get(getAgendamentos)
  .post(createAgendamento);

router
  .route('/:id')
  .get(getAgendamento)
  .put(updateAgendamento)
  .delete(deleteAgendamento);

// Rota para upload de imagem
router.route('/:id/imagem').put(upload.single('imagem'), uploadImagem);

module.exports = router;
