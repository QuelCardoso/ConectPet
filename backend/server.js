const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

const authRoutes = require('./routes/authRoutes');
const ongRoutes = require('./routes/ongRoutes');
const doacaoRoutes = require('./routes/doacaoRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/doacoes', doacaoRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', mensagem: 'API ConectaPet rodando perfeitamente!' });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  🐾 =============================================== 🐾
  🚀 Servidor ConectaPet rodando com sucesso!
  📍 Local: http://localhost:${PORT}
  📡 API Health: http://localhost:${PORT}/api/health
  🐾 =============================================== 🐾
  `);
});
