const express = require('express');
const { protect, emailConfirmado } = require('../middleware/auth');

const {
  getAvaliacoes,
  getAvaliacao,
  createAvaliacao,
  updateAvaliacao,
  deleteAvaliacao
} = require('../controllers/avaliacoes');

const router = express.Router();

// Rotas públicas
router.get('/', getAvaliacoes);
router.get('/:id', getAvaliacao);

// Rotas protegidas
router.use(protect);
router.use(emailConfirmado);

router.post('/', createAvaliacao);
router.put('/:id', updateAvaliacao);
router.delete('/:id', deleteAvaliacao);

module.exports = router;
