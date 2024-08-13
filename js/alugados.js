// Função para converter string "dd/mm/yyyy" para objeto Date
function converterParaData(dataStr) {
    var partes = dataStr.split('/');
    var dia = parseInt(partes[0], 10);
    var mes = parseInt(partes[1], 10) - 1; 1
    var ano = parseInt(partes[2], 10);
    return new Date(ano, mes, dia);
}

// Função para verificar se a data atual é posterior à data de devolução
function verificarInadimplencia(dataEmprestimo) {
    var dataDevolucao = converterParaData(dataEmprestimo);
    var dataAtual = new Date();

    return dataAtual > dataDevolucao;
}

// Função para renderizar itens emprestados
function renderizarItensEmprestados() {
    setTimeout(function() {
        var itensEmprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];

        if (itensEmprestados.length > 0) {
            $.each(itensEmprestados, function (index, item) {
                var inadimplente = verificarInadimplencia(item.data);

                var itemDiv = `
                <li class="item-content">
                    <div class="item-media">
                        <img src="${item.imagem}" width="120">
                    </div>
                    <div class="item-inner">
                        <div class="item-title">${item.nome}</div>
                        <div class="item-subtitle">Emprestado por: ${item.nomeCompleto}</div>
                        <div class="item-text">Até: ${item.data}</div>
                        ${inadimplente ? '<button class="inadimplente-btn">Inadimplência</button>' : ''}
                    </div>
                </li>`;                
                
                $("#alugados-list").append(itemDiv);
            });
        } else {
            $("#alugados-list").html('<li class="item-content"><div class="item-inner"><div class="item-title">Nenhum item emprestado.</div></div></li>');
        }
    }, 500);
}

$(document).ready(function() {
    renderizarItensEmprestados();
});
