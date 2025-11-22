# ✅ Jolia's House - Lista de Tarefas (Roadmap)

Este documento descreve as próximas funcionalidades e melhorias planeadas para a aplicação.

---

### Funcionalidades

- Baseado nas transações recorrentes (sem considerar parcelamentos e transações nao recorrentes), criar um "draft" ou "rascunho" baseados no último mes em que se tem registro para projetar proximos meses, ou seja, pegar exatamente a lista de receitas e despesas do último mes, sem considerar parcelamentos e transações nao recorrentes, e projetar, ou seja, nao é pra criar nada no banco de dados, é apenas para PROJETAR aquilo nos proximos meses. O texto inclusive deve aparecer em italico, e nao deve ter nenhuma opção editável, nem o botão o isPaid deve aparecer, ja que é só uma visualização de uma projeção baseada no ultimo mes usando as transações recorrente. Exemplo: qualquer mes futuro que eu entrar, deve-se buscar a última relação de receitas e despesas recorrentes que se tem registro e mostrar em draft as transações no mes futuro. Exemplo 2: o mes atual onde estao minhas transações e registros é Julho, se eu vou lá pra Novembro, quero que as recorrencias sejam projetadas no futuro, no caso no mes de novembro, mas sem criar novos registros, apenas uma projeção.

- Barra de filtros
- Mexer na ordenção/agrupamento por rótulos

- Novo modulo de filmes e series assistidos e para assistir em casal

---

## 🎯 Funcionalidades Principais (Core Features)

### 💳 Gestão de Faturas de Cartão

**Objetivo:** Criar um ambiente dedicado para rastrear despesas de cartões (crédito e débito/pix), com categorização e integração automática com o dashboard principal para os cartões de crédito.

-   [ ] **1. Modelagem de Dados (Firestore):**
    -   **Coleção `cards`:**
        -   `name`: "Nubank Ultravioleta", "Inter Gold"
        -   `type`: 'credit' | 'debit'
        -   `closingDay`: dia do fechamento da fatura (para crédito)
        -   `dueDay`: dia do vencimento da fatura (para crédito)
        -   `subprofileId`: a qual subperfil o cartão pertence.
        -   `status`: 'active' | 'archived'
    -   **Coleção `cardPurchases` (subcoleção de `cards`):**
        -   `description`: "iFood", "Assinatura Netflix"
        -   `amount`: valor da compra
        -   `categoryId`, `subcategoryId`: para categorização
        -   `purchaseDate`: data da compra
        -   `status`: 'confirmed' | 'pending' (Efetivado ou Pendente)
        -   `isInstallment`: boolean
        -   `seriesId`: (opcional) para agrupar compras parceladas dentro do cartão.
        -   `currentInstallment`, `totalInstallments`: (opcional)
        -   `isRecurring`: boolean (para assinaturas)
    -   **Coleção `categories`:**
        -   `name`: "Alimentação", "Transporte"
        -   `subcategories`: ["Restaurante", "Supermercado"]
        -   `profileId`: a qual perfil principal a categoria pertence.

-   [ ] **2. Interface de Gestão de Cartões e Categorias:**
    -   Criar uma nova tela (ou seção nas configurações) onde cada subperfil possa:
        -   CRUD de `cards` (adicionar, editar, arquivar cartões).
        -   CRUD de `categories` e suas subcategorias.

-   [ ] **3. Tela de Fatura do Cartão:**
    -   Criar uma nova tela principal "Faturas".
    -   Nessa tela, o usuário seleciona o subperfil e, em seguida, um dos seus cartões.
    -   Listar todas as `cardPurchases` do mês corrente para o cartão selecionado.
    -   Permitir o lançamento de novas compras (`cardPurchases`), incluindo a opção de serem recorrentes ou parceladas (reutilizando a lógica do Sistema de Parcelamento).
    -   Exibir o valor total da fatura (soma dos `amount` das compras).
    -   Exibir um total previsto (incluindo compras com status `pending`).

-   [ ] **4. Lógica de Integração com o Dashboard:**
    -   **Cartão de Crédito:**
        -   Ao executar a ação de **"Fechar Mês"** no dashboard:
            1.  O sistema irá varrer todos os cartões de crédito de todos os subperfis.
            2.  Para cada cartão, ele somará o `amount` de todas as `cardPurchases` daquele mês.
            3.  Automaticamente, criará uma **única transação** do tipo `expense` no dashboard do subperfil correspondente.
            4.  **Detalhes da transação criada:**
                -   `description`: "Fatura Nubank Ultravioleta"
                -   `actual`: (soma total da fatura)
                -   `isShared`: `false`
                -   `isApportioned`: `false`
                -   `isRecurring`: `false`
                -   Adicionar um campo `cardId: string` ou `isCardBill: true` para identificar que esta transação não pode ser editada ou excluída, apenas marcada como `paid`.
    -   **Cartão de Débito/Pix:**
        -   As compras lançadas em cartões `debit` servem **apenas para tracking e categorização de gastos**.
        -   Elas **NÃO** geram uma transação automática no dashboard principal. O controle de saldo já é feito pelas transações de receita/despesa lançadas manualmente no dashboard.

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