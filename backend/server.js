const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Rotas
const auth = require('./routes/auth');
const servicos = require('./routes/servicos');
const agendamentos = require('./routes/agendamentos');
const avaliacoes = require('./routes/avaliacoes');

const app = express();

// Middleware para body parser
app.use(express.json());

// Habilitar CORS
app.use(cors());

// Criar pasta de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads/referencias');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Montar rotas
app.use('/api/auth', auth);
app.use('/api/servicos', servicos);
app.use('/api/agendamentos', agendamentos);
app.use('/api/avaliacoes', avaliacoes);

// Rota para horários disponíveis (simulação com horários fixos)
app.get('/api/horarios', (req, res) => {
  // Horários fixos para simulação
  const horarios = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  res.status(200).json({
    success: true,
    data: horarios
  });
});

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Lidar com rejeições de promessas não tratadas
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro: ${err.message}`);
  // Fechar servidor e sair do processo
  server.close(() => process.exit(1));
});
