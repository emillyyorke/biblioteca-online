const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'livros.json');

class LivroService {
  static async _lerArquivo() {
    try {
      await fs.access(DATA_FILE);
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(DATA_FILE, '[]');
        return [];
      }
      throw error;
    }
  }

  static async _gravarArquivo(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  static async listar() {
    return await this._lerArquivo();
  }

  static async obterPorId(id) {
    if (!id) throw new Error('ID não fornecido');
    const livros = await this._lerArquivo();
    return livros.find(l => l.id.toString() === id.toString());
  }

  static async adicionar(livro) {
    if (!livro.titulo || !livro.autor) {
      throw new Error('Título e autor são obrigatórios');
    }
    
    const livros = await this._lerArquivo();
    const novoLivro = {
      id: Date.now().toString(),
      titulo: livro.titulo,
      autor: livro.autor,
      anoPublicacao: livro.anoPublicacao || 0,
      genero: livro.genero || '',
      disponivel: livro.disponivel !== undefined ? livro.disponivel : true,
      dataCadastro: new Date().toISOString()
    };
    
    livros.push(novoLivro);
    await this._gravarArquivo(livros);
    return novoLivro;
  }

  static async atualizar(id, dadosAtualizados) {
    if (!id) throw new Error('ID não fornecido');
    
    const livros = await this._lerArquivo();
    const index = livros.findIndex(l => l.id.toString() === id.toString());
    
    if (index === -1) return null;
    
    const livroAtualizado = {
      ...livros[index],
      ...dadosAtualizados,
      id: livros[index].id // Mantém o ID original
    };
    
    livros[index] = livroAtualizado;
    await this._gravarArquivo(livros);
    return livroAtualizado;
  }

  static async remover(id) {
    if (!id) throw new Error('ID não fornecido');
    
    const livros = await this._lerArquivo();
    const index = livros.findIndex(l => l.id.toString() === id.toString());
    
    if (index === -1) return false;
    
    livros.splice(index, 1);
    await this._gravarArquivo(livros);
    return true;
  }
}

module.exports = LivroService;