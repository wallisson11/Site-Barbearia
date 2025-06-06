const mongoose = require("mongoose");

const ServicoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "Por favor, adicione um nome para o serviço"],
    trim: true,
    maxlength: [50, "Nome não pode ter mais que 50 caracteres"],
  },
  descricao: {
    type: String,
    required: [true, "Por favor, adicione uma descrição"],
    maxlength: [500, "Descrição não pode ter mais que 500 caracteres"],
  },
  preco: {
    type: Number,
    required: [true, "Por favor, adicione um preço"],
  },
  duracao: {
    type: Number,
    required: [true, "Por favor, adicione a duração em minutos"],
    default: 30,
  },
  tipo: {
    type: String,
    required: [true, "Por favor, adicione um tipo"],
    enum: ["corte", "barba", "combo"], // Sintaxe corrigida aqui
  },
  imagem: {
    type: String,
    default: "default-servico.jpg", // Imagem padrão para serviços
  },
  disponivel: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Servico", ServicoSchema);

