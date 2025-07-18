# ✅ Jolia's House - Lista de Tarefas (Roadmap)

Este documento descreve as próximas funcionalidades e melhorias planeadas para a aplicação.

---

## 🎯 Funcionalidades Principais (Core Features)

### 💳 Sistema de Parcelamento e Fatura de Cartão

**Objetivo:** Gerir compras parceladas e faturas de cartão de crédito de forma integrada.

-   [ ] **Modelagem de Dados:**
    -   Adicionar novos campos à `Transaction`: `isInstallment: boolean`, `installmentId: string` (para agrupar parcelas), `currentInstallment: number`, `totalInstallments: number`.
    -   Criar uma nova coleção `creditCardPurchases` para lançamentos individuais do cartão, com campos como `description`, `amount`, `category`, `date`, `cardId`.

-   [ ] **Interface de Lançamento de Parcelas:**
    -   No modal de nova transação, ao marcar como "compra parcelada", mostrar campos para `Número de Parcelas`.
    -   Ao salvar, criar múltiplas transações no Firestore, uma para cada mês futuro, todas ligadas pelo mesmo `installmentId`.

-   [ ] **Gestão de Fatura:**
    -   Criar uma nova tela para "Fatura de Cartão".
    -   Nessa tela, listar todos os `creditCardPurchases` do período.
    -   Implementar um botão "Fechar Fatura" que:
        1.  Soma o total dos `creditCardPurchases`.
        2.  Cria uma única transação de despesa (`type: 'expense'`) no dashboard principal com a descrição "Fatura do Cartão" e o valor total.
        3.  Marca os `creditCardPurchases` como "faturados".

-   [ ] **Categorização de Gastos:**
    -   Adicionar um campo `category` aos `creditCardPurchases` e também às `transactions` normais.
    -   Criar uma UI para adicionar/gerir categorias (ex: Alimentação, Transporte, Lazer).

---

### 🛒 Sistema de Estoque Inteligente (Dispensa/Geladeira)

**Objetivo:** Transformar o Jolia's House num sistema completo de gestão de inventário doméstico, com automação de entrada via NFC-e, controle de estoque e geração de listas de compras e insights de gastos.

-   [ ] **1. Modelagem de Dados Avançada (Firestore):**
    -   **Coleção `householdItems`:**
        -   `name`: Nome original do produto (ex: "LEITE COND MOCOCA TP 395G").
        -   `alias`: Nome personalizado e amigável (ex: "Leite Condensado"). **(Chave para o sistema)**
        -   `category`: Categoria definida pelo utilizador (ex: "Laticínios", "Limpeza").
        -   `unit`: Unidade de medida (ex: "un", "kg", "L", "g").
        -   `quantity`: Quantidade atual em estoque.
        -   `minQuantity`: Quantidade mínima para alerta de reposição.
        -   `lastPrice`: Último valor pago pelo item.
        -   `avgPrice`: Valor médio histórico do item.
        -   `classification`: Classificação de prioridade (ex: "Essencial", "Uso Comum", "Supérfluo").
        -   `status`: Status atual ('Em estoque', 'Baixo', 'Faltando').
    -   **Coleção `purchaseHistory` (subcoleção de `householdItems`):**
        -   Para rastrear o histórico de preços de cada item.
        -   Campos: `date`, `price`, `quantity`, `storeName`, `storeId`, `nfceId`.

-   [ ] **2. Entrada de Itens via NFC-e (QR Code):**
    -   **Leitor de QR Code:**
        -   Implementar uma funcionalidade na aplicação para abrir a câmera do dispositivo.
        -   Utilizar uma biblioteca (ex: `html5-qrcode-scanner`) para ler o QR Code de uma NFC-e e extrair a URL de consulta.
    -   **Web Scraper (Backend/Cloud Function):**
        -   Criar uma Cloud Function que recebe a URL da NFC-e.
        -   A função acessa a página da Sefaz (em background), faz o scraping dos dados da tabela de produtos (descrição, quantidade, valor unitário, valor total) e das informações do cabeçalho **(incluindo nome e CNPJ do estabelecimento)**.
    -   **Tela de "Conciliação de Nota Fiscal":**
        -   Após o scraping, apresentar os dados numa tela intermediária.
        -   Para cada item da nota, o sistema tentará encontrar um `alias` correspondente na base de dados (usando similaridade de strings).
        -   **Interface de Correção:**
            -   Mostrar o nome original do produto e o `alias` sugerido.
            -   Permitir ao utilizador:
                -   Confirmar a sugestão.
                -   Escolher um `alias` existente de uma lista.
                -   Criar um novo `alias`, o que exigirá também a definição de categoria, unidade e quantidade mínima. **(Este passo é obrigatório para novos itens)**.
        -   Após a conciliação, o utilizador confirma a entrada, e o sistema atualiza o estoque e o histórico de preços dos itens, **associando a compra ao estabelecimento correto**.

