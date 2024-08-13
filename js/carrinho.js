var localCarrinho = localStorage.getItem('carrinho');
// Obtém o usuário logado
var loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

// Verifica se há itens no carrinho
var localCarrinho = localStorage.getItem('carrinho');
if (localCarrinho) {
    var carrinho = JSON.parse(localCarrinho);
    if (carrinho.length > 0) {
        // Renderiza o carrinho e soma os totais
        renderizarCarrinho();
        calcularTotal();
    } else {
        // Mostra o carrinho vazio
        carrinhoVazio();
    }
} else {
    // Mostra o carrinho vazio
    carrinhoVazio();
}

// Função para renderizar os itens no carrinho
function renderizarCarrinho() {
    // Esvazia a área dos itens
    $("#listaCarrinho").empty();

    // Percorre o carrinho e adiciona os itens à área
    $.each(carrinho, function (index, itemCarrinho) {
        var itemDiv = `
        <div class="item-carrinho">
            <div class="area-img">
                <img src="${itemCarrinho.item.imagem}">
            </div>
            <div class="area-details">
                <div class="sup">
                    <span class="name-prod">
                    ${itemCarrinho.item.nome}
                    </span>
                    <a data-index="${index}" class="delete-item" href="#">
                        <i class="mdi mdi-close"></i>
                    </a>
                </div>
                <div class="middle">
                    <span>${itemCarrinho.item.principal_caracteristica}</span>
                </div>
                <div class="count">
                    <!-- Botão "Selecionar Data" -->
                    <button class="selecionar-data" data-index="${index}">Selecionar Data</button>
                    <!-- Campo de input do Flatpickr (inicialmente oculto) -->
                    <div class="flatpickr-container" id="flatpickr-${index}" style="display: none;">
                        <input type="text" placeholder="Selecionar Data">
                    </div>
                </div>
            </div>
        </div>
        `;

        // Adiciona o item ao carrinho
        $("#listaCarrinho").append(itemDiv);
    });

    // Lida com o clique no botão "Selecionar Data"
    $(".selecionar-data").click(function () {
        var index = $(this).data('index');

        // Mostra o campo de input do Flatpickr
        var $flatpickrContainer = $(`#flatpickr-${index}`);
        if (!$flatpickrContainer.is(':visible')) {
            $flatpickrContainer.show();

            // Inicializa o Flatpickr apenas uma vez
            flatpickr(`#flatpickr-${index} input`, {
                locale: "pt", // Define o idioma para português do Brasil
                dateFormat: "d/m/Y", // Define o formato da data
                minDate: "today", // Define a data mínima como hoje
                maxDate: new Date().fp_incr(2 * 30), // Limita a seleção de data para até dois meses a partir de hoje
                onChange: function(selectedDates, dateStr, instance) {
                    localStorage.setItem('dataSelecionada-' + index, dateStr);
                }
            });

            // Abre o Flatpickr automaticamente
            document.querySelector(`#flatpickr-${index} input`)._flatpickr.open();
        }
    });

    // Lida com o clique no botão "Alugar"
    $("#botaoAlugar").click(function () {
        // Verifica se uma data foi selecionada
        var dataSelecionada = [];
        $(".flatpickr-container input").each(function() {
            var data = $(this).val();
            if (data) {
                dataSelecionada.push(data);
            }
        });

        if (dataSelecionada.length !== carrinho.length) {
            // Se alguma data não foi selecionada, exibe uma mensagem de erro
            app.dialog.alert('Por favor, selecione uma data para todos os itens antes de prosseguir.', 'Erro');
            return; // Encerra a execução da função
        }

        // Exibe o app.dialog para os termos do serviço
        app.dialog.confirm(
            'Você concorda com os termos do serviço?', // Mensagem do termo
            'Termos de Serviço', // Título do termo
            function () {
                // Usuário concordou com os termos
                localStorage.setItem('concordou', 'true');

                // Exibe a caixa de diálogo com a data selecionada para confirmação
                app.dialog.confirm(
                    'Data selecionada: ' + dataSelecionada.join(', '), 
                    'Confirme o fim do empréstimo em:',
                    function () {
                        // Usuário confirmou a data

                        // Recupera o nome completo do usuário logado
                        var nomeCompleto = loggedInUser.nome;

                        // Recupera a lista de itens emprestados do localStorage
                        var itensEmprestados = JSON.parse(localStorage.getItem('itensEmprestados')) || [];

                        // Adiciona cada item do carrinho à lista de itens emprestados
                        $.each(carrinho, function (index, itemCarrinho) {
                            var itemEmprestado = {
                                id: itemCarrinho.item.id,
                                nome: itemCarrinho.item.nome,
                                imagem: itemCarrinho.item.imagem,
                                data: dataSelecionada[index],
                                nomeCompleto: nomeCompleto // Usa o nome completo do usuário logado
                            };
                            itensEmprestados.push(itemEmprestado);
                        });

                        // Armazena a lista atualizada de itens emprestados no localStorage
                        localStorage.setItem('itensEmprestados', JSON.stringify(itensEmprestados));

                        // Limpa o carrinho e a data temporária
                        localStorage.removeItem('carrinho');
                        localStorage.removeItem('dataSelecionada');

                        // Exibe uma mensagem de sucesso
                        app.dialog.alert('Aluguel feito com sucesso.', 'Sucesso', function () {
                            // Recarrega a página
                            window.location.reload();
                        });
                    },
                    function () {
                        // Usuário cancelou a confirmação da data
                        app.dialog.alert('Volte e confirme a data', 'Cancelado');
                     
                    }
                );
            },
            function () {
                // Usuário não concordou com os termos
                app.dialog.alert('Você deve concordar com os termos do serviço para prosseguir.', 'Erro');
            }
        );
    });

    // Lida com o clique no botão "Remover Item"
    $(document).on('click', '.delete-item', function () {
        var index = $(this).data('index');
        // Confirmação
        app.dialog.confirm('Tem certeza?', 'Remover', function () {
            // Remove item do carrinho
            carrinho.splice(index, 1);
            // Atualiza o carrinho com item removido
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            // Atualiza a página
            renderizarCarrinho();
            calcularTotal();
        });
    });
}

// Função para calcular o total do carrinho
function calcularTotal() {
    var totalCarrinho = 0;
    $.each(carrinho, function (index, itemCarrinho) {
        totalCarrinho += itemCarrinho.item.total_item;
    });
    // Mostrar o total
    $("#subtotal").html(totalCarrinho.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
}

// Função para mostrar o carrinho vazio
function carrinhoVazio() {
    // Esvaziar lista do carrinho
    $("#listaCarrinho").empty();

    // Esconder os itens de baixo, botão e totais
    $("#toolbarTotais").addClass('display-none');
    $("#toolbarCheckout").addClass('display-none');

    // Mostrar sacolinha vazia
    $("#listaCarrinho").html(`
    <div class="text-align-center">
        <img width="300" src="img/empty.gif">
        <br><span class="color-gray">Nada por enquanto...</span>
    </div>
    `);
}

// Lidar com o clique no botão "Esvaziar Carrinho"
$("#esvaziar").on('click', function () {
    app.dialog.confirm('Tem certeza que quer esvaziar o carrinho?', '<strong>ESVAZIAR</strong>', function () {
        // Apagar o localStorage do carrinho
        localStorage.removeItem('carrinho');
        renderizarCarrinho();
        calcularTotal();
    });
});
