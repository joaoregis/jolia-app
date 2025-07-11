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

---

### 📝 Observações/Notas em Transações

**Objetivo:** Permitir que o usuário adicione notas de texto a cada transação, de forma similar à funcionalidade do aplicativo "Flo".

**Requisitos Funcionais:**

1.  **Armazenamento:**
    * [ ] Adicionar um campo opcional `notes` (string) à interface `Transaction` no arquivo `src/types/index.ts`.

2.  **Formulário de Transação (`TransactionForm`):**
    * [ ] Incluir um campo de `textarea` no formulário de criação e edição de transações para que o usuário possa inserir ou modificar a nota.
    * [ ] O campo deve ser opcional.

3.  **Exibição na Tabela (`TransactionTable`):**
    * [ ] Na tabela de transações, uma nova coluna deve exibir um ícone (ex: `FileText` ou `MessageSquare`) ao lado da descrição da transação.
    * [ ] O ícone **só deve aparecer** se a transação contiver uma nota (`notes` não é nulo ou vazio).
    * [ ] Se o texto da nota for apagado e salvo, o ícone deve desaparecer da tabela.

4.  **Modal de Notas (`NoteModal`):**
    * [ ] Criar um novo componente de modal (`NoteModal.tsx`) que será aberto ao clicar no ícone de nota na tabela.
    * [ ] O modal deve exibir o conteúdo completo da nota em um `textarea` e permitir a edição.
    * [ ] O modal deve ter botões para "Salvar" e "Cancelar".
    * [ ] Ao salvar, a nota da transação deve ser atualizada no Firestore.

**Fluxo de Implementação:**

-   **Backend/Tipagem:** Alterar a interface `Transaction`.
-   **Componente (Formulário):** Adicionar o `textarea` em `TransactionForm.tsx`.
-   **Componente (Tabela):** Adicionar a lógica de exibição condicional do ícone e o evento `onClick` em `TransactionTable.tsx`.
-   **Componente (Modal):** Criar o `NoteModal.tsx` para edição rápida.
-   **Lógica Principal:** Implementar a função de atualização da nota no `DashboardScreen.tsx` e passá-la como prop para o modal.

---

### ✅ Seletor de Linhas para Cálculos

**Objetivo:** Implementar uma funcionalidade que permita ao usuário selecionar múltiplas linhas na tabela de transações para calcular a **soma** e a **média** dos valores previstos e efetivos.

**Requisitos Funcionais:**

1.  **Seleção de Linhas:**
    * [ ] Adicionar uma coluna de `checkbox` no início de cada linha da `TransactionTable`.
    * [ ] Incluir um `checkbox` no cabeçalho da tabela para "Selecionar Tudo".

2.  **Barra de Cálculos:**
    * [ ] Criar um novo componente, como uma barra flutuante ou um rodapé fixo na tabela (`CalculationToolbar.tsx`).
    * [ ] Esta barra só deve ser visível quando **pelo menos uma linha** for selecionada.
    * [ ] A barra deve exibir:
        * **Contagem de Itens:** "X itens selecionados"
        * **Soma Prevista:** A soma dos valores do campo `planned` das linhas selecionadas.
        * **Soma Efetiva:** A soma dos valores do campo `actual` das linhas selecionadas.
        * **Média Prevista:** A média dos valores do campo `planned`.
        * **Média Efetiva:** A média dos valores do campo `actual`.
    * [ ] Os valores devem ser formatados como moeda (R$).

3.  **Estado e Lógica:**
    * [ ] Gerenciar o estado das linhas selecionadas no `DashboardScreen.tsx` (ex: `useState<Set<string>>(new Set())`).
    * [ ] Passar o estado e as funções de manipulação (adicionar/remover seleção) para a `TransactionTable`.
    * [ ] Os cálculos de soma e média devem ser refeitos a cada mudança na seleção.

**Design e Experiência do Usuário (UX):**

-   Os checkboxes devem ser visualmente agradáveis e alinhados com o design do sistema.
-   A barra de cálculos deve ter um design limpo e não intrusivo, aparecendo e desaparecendo com uma animação suave.
-   Incluir um botão para "Limpar Seleção" na barra de cálculos.

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