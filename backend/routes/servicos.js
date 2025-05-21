const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const {
  getServicos,
  getServico,
  createServico,
  updateServico,
  deleteServico
} = require('../controllers/servicos');

const router = express.Router();

// Rotas públicas
router.get('/', getServicos);
router.get('/:id', getServico);

// Rotas protegidas (apenas admin)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createServico);
router.put('/:id', updateServico);
router.delete('/:id', deleteServico);

module.exports = router;
