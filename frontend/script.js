document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const livroForm = document.getElementById('livro-form');
  const livroIdInput = document.getElementById('livro-id');
  const tituloInput = document.getElementById('titulo');
  const autorInput = document.getElementById('autor');
  const anoInput = document.getElementById('anoPublicacao');
  const generoInput = document.getElementById('genero');
  const disponivelInput = document.getElementById('disponivel');
  const salvarBtn = document.getElementById('salvar-btn');
  const cancelarBtn = document.getElementById('cancelar-btn');
  const buscarBtn = document.getElementById('buscar-btn');
  const mostrarTodosBtn = document.getElementById('mostrar-todos-btn');
  const livrosContainer = document.getElementById('livros-container');
  
  let editando = false;
  
  // Inicialização
  carregarLivros();
  
  // Event Listeners
  livroForm.addEventListener('submit', handleSubmit);
  cancelarBtn.addEventListener('click', limparFormulario);
  buscarBtn.addEventListener('click', buscarPorId);
  mostrarTodosBtn.addEventListener('click', carregarLivros);
  
  // Função principal do formulário
  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validação básica
    if (!tituloInput.value.trim() || !autorInput.value.trim()) {
      alert('Título e autor são obrigatórios!');
      return;
    }
    
    const livro = {
      titulo: tituloInput.value.trim(),
      autor: autorInput.value.trim(),
      anoPublicacao: anoInput.value ? parseInt(anoInput.value) : 0,
      genero: generoInput.value.trim(),
      disponivel: disponivelInput.checked
    };
    
    try {
      if (editando) {
        await atualizarLivro(livroIdInput.value, livro);
      } else {
        await adicionarLivro(livro);
      }
      
      limparFormulario();
      carregarLivros();
    } catch (error) {
      mostrarErro('Erro ao salvar livro: ' + error.message);
    }
  }
  
  // Carrega todos os livros
  async function carregarLivros() {
    try {
      livrosContainer.innerHTML = '<p class="loading-message">Carregando livros...</p>';
      
      const response = await fetch('http://localhost:3000/livros');
      
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      
      const livros = await response.json();
      renderizarLivros(livros);
    } catch (error) {
      mostrarErro('Erro ao carregar livros: ' + error.message);
    }
  }
  
  // Renderiza a lista de livros
  function renderizarLivros(livros) {
    livrosContainer.innerHTML = '';
    
    if (livros.length === 0) {
      livrosContainer.innerHTML = '<p class="loading-message">Nenhum livro cadastrado.</p>';
      return;
    }
    
    livros.forEach(livro => {
      const livroCard = document.createElement('div');
      livroCard.className = 'livro-card';
      livroCard.innerHTML = `
        <h3>${livro.titulo}</h3>
        <p><strong>ID:</strong> ${livro.id}</p>
        <p><strong>Autor:</strong> ${livro.autor}</p>
        <p><strong>Ano:</strong> ${livro.anoPublicacao || 'Não informado'}</p>
        <p><strong>Gênero:</strong> ${livro.genero || 'Não informado'}</p>
        <p><strong>Status:</strong> <span class="${livro.disponivel ? 'disponivel' : 'indisponivel'}">
          ${livro.disponivel ? 'Disponível' : 'Indisponível'}
        </span></p>
        <div class="livro-actions">
          <button class="editar-btn" data-id="${livro.id}">Editar</button>
          <button class="excluir-btn" data-id="${livro.id}">Excluir</button>
        </div>
      `;
      livrosContainer.appendChild(livroCard);
    });
    
    // Adiciona eventos aos botões dinâmicos
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', () => editarLivro(btn.dataset.id));
    });
    
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', () => excluirLivro(btn.dataset.id));
    });
  }
  
  // Busca livro por ID
  async function buscarPorId() {
    const id = document.getElementById('busca-id').value.trim();
    
    if (!id) {
      alert('Por favor, digite um ID para buscar');
      return;
    }
    
    try {
      livrosContainer.innerHTML = '<p class="loading-message">Buscando livro...</p>';
      
      const response = await fetch(`http://localhost:3000/livros/${id}`);
      
      if (response.status === 404) {
        livrosContainer.innerHTML = `
          <div class="error-message">
            <p>Livro com ID ${id} não encontrado</p>
            <button id="voltar-todos-btn">Voltar para lista completa</button>
          </div>
        `;
        document.getElementById('voltar-todos-btn').addEventListener('click', carregarLivros);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      
      const livro = await response.json();
      renderizarLivros([livro]);
    } catch (error) {
      livrosContainer.innerHTML = `
        <div class="error-message">
          <p>Erro ao buscar livro: ${error.message}</p>
          <button id="voltar-todos-btn">Voltar para lista completa</button>
        </div>
      `;
      document.getElementById('voltar-todos-btn').addEventListener('click', carregarLivros);
    }
  }
  
  // Funções CRUD
  async function adicionarLivro(livro) {
    const response = await fetch('http://localhost:3000/livros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(livro)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao adicionar livro');
    }
    
    return await response.json();
  }
  
  async function editarLivro(id) {
    try {
      const response = await fetch(`http://localhost:3000/livros/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }
      
      const livro = await response.json();
      
      livroIdInput.value = livro.id;
      tituloInput.value = livro.titulo;
      autorInput.value = livro.autor;
      anoInput.value = livro.anoPublicacao || '';
      generoInput.value = livro.genero || '';
      disponivelInput.checked = livro.disponivel !== false;
      
      editando = true;
      salvarBtn.textContent = 'Atualizar';
      cancelarBtn.style.display = 'inline-block';
    } catch (error) {
      mostrarErro('Erro ao carregar livro para edição: ' + error.message);
    }
  }
  
  async function atualizarLivro(id, livro) {
    const response = await fetch(`http://localhost:3000/livros/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(livro)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao atualizar livro');
    }
    
    return await response.json();
  }
  
  async function excluirLivro(id) {
    try {
      if (!confirm('Tem certeza que deseja excluir este livro?')) {
        return;
      }
      
      const response = await fetch(`http://localhost:3000/livros/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir livro');
      }
      
      carregarLivros();
    } catch (error) {
      mostrarErro('Erro ao excluir livro: ' + error.message);
    }
  }
  
  // Funções auxiliares
  function limparFormulario() {
    livroForm.reset();
    livroIdInput.value = '';
    editando = false;
    salvarBtn.textContent = 'Salvar';
    cancelarBtn.style.display = 'none';
  }
  
  function mostrarErro(mensagem) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensagem;
    livrosContainer.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }
});