const mongoose = require('mongoose');

const AvaliacaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  agendamento: {
    type: mongoose.Schema.ObjectId,
    ref: 'Agendamento',
    required: true
  },
  nota: {
    type: Number,
    required: [true, 'Por favor, adicione uma nota'],
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    maxlength: [500, 'Comentário não pode ter mais que 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Garantir que um usuário só possa avaliar um agendamento uma vez
AvaliacaoSchema.index({ usuario: 1, agendamento: 1 }, { unique: true });

module.exports = mongoose.model('Avaliacao', AvaliacaoSchema);
