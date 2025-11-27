# Especificação da Feature: Mídia Assistida

Esta documentação detalha o plano de implementação para o novo módulo de "Mídia Assistida", focado no rastreamento de filmes e séries para assistir em casal/família.

## 1. Visão Geral
O objetivo é criar um ambiente compartilhado para gerenciar listas de filmes, séries e outros conteúdos de mídia. Diferente da Wishlist, não haverá distinção por subperfil na visualização principal; o ambiente é unificado.

### Principais Funcionalidades:
- **Cadastro de Mídia**: Adicionar filmes/séries com link, provedor (Netflix, Prime, etc.), e quem sugeriu.
- **Tracking**: Marcar como assistido, data (mês/ano) e nota (0-10, visualizada em 5 estrelas).
- **Histórico**: Visualização dedicada do que já foi assistido, filtrável por mês/ano.
- **Dashboard**: Renomeação do atual "Dashboard" para "Controle Financeiro".

## 2. Modelo de Dados (Schema)

Novas interfaces devem ser adicionadas em `src/types/index.ts`.

```typescript
export type MediaProvider = 'Netflix' | 'Prime Video' | 'Disney+' | 'HBO Max' | 'Apple TV+' | 'Outro';

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'other';
  provider: MediaProvider;
  providerDetail?: string; // Para quando for "Outro"
  link?: string;
  suggestedBy: string; // ID do subprofile que sugeriu
  
  // Status
  isWatched: boolean;
  watchedDate?: string; // ISO string, mas apenas Mês/Ano são relevantes para a UI
  rating?: number; // 0 a 10 (armazenado como float/int)
  
  createdAt: any; // serverTimestamp
  profileId: string; // Vinculado ao perfil principal (ambiente compartilhado)
}

// Opcional: Se quisermos agrupar por listas customizadas, mas o requisito pede "ambiente compartilhado".
// A princípio, uma única coleção filtrável por "Assistido" vs "Para Assistir" é suficiente.
```

## 3. Alterações de UI/UX

### 3.1. Menu Lateral (`src/components/Layout.tsx`)
- **Renomear**: Alterar o label do item "Dashboard" para "**Controle Financeiro**".
- **Novo Item**: Adicionar "Mídia Assistida" (ícone sugerido: `Film` ou `Tv` do lucide-react).
  - Rota: `/profile/:profileId/media`

### 3.2. Tela Principal (`src/screens/MediaScreen.tsx`)
- **Layout**:
  - Header com título "Mídia Assistida" e botão "Nova Mídia".
  - **Abas/Filtros**:
    - "Para Assistir" (Default)
    - "Histórico" (Itens já assistidos)
  
- **Visualização "Para Assistir"**:
  - Tabela ou Cards (estilo Masonry similar à Wishlist) mostrando:
    - Título
    - Provedor (Badge/Ícone)
    - Quem sugeriu (Avatar ou Nome do subprofile)
    - Link (botão externo)
    - Ações rápidas: Check "Assistido", Editar, Excluir.

- **Visualização "Histórico"**:
  - Seletor de Mês/Ano (similar ao Dashboard financeiro).
  - Lista de itens assistidos naquele período.
  - Exibição da Nota (Rating) com 5 estrelas (suporte a meia estrela).

### 3.3. Formulário de Cadastro (`src/components/MediaFormModal.tsx`)
- **Campos**:
  - Título (Texto)
  - Tipo (Select: Filme, Série, Outro)
  - Quem Sugeriu (Select: Lista de Subprofiles ativos)
  - Provedor (Select + Input condicional para "Outro")
  - Link (Input URL)
  - Status (Checkbox: "Já assistido?")
    - Se sim: Mostrar campos de Data (Mês/Ano) e Nota (Componente de Estrelas).

## 4. Componentes Novos
1.  `MediaScreen.tsx`: Tela principal.
2.  `MediaFormModal.tsx`: Modal de criação/edição.
3.  `StarRating.tsx`: Componente interativo de 5 estrelas (0-10, step 0.5).
    - Visual: 5 ícones de estrela.
    - Lógica: Click na esquerda da estrela = x.5, direita = x.0.
4.  `hooks/useMediaManager.ts`: Hook para CRUD de mídia (similar ao `useWishlistManager`).

## 5. Plano de Implementação

### Passo 1: Configuração e Tipos
1.  Adicionar interfaces `MediaItem` e `MediaProvider` em `src/types/index.ts`.
2.  Atualizar `src/components/Layout.tsx` para renomear Dashboard e adicionar link para Mídia.
3.  Configurar rota em `src/App.tsx`.

### Passo 2: Hook de Gerenciamento
1.  Criar `src/hooks/useMediaManager.ts`.
    - Implementar `addMedia`, `updateMedia`, `deleteMedia`, `toggleWatched`.
    - Integrar com Firebase (coleção `media_items`).

### Passo 3: Componentes Base
1.  Criar `StarRating.tsx` (reutilizável).
2.  Criar `MediaFormModal.tsx` com validação básica.

### Passo 4: Tela Principal
1.  Criar `src/screens/MediaScreen.tsx`.
2.  Implementar visualização de lista "Para Assistir".
3.  Implementar visualização de "Histórico" com filtro de data.

### Passo 5: Refinamento
1.  Adicionar badges para provedores.
2.  Testar fluxo de "Marcar como assistido" -> deve pedir nota/data se não houver.

## 6. Prompt para Implementação (Futuro)
*Copie este prompt para iniciar a implementação:*

> "Implemente a feature de Mídia Assistida conforme documentado em `docs/specs/media_tracking_feature.md`. Comece criando os tipos em `src/types/index.ts` e o hook `useMediaManager`. Em seguida, configure a rota e o menu, e por fim desenvolva as telas e componentes. Lembre-se de renomear o Dashboard para Controle Financeiro no menu. Utilize boas práticas de programação, garanta estabilidade, funcionalidade de resiliencia. Implemente também testes para garantir que nunca haja regressão."
