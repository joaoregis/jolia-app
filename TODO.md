# ✅ Jolia Finances - Lista de Tarefas (Roadmap)

Este documento descreve as próximas funcionalidades e melhorias planeadas para a aplicação.

---

## 🎯 Funcionalidades Principais (Core Features)

### 💳 Sistema de Parcelamento e Fatura de Cartão

**Objetivo:** Gerir compras parceladas e faturas de cartão de crédito de forma integrada.

-   [ ] **Modelagem de Dados:**
    -   Adicionar novos campos à `Transaction`: `isInstallment: boolean`, `installmentId: string` (para agrupar parcelas), `currentInstallment: number`, `totalInstallments: number`.
    -   Criar uma nova coleção `creditCardPurchases` para lançamentos individuais do cartão, com campos como `description`, `amount`, `category`, `date`, `cardId`.

-   [ ] **Interface de Lançamento de Parcelas:**
    -   No modal de nova transação, ao marcar como "compra parcelada", mostrar campos para `Número de Parcelas`.
    -   Ao salvar, criar múltiplas transações no Firestore, uma para cada mês futuro, todas ligadas pelo mesmo `installmentId`.

-   [ ] **Gestão de Fatura:**
    -   Criar uma nova tela para "Fatura de Cartão".
    -   Nessa tela, listar todos os `creditCardPurchases` do período.
    -   Implementar um botão "Fechar Fatura" que:
        1.  Soma o total dos `creditCardPurchases`.
        2.  Cria uma única transação de despesa (`type: 'expense'`) no dashboard principal com a descrição "Fatura do Cartão" e o valor total.
        3.  Marca os `creditCardPurchases` como "faturados".

-   [ ] **Categorização de Gastos:**
    -   Adicionar um campo `category` aos `creditCardPurchases` e também às `transactions` normais.
    -   Criar uma UI para adicionar/gerir categorias (ex: Alimentação, Transporte, Lazer).

### ➗ Rateio Automático de Contas da Casa

**Objetivo:** Dividir automaticamente as despesas compartilhadas (`isShared: true`) entre os subperfis com base na proporção das suas receitas.

-   [ ] **Configuração do Rateio:**
    -   Adicionar uma opção nas configurações do Perfil para definir o método de rateio: "Manual" ou "Proporcional à Receita".

-   [ ] **Cálculo da Proporção:**
    -   Na "Visão Geral" do dashboard, calcular a receita efetiva total de cada subperfil no mês corrente.
    -   Calcular o percentual que a receita de cada um representa do total de receitas. (Ex: João R$6000, Julia R$4000. Total R$10000. João = 60%, Julia = 40%).

-   [ ] **Visualização do Rateio:**
    -   Na tabela de "Despesas da Casa", adicionar uma tooltip ou uma secção que mostre o valor que cabe a cada subperfil. (Ex: Conta de Luz R$100 -> João paga R$60, Julia paga R$40).
    -   **Importante:** Decidir se esta divisão gera transações individuais ou se é apenas uma visualização informativa para auxiliar no acerto de contas manual. A segunda opção é mais simples de implementar inicialmente.

---

## 💅 Melhorias de UI/UX

### 📊 Ordenação Persistente e Estável

**Objetivo:** Melhorar a experiência de ordenação da tabela, tornando-a mais previsível e personalizável.

-   [ ] **Índice de Criação:**
    -   Adicionar um campo `createdAt: Timestamp` a todas as novas `Transaction`.
    -   Definir a ordenação padrão da tabela por `createdAt` em ordem descendente, para que novos itens apareçam sempre no topo ou no fundo da lista de forma consistente.

-   [ ] **Persistência da Ordenação:**
    -   Guardar a última configuração de ordenação do utilizador (ex: `{ key: 'paymentDate', direction: 'ascending' }`) no `localStorage` do navegador.
    -   Ao montar o `DashboardScreen`, verificar se existe uma configuração salva no `localStorage` e aplicá-la ao estado `sortConfig`.

### 🎨 Indicadores Visuais de Balanço

**Objetivo:** Dar feedback visual imediato sobre a saúde financeira do balanço (saldo) do mês.

-   [ ] **Definir Limites e Estilos:**
    -   Mapear intervalos de valores do saldo para estilos visuais (cores e ícones).
        -   **Negativo:** Vermelho (`AlertCircle`)
        -   **Baixo (ex: 0 a 20% da receita):** Laranja/Amarelo (`TriangleAlert`)
        -   **Médio (ex: 20% a 50%):** Azul (`Info`)
        -   **Alto (> 50%):** Verde (`CheckCircle`)

-   [ ] **Componente de Indicador:**
    -   Criar um componente `BalanceIndicator` que recebe o valor do saldo e as receitas como props.
    -   O componente implementa a lógica de seleção de cor/ícone e renderiza o resultado.
    -   Substituir o texto do saldo no `Card` do Balanço por este novo componente.

### 🎨 Tema Customizado por Subperfil

**Objetivo:** Permitir que cada subperfil tenha um esquema de cores personalizado para fácil identificação.

-   [ ] **Modelagem de Dados:**
    -   Adicionar um campo opcional `themeColor: string` (ex: `#ff0000`) ao `Subprofile` no `types/index.ts`.

-   [ ] **Interface de Seleção:**
    -   Na modal de adição/edição de subperfil, adicionar um seletor de cores (`<input type="color">`).
    -   Salvar a cor escolhida no documento do Perfil, dentro do respetivo subperfil.

-   [ ] **Aplicação do Tema:**
    -   No `DashboardScreen`, quando uma aba de subperfil estiver ativa, ler a `themeColor`.
    -   Aplicar essa cor dinamicamente usando variáveis CSS ou ajustando as classes do Tailwind. Os alvos seriam a borda inferior da aba ativa e, talvez, o cabeçalho dos `Cards`.

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