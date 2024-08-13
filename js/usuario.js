// Obter o usuário logado
var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

// Verificar se o usuário está logado
if (loggedInUser) {
    // Exibir o nome, username e e-mail do usuário na página
    document.getElementById('userNome').textContent = loggedInUser.nome || 'Nome não disponível';
    document.getElementById('userUsername').textContent = loggedInUser.username || 'Username não disponível';
    document.getElementById('userEmail').textContent = loggedInUser.email || 'Email não disponível';

    // Verificar o status da contribuição e atualizar o botão
    var contribuicaoButton = document.getElementById('contribuicaoStatus');
    var avisoContribuicao = document.getElementById('avisoContribuicao');
    var itensEmprestadosBlock = document.getElementById('itensEmprestadosBlock');

    if (loggedInUser.contribuicao) {
        contribuicaoButton.textContent = 'Contribuição em Dia';
        contribuicaoButton.style.backgroundColor = 'green';
        contribuicaoButton.style.color = 'white';
        avisoContribuicao.style.display = 'none';
        itensEmprestadosBlock.style.display = 'block';
    } else {
        contribuicaoButton.textContent = 'Contribuição Pendente';
        contribuicaoButton.style.backgroundColor = 'red';
        contribuicaoButton.style.color = 'white';
        avisoContribuicao.style.display = 'block';
        itensEmprestadosBlock.style.display = 'none';
    }

    contribuicaoButton.addEventListener('click', function () {
        if (!loggedInUser.contribuicao) {
            app.dialog.alert('Sua contribuição está pendente. Por favor, regularize sua situação para continuar utilizando o serviço.', 'Contribuição Pendente');
        }
    });

    // Função para carregar itens emprestados específicos do usuário
    function carregarItensEmprestados() {
        setTimeout(function () {
            var emprestadosList = document.getElementById('emprestados-list');
            const emprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];
            emprestadosList.innerHTML = '';

            emprestados
                .filter(item => item.nomeCompleto === loggedInUser.nome) // Filtrar itens do usuário logado
                .forEach(item => {
                    const itemHTML = `
                    <li class="item">
                        <div class="item-content">
                            <div class="item-media">
                                <img src="${item.imagem}" width="120">
                            </div>
                            <div class="item-inner">
                                <div class="item-title">${item.nome}</div>
                                <div class="item-subtitle">${item.data ? `Data: ${item.data}` : 'Data não disponível'}</div>
                            </div>
                        </div>
                        <div class="item-action">
                            <button class="devolver-btn" data-id="${item.id}">Devolver</button>
                        </div>
                    </li>
                    `;
                    emprestadosList.insertAdjacentHTML('beforeend', itemHTML);
                });

            if (emprestados.filter(item => item.nomeCompleto === loggedInUser.nome).length === 0) {
                emprestadosList.innerHTML = '<li class="item-content"><div class="item-inner"><div class="item-title">Nenhum item emprestado.</div></div></li>';
            }
        }, 500);
    }

    // Função para lidar com a ação de devolver
    function handleItemAction(event) {
        const target = event.target;

        if (target.classList.contains('devolver-btn')) {
            const id = parseInt(target.getAttribute('data-id'), 10);
            let emprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];

            // Log do ID para depuração
            console.log(`ID do botão: ${id}`);
            console.log('Itens emprestados antes da remoção:', emprestados);

            // Remover o item da lista
            emprestados = emprestados.filter(item => item.id !== id);

            // Atualizar o localStorage
            localStorage.setItem('itensEmprestados', JSON.stringify(emprestados));

            // Recarregar a lista de itens
            carregarItensEmprestados();
        }
    }

    // Adicionar ouvintes de eventos aos botões
    document.getElementById('emprestados-list').addEventListener('click', handleItemAction);

    // Inicializar a aba do usuário ao carregar a página
    carregarItensEmprestados();
} else {
    // Se não há um usuário logado, redirecionar para a página de login ou mostrar uma mensagem
    window.location.href = 'login.html'; // Ou qualquer outra ação apropriada
}
