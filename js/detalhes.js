// Recuperar o id detalhes do localStorage
var id = parseInt(localStorage.getItem('detalhe'));

// Pegar os produtos do localStorage
var produtos = JSON.parse(localStorage.getItem('produtos'));

var item = produtos.find(produto => produto.id === id);

if (item) {
    // Tem o item
    console.log('Produto encontrado: ', item);

    // Alimentar com os valores
    $("#imagem-detalhe").attr('src', item.imagem);
    $("#nome-detalhe").html(item.nome);
    $("#descricao-detalhe").html(item.descricao);

    var tabelaDetalhes = $("#tabdetalhes");

    item.detalhes.forEach(detalhe => {
        var linha = `
        <tr>
            <td>${detalhe.NúmerodePatrimônio}</td>
        </tr>
        `;
        tabelaDetalhes.append(linha);
    });
} else {
    console.log('Produto não encontrado');
}

var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para adicionar ao carrinho
function adicionarAoCarrinho(item, quantidade) {
    var itemNoCarrinho = carrinho.find(c => c.item.id === item.id);

    if (itemNoCarrinho) {
        // Item já está no carrinho
        var toastCenter = app.toast.create({
            text: 'Este item já está no carrinho.',
            position: 'center',
            closeTimeout: 2000,
        });
        toastCenter.open();
    } else {
        carrinho.push({
            item: item,
            quantidade: quantidade,
            total_item: quantidade * item.preco
        });

        // Atualizar o localStorage do carrinho
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        var toastCenter = app.toast.create({
            text: `${item.nome} adicionado ao carrinho`,
            position: 'center',
            closeTimeout: 2000,
        });
        toastCenter.open();
    }
}

// Verificar se o item está emprestado
function isItemEmprestado(itemId) {
    var itensEmprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];
    return itensEmprestados.some(emp => emp.id === itemId);
}

// Inicializar o botão "selecionar"
function initBotaoSelecionar() {
    if (isItemEmprestado(item.id)) {
        $(".add-cart").addClass('indisponivel').text('Indisponível');
    } else {
        $(".add-cart").removeClass('indisponivel').text('Selecionar');
    }
}

// Clique no botão "add-cart"
$(".add-cart").on('click', function () {
    if (isItemEmprestado(item.id)) {
        var toastCenter = app.toast.create({
            text: 'Este item já está emprestado.',
            position: 'center',
            closeTimeout: 2000,
        });
        toastCenter.open();
    } else {
        // Adicionar ao carrinho
        adicionarAoCarrinho(item, 1);
    }
});

// Inicializar o botão ao carregar a página
$(document).ready(function () {
    initBotaoSelecionar();
});