-   [ ] **3. Gestão Manual de Estoque:**
    -   **Tela de Inventário (`StockScreen.tsx`):**
        -   Visualização completa do estoque, com filtros por `category`, `status`, `classification`.
        -   Permitir a adição manual de novos itens (com todos os campos: alias, categoria, etc.).
        -   Funcionalidades de ajuste rápido:
            -   Botões de "+" e "-" para incrementar/decrementar a quantidade.
            -   Opção de "Consumir item" (baixa no estoque).
            -   Opção de "Adicionar ao carrinho" (muda o status para 'Faltando').

-   [ ] **4. Geração de Lista de Compras Inteligente:**
    -   **Relatório "Lista de Compras":**
        -   Gerar uma lista com todos os itens cujo `status` seja 'Faltando' ou 'Baixo' (quantidade <= `minQuantity`).
        -   Para cada item na lista, mostrar:
            -   `Alias` do item.
            -   Quantidade a comprar (sugestão para atingir o estoque ideal, a ser definido).
            -   **Último Preço Pago**.
            -   **Preço Médio Histórico**.
    -   **Interatividade da Lista (Guia de Compras):**
        -   Permitir ao utilizador dar "check" nos itens da lista para controle visual *enquanto estiver no supermercado*.
        -   **Importante:** O "check" na lista de compras **não** atualiza o estoque principal. Ele serve apenas como um guia temporário.
        -   O estoque será reposto oficialmente após a compra, através da leitura da nova NFC-e ou da entrada manual dos itens.
        -   Opção para exportar/compartilhar a lista.

-   [ ] **5. Análise e Insights de Compras:**
    -   **Dashboard de Análise de Gastos:**
        -   Criar uma nova tela de "Análises" ou uma seção dentro do Estoque.
    -   **Relatório de Gastos por Estabelecimento:**
        -   Visualizar o total gasto em cada supermercado/loja num determinado período.
        -   Gráficos comparativos (barras, pizza) para facilitar a visualização.
    -   **Comparador de Preços por Item:**
        -   Selecionar um item (pelo `alias`) e ver um histórico/comparativo de preços dele em todos os estabelecimentos onde foi comprado.
        -   Ex: "Leite Condensado" - Supermercado A: R$ 5,50 | Supermercado B: R$ 5,25.
    -   **Sugestão de "Melhor Cesta":**
        -   Uma funcionalidade avançada que, com base na lista de compras atual, sugere em qual estabelecimento cada item foi mais barato na última compra, ajudando a otimizar a rota de compras.

---

## ✨ Melhorias de UI/UX e Qualidade de Vida

-   [ ] **Sombra de Destaque na Fonte:** Adicionar uma sombra sutil (`text-shadow`) em todos os textos da aplicação para melhorar a legibilidade e o contraste, especialmente em temas personalizados.

-   [ ] **Copiar/Colar Cores no Customizador de Tema:** Implementar um menu de contexto (clique com o botão direito) nos seletores de cor da tela de personalização de tema, com opções para "Copiar Cor" e "Colar Cor", agilizando a criação de paletas consistentes.

-   [ ] **Sincronização Completa de Transações Rateadas:** Garantir que, ao editar uma transação "Da Casa" na Visão Geral, todas as suas propriedades (como `paymentDate`, `dueDate`, `paid`, etc.) sejam automaticamente atualizadas nas transações filhas (rateios) nos subperfis, não apenas os valores.

---

## 🔒 Melhorias de Segurança

### 🛡️ Autenticação de Dois Fatores (2FA)

**Objetivo:** Adicionar uma camada extra de segurança no login.

-   [ ] **Pesquisa e Configuração:**
    -   Estudar a implementação de Multi-Factor Authentication (MFA) do Firebase Auth.
    -   No Console do Firebase, em **Authentication > Settings**, ativar a opção de 2FA.

-   [ ] **Fluxo de Ativação pelo Utilizador:**
    -   Criar uma secção de "Segurança" na página de "Configurações".
    -   Implementar um fluxo onde o utilizador possa ativar o 2FA, o que geralmente envolve:
        1.  Gerar um QR Code para ser lido por uma app de autenticação (Google Authenticator, Authy, etc.).
        2.  Pedir ao utilizador para inserir um código da app para confirmar a sincronização.

-   [ ] **Verificação no Login:**
    -   Após o login com email/senha bem-sucedido, verificar se o utilizador tem 2FA ativo.
    -   Se sim, redirecioná-lo para uma nova tela para inserir o código de 6 dígitos da sua app de autenticação antes de dar acesso total à aplicação.