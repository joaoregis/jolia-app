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
## 🎨 Personalização e UI

### 🖌️ Temas Customizáveis

**Objetivo:** Permitir que os utilizadores criem e salvem os seus próprios temas de cores para cada subperfil, além dos temas pré-definidos.

-   [ ] **Modelagem de Dados:**
    -   Modificar a estrutura do `Subprofile` em `src/types/index.ts` para armazenar um objeto de tema customizado, por exemplo: `customTheme?: Theme['variables']`.

-   [ ] **Interface de Customização:**
    -   Na modal de edição de subperfil (`EditSubprofileModal.tsx`), adicionar uma nova secção "Personalizar Tema".
    -   Criar um componente `ThemeCustomizer` que contenha:
        -   Seletores de cores (`<input type="color">`) para cada variável do tema (`--background`, `--card`, `--text-primary`, etc.).
        -   Uma área de pré-visualização com componentes de exemplo (cards, botões, textos) que se atualizem em tempo real conforme as cores são alteradas.

-   [ ] **Lógica de Aplicação:**
    -   No `DashboardScreen.tsx`, modificar a lógica que aplica o tema para verificar se um subperfil tem um `customTheme`. Se tiver, aplicar essas cores em vez de um tema pré-definido.
    -   Garantir que a seleção de um tema pré-definido limpe as configurações do tema customizado.

-   [ ] **Salvamento:**
    -   Atualizar a função `handleUpdateSubprofile` no hook `useSubprofileManager.ts` para salvar o objeto `customTheme` no Firestore, junto com as outras informações do subperfil.

---

## 🏡 Gestão da Casa

### 🛒 Sistema de Estoque (Dispensa/Geladeira)

**Objetivo:** Expandir o Jolia Finances para incluir um sistema de gestão de itens domésticos, funcionando como um inventário e lista de compras.

-   [ ] **Modelagem de Dados (Firestore):**
    -   Criar uma nova coleção `householdItems`.
    -   Cada documento representará um item e terá campos como: `name`, `quantity`, `unit` (ex: "un", "kg", "L"), `category` (ex: "Laticínios", "Limpeza", "Higiene"), `status` ('Em estoque', 'Faltando', 'Comprar'), `isEssential` (boolean).

-   [ ] **Nova Tela de Gestão de Estoque:**
    -   Criar uma nova rota e um novo componente de tela (ex: `StockScreen.tsx`).
    -   A tela deve permitir:
        -   Visualizar itens em listas ou cards, agrupados por `category` ou `status`.
        -   Adicionar novos itens com nome, categoria e unidade.
        -   Mudar rapidamente a quantidade de um item.
        -   Marcar itens como 'Faltando' ou 'Comprar', movendo-os para uma lista de compras.

-   [ ] **Componente de Lista de Compras:**
    -   Dentro da `StockScreen`, ter uma aba ou secção dedicada à "Lista de Compras".
    -   Listar todos os itens com status 'Comprar'.
    -   Permitir marcar itens como "comprados", o que os moveria de volta para 'Em estoque' e permitiria ao utilizador definir a quantidade adquirida.

-   [ ] **Classificação de Itens:**
    -   Implementar a classificação de itens. Sugestões:
        -   **Essencial:** Itens de necessidade básica.
        -   **Uso Comum:** Itens recorrentes, mas não críticos.
        -   **Supérfluo/Desejo:** Itens não essenciais.
        -   **Ocasional:** Comprado raramente.
    -   Permitir filtrar a lista por essas classificações.

### 🎁 Sistema de Wishlist (Lista de Desejos)

**Objetivo:** Criar um espaço para que o casal (ou utilizadores individuais) possa listar e acompanhar desejos de compra.

-   [ ] **Modelagem de Dados (Firestore):**
    -   Criar uma nova coleção `wishlists`. Cada documento será uma lista (ex: "Coisas para a Casa", "Viagem de Férias").
    -   Dentro de cada documento `wishlist`, ter uma subcoleção `wishlistItems` com campos como: `title`, `description`, `notes`, `budget` (valor), `isDone` (boolean), `subprofileId` (para desejos individuais) ou `isShared` (para desejos do casal).

-   [ ] **Interface da Wishlist:**
    -   Criar uma nova tela (`WishlistScreen.tsx`) acessível pelo menu principal.
    -   Permitir a criação de múltiplas listas de desejos.
    -   Dentro de cada lista, exibir os itens.

-   [ ] **Componente de Item da Wishlist:**
    -   Cada item na lista deve mostrar `title`, `description`, `budget`.
    -   Um checkbox para marcar `isDone`. Quando marcado, o item deve ter uma aparência diferente (ex: riscado, opaco).
    -   Botões de ação rápida para editar (abrir modal) e excluir.
    -   A exclusão deve acionar uma modal de confirmação (`DeleteConfirmationModal`).

-   [ ] **Lógica de Subperfis:**
    -   Implementar abas ou filtros para alternar entre a wishlist "Geral" (da casa/casal) e as wishlists individuais de cada subperfil.

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