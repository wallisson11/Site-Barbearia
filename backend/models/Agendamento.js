const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  servico: {
    type: mongoose.Schema.ObjectId,
    ref: 'Servico',
    required: true
  },
  data: {
    type: Date,
    required: [true, 'Por favor, selecione uma data']
  },
  horario: {
    type: String,
    required: [true, 'Por favor, selecione um horário']
  },
  status: {
    type: String,
    enum: ['agendado', 'confirmado', 'cancelado', 'concluído'],
    default: 'agendado'
  },
  imagemReferencia: {
    type: String,
    default: null
  },
  observacoes: {
    type: String,
    maxlength: [500, 'Observações não podem ter mais que 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
