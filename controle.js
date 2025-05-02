// Variáveis e dados iniciais
let chamados = JSON.parse(localStorage.getItem('chamados')) || [];

// Funções utilitárias
function formatarData(data) {
    if (!data) return new Date().toLocaleDateString('pt-BR');
    return new Date(data).toLocaleDateString('pt-BR');
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Manipulação das abas
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
        
        if (tab.dataset.tab === 'lista') {
            renderizarChamados();
        }
    });
});

// Formulário de novo chamado
document.getElementById('chamado-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const novoChamado = {
        id: gerarId(),
        data: new Date().toISOString(),
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        ordemServico: document.getElementById('ordem-servico').value,
        atendente: document.getElementById('atendente').value,
        status: document.getElementById('status').value,
        observacoes: document.getElementById('observacoes').value
    };
    
    chamados.unshift(novoChamado);
    salvarDados();
    this.reset();
    
    alert('Chamado registrado com sucesso!');
});

// Filtros
document.getElementById('aplicar-filtro').addEventListener('click', function() {
    renderizarChamados();
});

document.getElementById('limpar-filtro').addEventListener('click', function() {
    document.getElementById('filtro-status').value = 'todos';
    document.getElementById('filtro-data').value = '';
    document.getElementById('filtro-atendente').value = '';
    renderizarChamados();
});

// Renderizar chamados na tabela
function renderizarChamados() {
    const statusFiltro = document.getElementById('filtro-status').value;
    const dataFiltro = document.getElementById('filtro-data').value;
    const atendenteFiltro = document.getElementById('filtro-atendente').value.toLowerCase();
    
    const chamadosFiltrados = chamados.filter(chamado => {
        const passaStatus = statusFiltro === 'todos' || chamado.status === statusFiltro;
        const passaData = !dataFiltro || chamado.data.includes(dataFiltro);
        const passaAtendente = !atendenteFiltro || chamado.atendente.toLowerCase().includes(atendenteFiltro);
        
        return passaStatus && passaData && passaAtendente;
    });
    
    const tbody = document.getElementById('chamados-lista');
    tbody.innerHTML = '';
    
    if (chamadosFiltrados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align: center;">Nenhum chamado encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    chamadosFiltrados.forEach(chamado => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(chamado.data)}</td>
            <td>${chamado.titulo}</td>
            <td>${chamado.ordemServico}</td>
            <td>${chamado.atendente}</td>
            <td><span class="status-${chamado.status}">${chamado.status.toUpperCase()}</span></td>
            <td class="no-print">
                <div class="actions">
                    <button onclick="verDetalhes('${chamado.id}')">Detalhes</button>
                    <button onclick="editarStatus('${chamado.id}')">Editar Status</button>
                    <button onclick="excluirChamado('${chamado.id}')" style="background-color: #e74c3c;">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções de manipulação de chamados
function verDetalhes(id) {
    const chamado = chamados.find(c => c.id === id);
    if (!chamado) return;
    
    const modal = document.getElementById('detalhes-modal');
    document.getElementById('modal-titulo').textContent = chamado.titulo;
    
    document.getElementById('modal-conteudo').innerHTML = `
        <p><strong>Data:</strong> ${formatarData(chamado.data)}</p>
        <p><strong>Ordem de Serviço:</strong> ${chamado.ordemServico}</p>
        <p><strong>Atendente:</strong> ${chamado.atendente}</p>
        <p><strong>Status:</strong> <span class="status-${chamado.status}">${chamado.status.toUpperCase()}</span></p>
        <p><strong>Descrição:</strong></p>
        <p>${chamado.descricao}</p>
        <p><strong>Observações:</strong></p>
        <p>${chamado.observacoes || 'Nenhuma observação registrada.'}</p>
    `;
    
    modal.style.display = 'block';
}

function editarStatus(id) {
    const chamado = chamados.find(c => c.id === id);
    if (!chamado) return;
    
    const novoStatus = prompt('Escolha o novo status (aberto, pendente, fechado):', chamado.status);
    if (!novoStatus) return;
    
    if (['aberto', 'pendente', 'fechado'].includes(novoStatus.toLowerCase())) {
        chamado.status = novoStatus.toLowerCase();
        
        const observacao = prompt('Adicionar observação sobre a mudança de status (opcional):');
        if (observacao) {
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            chamado.observacoes = `${chamado.observacoes ? chamado.observacoes + '\n\n' : ''}[${dataAtual}] Mudança de status: ${observacao}`;
        }
        
        salvarDados();
        renderizarChamados();
    } else {
        alert('Status inválido! Use aberto, pendente ou fechado.');
    }
}

function excluirChamado(id) {
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
        chamados = chamados.filter(c => c.id !== id);
        salvarDados();
        renderizarChamados();
    }
}

// Fechar modal
document.getElementById('fechar-modal').addEventListener('click', function() {
    document.getElementById('detalhes-modal').style.display = 'none';
});

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('chamados', JSON.stringify(chamados));
}

// Imprimir lista
document.getElementById('imprimir').addEventListener('click', function() {
    document.querySelector('.print-title').style.display = 'block';
    window.print();
    document.querySelector('.print-title').style.display = 'none';
});

// Funções globais (precisam estar no escopo global para os event handlers inline)
window.verDetalhes = verDetalhes;
window.editarStatus = editarStatus;
window.excluirChamado = excluirChamado;

// Inicializar a aplicação
renderizarChamados();
