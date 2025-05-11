const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const LivroController = require('./LivroController');

const app = express();
const PORT = 3000;

// Configurações essenciais
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas CRUD
app.get('/livros', LivroController.listarLivros);
app.get('/livros/:id', LivroController.obterLivro);
app.post('/livros', LivroController.adicionarLivro);
app.put('/livros/:id', LivroController.atualizarLivro);
app.delete('/livros/:id', LivroController.removerLivro);

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ status: 'API funcionando', timestamp: new Date() });
});

// Middleware para erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Teste a API em http://localhost:${PORT}/test`);
});