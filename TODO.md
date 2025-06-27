# ✅ Jolia Finances - Lista de Tarefas (Roadmap)

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

### ➗ Rateio Automático de Contas da Casa

**Objetivo:** Dividir automaticamente as despesas compartilhadas (`isShared: true`) entre os subperfis com base na proporção das suas receitas.

-   [x] **Configuração do Rateio:**
    -   Adicionada uma opção nas configurações do Perfil para definir o método de rateio: "Manual" ou "Proporcional à Receita".

-   [x] **Cálculo da Proporção:**
    -   Na "Visão Geral" do dashboard, é calculada a receita efetiva total de cada subperfil no mês corrente.
    -   O sistema calcula o percentual que a receita de cada um representa do total de receitas.

-   [x] **Visualização e Gestão do Rateio:**
    -   Na tabela de "Despesas da Casa", uma tooltip mostra o valor que cabe a cada subperfil.
    -   A divisão gera transações individuais para cada subperfil, que não podem ser editadas diretamente, sendo controladas pela transação "Pai".
    -   Um indicador visual foi adicionado para identificar despesas originadas de rateio.
    -   O sistema reage a mudanças no método de rateio e a alterações nas receitas, recalculando as proporções e transações automaticamente.

### ⏭️ Ignorar Transação Recorrente (Skip)

**Objetivo:** Permitir que o usuário "pule" uma receita ou despesa recorrente em um mês específico, sem afetar a recorrência nos meses seguintes.

-   [ ] **Modelagem de Dados:**
    -   Adicionar um novo campo à `Transaction`: `skippedInMonths: array` (ex: `['2025-07', '2025-09']`). Este array guardará os meses em que a transação foi pulada.

-   [ ] **Interface de Utilizador:**
    -   No menu de ações (`...`) de cada transação **recorrente** (`isRecurring: true`), adicionar uma nova opção: "Ignorar neste mês".
    -   Criar uma nova tabela no dashboard chamada "Receitas e Despesas Ignoradas neste Mês".
    -   Esta tabela só deve ser renderizada se houver pelo menos uma transação ignorada no mês corrente.
    -   Na tabela de ignorados, cada item deve ter um botão "Reativar" para remover a marcação de "ignorado" e trazê-lo de volta para a tabela principal.

-   [ ] **Lógica de Negócio:**
    -   Quando uma transação é marcada como "ignorada", seu `id` e o `currentMonthString` ('YYYY-MM') são adicionados ao array `skippedInMonths` do documento da transação no Firestore.
    -   A lógica que filtra os dados para as tabelas principais (`TransactionTable`) deve ser atualizada para **excluir** qualquer transação que tenha o mês corrente no seu array `skippedInMonths`.
    -   Os totais e balanços do `SummaryCards` não devem incluir os valores de transações ignoradas.
    -   **Importante:** Ao fechar o mês, a lógica de criação de transações recorrentes (`performCloseMonth`) deve continuar funcionando normalmente para a transação ignorada, criando-a para o mês seguinte. A marcação de "ignorado" é válida apenas para o mês em que foi aplicada.

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