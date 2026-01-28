# Jolia App

![Status](https://img.shields.io/badge/status-active-success.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-Private-blue.svg)

**Jolia App** é uma aplicação web progressiva (PWA) de gestão pessoal completa, projetada para gerenciar finanças familiares, listas de desejos e entretenimento em um hub centralizado e esteticamente agradável.

Focada em **multi-perfis** (famílias/grupos), a aplicação permite controle financeiro detalhado com rateio de despesas, acompanhamento de séries e filmes, e customização visual por usuário.

---

## 📑 Índice

- [Jolia App](#jolia-app)
  - [📑 Índice](#-índice)
  - [✨ Funcionalidades Principais](#-funcionalidades-principais)
    - [💰 Gestão Financeira](#-gestão-financeira)
    - [📺 Entretenimento (Media Tracker)](#-entretenimento-media-tracker)
    - [🎁 Listas de Desejos (Wishlist)](#-listas-de-desejos-wishlist)
    - [⚙️ Sistema e Configurações](#️-sistema-e-configurações)
  - [🚀 Tech Stack](#-tech-stack)
  - [📂 Estrutura do Projeto](#-estrutura-do-projeto)
  - [📚 Documentação](#-documentação)
  - [🛠️ Instalação e Configuração](#️-instalação-e-configuração)
    - [Pré-requisitos](#pré-requisitos)
    - [Passo a Passo](#passo-a-passo)
    - [Variáveis de Ambiente (.env)](#variáveis-de-ambiente-env)
  - [📜 Scripts Disponíveis](#-scripts-disponíveis)
  - [☁️ Deploy](#️-deploy)
  - [🤝 Contribuição e Feedback](#-contribuição-e-feedback)

---

## ✨ Funcionalidades Principais

### 💰 Gestão Financeira
O núcleo do sistema, permitindo controle rigoroso e colaborativo.
- **Transações**: Receitas e Despesas com categorização (Labels).
- **Parcelamentos Inteligentes**: Suporte a séries de pagamentos (Ex: "Compra TV 1/10") com projeção futura.
- **Multi-Subperfis**: Cada membro da família tem seu subperfil.
- **Métodos de Rateio**:
  - *Proporcional*: Divisão automática baseada na renda de cada membro.
  - *Manual*: Definição valor-a-valor.
  - *Porcentagem*: Divisão fixa percentual.
- **Fechamento de Mês**: Trava de segurança para impedir edições em meses contábeis encerrados.
- **Filtros Avançados**: Por data, valor, etiqueta e tipo.
- **Importação/Exportação**: Suporte robusto para CSV, JSON e Excel com validação de dados.

### 📺 Entretenimento (Media Tracker)
Um "Letterboxd" privado para a família.
- **Catálogo**: Adicione Filmes, Séries, Documentários e Vídeos.
- **Status**: *To Watch* (Para Assistir), *In Progress* (Em Progresso) e *Watched* (Assistido).
- **Histórico**: Timeline do que foi assistido mês a mês.
- **Avaliações**: Sistema de rating (0-10) individual por membro da família.
- **Providers**: Indicação de onde assistir (Netflix, Prime, Disney+, etc.).
- **Gestão de Temporadas**: Controle granular de episódios e temporadas assistidas.

### 🎁 Listas de Desejos (Wishlist)
Gerenciamento de compras futuras e sonhos de consumo.
- **Listas Categorizadas**: Crie múltiplas listas (Ex: "Supermercado", "Tech", "Viagem").
- **Itens**: Adicione itens com preço estimado, links e notas.
- **Status de Conclusão**: Marque itens como comprados/concluídos.
- **Visualização de Progresso**: Barras de progresso financeiro e de quantidade por lista.

### ⚙️ Sistema e Configurações
- **Temas Dinâmicos**: Troca de temas em tempo real (Cores, Fontes, Bordas).
- **Customização**: O usuário pode criar e salvar seus próprios temas.
- **Feedback Integrado**: Sistema interno para reportar Bugs, Ideias e Débitos Técnicos diretamente na interface (Context Aware - sabe em qual tela você está).
- **Notificações**: Central de avisos para feedbacks e atualizações.

---

## 🚀 Tech Stack

O projeto utiliza as tecnologias mais modernas do ecossistema React para garantir performance, tipagem e manutenibilidade.

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | [React 18](https://react.dev/) | Biblioteca de UI baseada em componentes funcionais e Hooks. |
| **Build Tool** | [Vite](https://vitejs.dev/) | Bundler ultrarrápido com HMR (Hot Module Replacement) instantâneo. |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | Superset JS para tipagem estática e segurança de código. |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) | Framework utility-first com suporte a variáveis CSS para temas. |
| **Animações** | [Framer Motion](https://www.framer.com/motion/) | Biblioteca líder para animações declarativas e gestos. |
| **Roteamento** | [React Router v7](https://reactrouter.com/) | Gerenciamento de rotas client-side. |
| **Data/Utils** | [Date-fns](https://date-fns.org/) | Manipulação imutável e leve de datas. |
| **Backend (BaaS)** | [Firebase](https://firebase.google.com/) | Auth, Firestore (NoSQL Database) e Hosting. |
| **Testes** | [Vitest](https://vitest.dev/) | Runner de testes unitários compatível com Jest. |

---

## 📂 Estrutura do Projeto

```bash
src/
├── components/     # UI Kits (Cards, Modais, Inputs, Tabelas)
├── contexts/       # Global State (Auth, Profile, Toast, Theme)
├── hooks/          # Custom Hooks (UseTransactions, UseMedia, etc.)
├── lib/            # Configurações (Firebase, Utils, Helpers)
├── screens/        # Páginas da aplicação (Dashboard, Wishlist, Settings)
├── types/          # Definições de Tipos TypeScript (Interfaces Globais)
└── App.tsx         # Root Component e Configuração de Rotas
docs/
├── Database Docs.md # Documentação completa do Schema do Firestore
└── Onboarding.md    # Guia para novos desenvolvedores
```

---

## 📚 Documentação

Para aprofundamento técnico, consulte a pasta `/docs`:

- **[Onboarding](./docs/Onboarding.md)**: Visão geral para desenvolvedores iniciantes no projeto.
- **[Database Specs](./docs/Database%20Docs.md)**: Detalhamento completo das coleções, campos e relacionamentos do Firestore.

---

## 🛠️ Instalação e Configuração

### Pré-requisitos
- **Node.js**: Versão 18 ou superior.
- **Gerenciador de Pacotes**: NPM ou Yarn.
- **Firebase CLI**: (Opcional, para deploy) `npm install -g firebase-tools`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/jolia-app.git
   cd jolia-app
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto seguindo o exemplo abaixo.

### Variáveis de Ambiente (.env)

Você precisa de um projeto Firebase configurado. Obtenha estas chaves no console do Firebase.

```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

4. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:5173`

---

## 📜 Scripts Disponíveis

No terminal, você pode executar:

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Compila o projeto para produção na pasta `dist`.
- `npm run preview`: Visualiza o build de produção localmente.
- `npm run test`: Executa a suíte de testes unitários com Vitest.
- `make deploy`: (Windows/Linux) Atalho para rodar testes, build e deploy.

---

## ☁️ Deploy

O deploy é automatizado via Firebase Hosting.

1. Faça login no Firebase CLI:
   ```bash
   firebase login
   ```

2. Execute o build e deploy:
   ```bash
   # Opção 1: Manual
   npm run build
   firebase deploy

   # Opção 2: Via Makefile (Recomendado)
   make deploy
   ```

---

## 🤝 Contribuição e Feedback

O projeto conta com um sistema interno de feedback. Se você encontrar um bug ou tiver uma ideia enquanto usa o app, clique no ícone de **Prancheta** no cabeçalho.

Para contribuições de código:
1. Siga os padrões de commit (Conventional Commits).
2. Sempre rode `npm run test` antes de enviar PRs.
3. Mantenha a tipagem do TypeScript estrita ("no-any").

---

**Desenvolvido por João Regis**
