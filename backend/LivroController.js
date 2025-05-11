const LivroService = require('./LivroService');

const LivroController = {
  async listarLivros(req, res) {
    try {
      const livros = await LivroService.listar();
      res.json(livros);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar livros' });
    }
  },

  async obterLivro(req, res) {
    try {
      const livro = await LivroService.obterPorId(req.params.id);
      if (!livro) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }
      res.json(livro);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar livro' });
    }
  },

  async adicionarLivro(req, res) {
    try {
      if (!req.body.titulo || !req.body.autor) {
        return res.status(400).json({ error: 'Título e autor são obrigatórios' });
      }
      const novoLivro = await LivroService.adicionar(req.body);
      res.status(201).json(novoLivro);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async atualizarLivro(req, res) {
    try {
      const livroAtualizado = await LivroService.atualizar(req.params.id, req.body);
      if (!livroAtualizado) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }
      res.json(livroAtualizado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async removerLivro(req, res) {
    try {
      const removido = await LivroService.remover(req.params.id);
      if (!removido) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = LivroController;