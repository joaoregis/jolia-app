# Jolia Finances

Aplicação web de **gestão financeira pessoal** com suporte a múltiplos perfis e subperfis, séries/parcelas, fechamento de mês, rótulos, wishlist, importação e exportação de dados.

## Sumário
- [Jolia Finances](#jolia-finances)
  - [Sumário](#sumário)
  - [Stack](#stack)
  - [Arquitetura](#arquitetura)
  - [Funcionalidades](#funcionalidades)
  - [Modelos de Dados](#modelos-de-dados)
  - [Estrutura de Pastas](#estrutura-de-pastas)
  - [Começando](#começando)
    - [Pré-requisitos](#pré-requisitos)
    - [Setup](#setup)
  - [Scripts NPM](#scripts-npm)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Segurança (Firestore)](#segurança-firestore)
  - [Deploy (Firebase Hosting)](#deploy-firebase-hosting)
  - [Roadmap (alto nível)](#roadmap-alto-nível)

## Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS (temas via CSS variables)
- **Roteamento:** react-router-dom v7
- **Backend (BaaS):** Firebase (Auth + Firestore)
- **Utilidades:** PapaParse (CSV), XLSX (Excel), lucide-react (ícones)
- **Qualidade:** ESLint (TypeScript); *[tests/CI serão adicionados]*

## Arquitetura
- Padrão atual por camadas (`components`, `hooks`, `lib`, `contexts`, `screens`).
- Estados globais:
  - `ProfileContext` para perfil/tema ativo.
  - `ToastContext` para notificações.
- Integração com Firestore via `src/lib/firebase.ts`; queries em hooks dedicados.
- Roteamento protegido: `/login` → `/profile/:profileId[/subprofileId]`.

## Funcionalidades
- **Perfis e Subperfis**: criação, edição, arquivamento e restauração (lixeira).
- **Transações**: receitas e despesas, rótulos, compartilhadas/por subperfil, notas, datas (lançamento, pagamento, vencimento), **séries/parcelas** e edição projetada.
- **Fechamento de mês**: trava modificações do mês encerrado.
- **Importação**: JSON/CSV com pré-visualização e limpeza de dados.
- **Exportação**: JSON/CSV/XLSX por subperfil ou por perfil.
- **Rótulos**: CRUD com arquivamento.
- **Wishlist**: listas (compartilhadas ou por subperfil) + itens com progresso.
- **Temas**: paletas prontas e temas customizados persistidos no perfil.
- **UI**: toasts, modais de confirmação, cards/resumos, indicadores de balanço.

## Modelos de Dados
> Coleções principais no Firestore (resumo)

- `profiles/{profileId}`  
  - `name`, `status: 'active'|'archived'`, `ownerId`, `subprofiles: Subprofile[]`, `savedThemes: CustomTheme[]`, `createdAt`, `updatedAt`
- `transactions/{transactionId}`  
  - `profileId`, `subprofileId?`, `type: 'income'|'expense'`, `planned`, `actual`, `date`, `paymentDate?`, `dueDate?`,  
    `labels: string[]`, `notes?`, `isShared`, `isRecurring`, `seriesId?`, `currentInstallment?`, `installments?`, `closedMonths: string[]`, `createdAt`, `updatedAt`
- `labels/{labelId}`  
  - `profileId`, `name`, `status: 'active'|'archived'`, `createdAt`, `updatedAt`
- `wishlists/{listId}`  
  - `profileId`, `name`, `isShared`, `subprofileId?`, `createdAt`  
  - Subcoleção: `items/{itemId}` → `title`, `amount?`, `isDone`, `notes?`, `createdAt`

> **Observação:** índices e regras de segurança devem ser versionados (ver seção de Segurança).

## Estrutura de Pastas
```

src/
App.tsx
main.tsx
index.css
components/        # UI compartilhada (Card, Modais, Tabela, etc.)
contexts/          # ProfileContext, ToastContext
hooks/             # useProfile, useTransactions, useLabels, ...
lib/               # firebase.ts, export.ts, themes.ts, utils.ts
screens/           # Login, ProfileSelector, Dashboard, Settings, Trash, Wishlist
types/             # Tipos globais (Transaction, Profile, Label, etc.)

````

## Começando
### Pré-requisitos
- Node.js 20+
- Conta Firebase com projeto criado, Firestore e Auth habilitados (método Email/Senha).

### Setup
1. **Instalar dependências**
    ```bash
    npm install
    ````

2. **Variáveis de ambiente**
   Crie um arquivo `.env.local` na raiz com as chaves do Firebase:

   ```dotenv
   VITE_FIREBASE_API_KEY="..."
   VITE_FIREBASE_AUTH_DOMAIN="..."
   VITE_FIREBASE_PROJECT_ID="..."
   VITE_FIREBASE_STORAGE_BUCKET="..."
   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
   VITE_FIREBASE_APP_ID="..."
   ```
3. **Executar em desenvolvimento**

   ```bash
   npm run dev
   ```

   A aplicação abrirá em `http://localhost:5173`.

## Scripts NPM

* `npm run dev` — servidor de desenvolvimento (Vite).
* `npm run build` — build de produção (TypeScript + Vite).
* `npm run preview` — pré-visualização da pasta `dist`.

## Variáveis de Ambiente

Todas lidas via `import.meta.env.*` em `src/lib/firebase.ts`.
**Nunca** faça commit de `.env.local`.

## Segurança (Firestore)

> **Importante:** versionar e aplicar **regras de segurança** antes de publicar.

Exemplo (ilustrativo) — **ajuste ao seu modelo**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(profileId) {
      return isSignedIn() && exists(/databases/$(database)/documents/profiles/$(profileId))
        && get(/databases/$(database)/documents/profiles/$(profileId)).data.ownerId == request.auth.uid;
    }

    match /profiles/{profileId} {
      allow read, write: if isOwner(profileId);
    }

    match /transactions/{txId} {
      allow read, write: if isOwner(resource.data.profileId);
    }

    match /labels/{labelId} {
      allow read, write: if isOwner(resource.data.profileId);
    }

    match /wishlists/{listId} {
      allow read, write: if isOwner(resource.data.profileId);
    }
    match /wishlists/{listId}/items/{itemId} {
      allow read, write: if isOwner(get(/databases/$(database)/documents/wishlists/$(listId)).data.profileId);
    }
  }
}
```

> Recomenda-se usar **Emuladores** do Firebase localmente e adicionar `firestore.rules`/`firestore.indexes.json` ao repositório.

## Deploy (Firebase Hosting)

1. **Build**

   ```bash
   npm run build
   ```
2. **Deploy**

   ```bash
   # requer `firebase-tools` instalado e projeto autenticado
   firebase deploy
   ```

O `firebase.json` já reescreve rotas SPA para `index.html`.

## Roadmap (alto nível)

* Testes (Vitest/RTL + Playwright), CI, Prettier, Husky.
* TanStack Query + camada de repositórios (Zod).
* Regras Firestore versionadas + Emuladores.
* Virtualização de tabelas e code-splitting por rota.
