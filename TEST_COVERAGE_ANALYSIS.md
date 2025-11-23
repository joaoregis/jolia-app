# Análise Completa de Cobertura de Testes - Jolia Finance App

## Status do Projeto
**Data da Análise**: 2025-11-23  
**Testes Atuais**: 39 testes passando  
**Build Status**: ✅ Funcionando

---

## 📊 Estado Atual da Cobertura de Testes

### ✅ Testes Implementados (39 testes)

#### 1. **Lógica de Negócio** (`src/logic/*.test.ts`)
- ✅ [calculations.test.ts](file:///e:/Projects/jolia-app/src/logic/calculations.test.ts) (6 testes)
  - Cálculo de totais (planned/actual)
  - Cálculo de balanço (receita - despesa)
  - Cálculo de diferença (actual - planned)
  - Tratamento de listas vazias

- ✅ [grouping.test.ts](file:///e:/Projects/jolia-app/src/logic/grouping.test.ts) (4 testes)
  - Agrupamento por label
  - Agrupamento por data
  - Agrupamento por tipo
  - Tratamento de labels ausentes

- ✅ [transactionProcessing.test.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.test.ts) (12 testes)
  - Filtragem por termo de busca
  - Filtragem por faixa de valor
  - Filtragem por período
  - Filtragem por labels (único e múltiplos)
  - Filtros combinados
  - Ordenação por data (ascendente/descendente)
  - Ordenação por valor
  - Ordenação por descrição
  - Ordenação por label
  - Ordenação por status de pagamento
  - Ordenação por data de vencimento (com casos especiais)
  - Ordenação por data de pagamento (com casos especiais)

#### 2. **Utilitários** ([src/lib/utils.test.ts](file:///e:/Projects/jolia-app/src/lib/utils.test.ts))
- ✅ 8 testes para formatação de data e moeda

#### 3. **Hooks** (`src/hooks/*.test.ts`)
- ✅ [useDashboardLogic.test.ts](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.test.ts) (4 testes)
  - Inicialização com mês atual
  - Mudança de mês
  - Toggle de seleções
  - Alternância de direção de ordenação

#### 4. **Componentes** (`src/components/**/*.test.tsx`)
- ✅ [TransactionRow.test.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionRow.test.tsx) (3 testes)
  - Renderização de dados
  - Estilização de status pago
  - Callback de toggle pago

#### 5. **Integração** (`src/integration/*.test.tsx`)
- ✅ [dashboard.test.tsx](file:///e:/Projects/jolia-app/src/integration/dashboard.test.tsx) (2 testes)
  - Renderização da tabela com dados
  - Trigger de ordenação ao clicar no header

---

## 🎯 Cenários Críticos Pendentes de Testes

### **Prioridade ALTA** - Funcionalidades Core

#### 1. **Hooks com Interações Firebase** (🔴 CRÍTICO)

##### [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts)
**Impacto**: Mutação de dados financeiros - risco alto de perda de dados
**Complexidade**: Alto - lógica complexa de batching, parcelamento, rateio

**Cenários a Testar**:
- **Criação de Transação Simples**
  - Criar receita única
  - Criar despesa única
  - Validar persistência no Firestore

- **Sistema de Parcelamento**
  - Criar compra parcelada (2-12x)
  - Validar criação de todas as parcelas
  - Validar `seriesId` e `currentInstallment` corretos
  - Validar propagação de datas (incremento mensal)

- **Edição de Transações**
  - Editar apenas a transação atual (`scope='one'`)
  - Editar transação atual e futuras (`scope='future'`)
  - Validar que edições de  séries afetam apenas as transações corretas
  - Validar recálculo de datas em edições de escopo futuro

- **Sistema de Rateio (Apportioning)**
  - Criar transação compartilhada
  - Validar criação de transações filhas por subperfil
  - Validar cálculo de proporções (proporcional vs manual)
  - Editar transação pai e validar recálculo dos filhos
  - Deletar transação pai e validar remoção de filhos

- **Skip/Unskip de Transações Recorrentes**
  - Pular transação para o próximo mês
  - Validar criação automática da transação futura
  - Reativar transação pulada
  - Validar remoção da transação futura gerada

- **Transferência de Transações**
  - Transferir de "Geral" para subperfil
  - Transferir de subperfil para "Geral"
  - Validar conversão de compartilhamento
  - Validar remoção de filhos ao transferir transação compartilhada

- **Deleção de Transações**
  - Deletar transação única
  - Deletar apenas uma parcela (`scope='one'`)
  - Deletar parcela atual e futuras (`scope='future'`)
  - Validar que `seriesQuery` funciona corretamente

##### [useDashboardData.ts](file:///e:/Projects/jolia-app/src/hooks/useDashboardData.ts)
**Impacto**: Fonte central de dados para o dashboard
**Complexidade**: Médio - agregação de múltiplos hooks

**Cenários a Testar**:
- Carregamento inicial com todos os dados (profile, labels, transactions)
- Aplicação de filtros sobre os dados
- Aplicação de ordenação sobre os dados
- Cálculo de totais agregados
- Atualização reativa quando dados mudam no Firestore

##### [useProfile.ts](file:///e:/Projects/jolia-app/src/hooks/useProfile.ts), [useLabels.ts](file:///e:/Projects/jolia-app/src/hooks/useLabels.ts), [useTransactions.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactions.ts), [useAvailableMonths.ts](file:///e:/Projects/jolia-app/src/hooks/useAvailableMonths.ts)
**Impacto**: Leitura de dados do Firebase
**Complexidade**: Baixo - listeners simples

**Cenários a Testar** (para cada hook):
- Estado de loading inicial
- Estado de sucesso com dados
- Estado de erro (falha de conexão)
- Atualização reativa (onSnapshot)
- Cleanup ao desmontar

##### [useSubprofileManager.ts](file:///e:/Projects/jolia-app/src/hooks/useSubprofileManager.ts)
**Impacto**: Gerenciamento de subperfis
**Complexidade**: Médio

**Cenários a Testar**:
- Criar subperfil
- Editar subperfil (nome, tema)
- Arquivar subperfil
- Salvar tema customizado
- Deletar tema customizado

---

#### 2. **Componentes Complexos** (🟡 IMPORTANTE)

##### [DashboardScreen.tsx](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx)
**Impacto**: Componente principal da aplicação
**Complexidade**: Alto - coordena múltiplos componentes e modais

**Cenários a Testar**:
- **Navegação de Mês**
  - Mudar para mês anterior
  - Mudar para próximo mês
  - Validar atualização de dados

- **Gerenciamento de Modais**
  - Abrir/fechar modal de transação
  - Abrir/fechar modal de subperfil
  - Abrir/fechar modal de configurações
  - Abrir/fechar modal de importação/exportação
  - Abrir/fechar modal de fechar mês

- **Ações em Lote**
  - Selecionar múltiplas transações
  - Marcar múltiplas como pagas
  - Deletar múltiplas transações
  - Transferir múltiplas transações

- **Integração com Subperfis**
  - Trocar de aba (Geral ↔ Subperfil)
  - Validar filtro por subperfil
  - Menu de contexto do subperfil

##### [TransactionFilters.tsx](file:///e:/Projects/jolia-app/src/components/TransactionFilters.tsx)
**Impacto**: Interface crítica para filtragem
**Complexidade**: Médio

**Cenários a Testar**:
- Renderizar todos os inputs de filtro
- Filtro por busca textual (debounce)
- Filtro por range de valores (min/max)
- Filtro por range de datas
- Filtro por labels (multi-select)
- Limpar todos os filtros
- Mudança de agrupamento (nenhum, label, data, tipo)

##### [TransactionTable.tsx](file:///e:/Projects/jolia-app/src/components/TransactionTable.tsx)
**Impacto**: Visualização principal dos dados
**Complexidade**: Alto - múltiplos modos de renderização

**Cenários a Testar**:
- **Renderização**
  - Modo desktop (tabela)
  - Modo mobile (cards)
  - Renderização sem dados
  - Renderização com agrupamento (label, data, tipo)

- **Seleção**
  - Selecionar todas as transações
  - Desselecionar todas
  - Seleção parcial

- **Ordenação**
  - Click em cada header de coluna
  - Alternância de direção (asc ↔ desc)
  - Indicador visual de ordenação

##### [TransactionRow.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionRow.tsx) / [TransactionItem.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionItem.tsx)
**Impacto**: Renderização individual de transações
**Complexidade**: Médio

**Cenários a Testar**:
- Edição inline de campos
- Edição de datas (vencimento, pagamento)
- Toggle de status pago
- Indicadores visuais (recorrente, parcelado, rateio, nota)
- Menu de ações (editar, deletar, pular, transferir)
- Labels (adicionar, remover)

##### Modais
**Impacto**: Entrada de dados críticos
**Complexidade**: Médio-Alto

**Cenários a Testar** (para cada modal):
- **[TransactionModal.tsx](file:///e:/Projects/jolia-app/src/components/TransactionModal.tsx)**
  - Modo criação vs edição
  - Validação de campos obrigatórios
  - Toggle de compartilhamento
  - Sistema de parcelamento
  - Seleção de labels
  - Escolha de escopo de edição (uma vs futuras)

- **[SubprofileModal.tsx](file:///e:/Projects/jolia-app/src/components/AddSubprofileModal.tsx)**
  - Criar subperfil
  - Validação de nome
  - Seleção de tema

- **`CloseMonthModal.tsx`**
  - Validação: não pode fechar se houver pendências
  - Confirmação de fechamento
  - Transações recorrentes para próximo mês

---

#### 3. **Lógica de Negócio** (🟢 BOM, mas pode melhorar)

##### [transactionProcessing.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts)
**Status**: Boa cobertura, mas pode adicionar:
- Casos extremos de ordenação (valores nulos, undefined)
- Performance com grandes volumes de dados
- Filtros com caracteres especiais

##### [calculations.ts](file:///e:/Projects/jolia-app/src/logic/calculations.ts) e [grouping.ts](file:///e:/Projects/jolia-app/src/logic/grouping.ts)
**Status**: Muito boa cobertura ✅

---

### **Prioridade MÉDIA** - Funcionalidades Secundárias

#### 4. **Telas Secundárias**

##### [SettingsScreen.tsx](file:///e:/Projects/jolia-app/src/screens/SettingsScreen.tsx)
- Alteração de tema global
- Gerenciamento de temas customizados
- Exportação de dados
- Importação de dados

##### [WishlistScreen.tsx](file:///e:/Projects/jolia-app/src/screens/WishlistScreen.tsx)
- CRUD de listas de desejos
- CRUD de itens da lista
- Marcação de itens como concluídos

##### [TrashScreen.tsx](file:///e:/Projects/jolia-app/src/screens/TrashScreen.tsx)
- Listagem de transações deletadas
- Restauração de transações
- Deleção permanente

##### [ProfileSelector.tsx](file:///e:/Projects/jolia-app/src/screens/ProfileSelector.tsx)
- Criação de perfil
- Seleção de perfil
- Logout

---

### **Prioridade BAIXA** - Componentes Utilitários

#### 5. **Componentes de UI Reutilizáveis**

Componentes já testados implicitamente, mas podem ter testes dedicados:
- [Button](file:///e:/Projects/jolia-app/src/components/DateInput.tsx#18-25), [Input](file:///e:/Projects/jolia-app/src/components/DateInput.tsx#15-50), [Select](file:///e:/Projects/jolia-app/src/components/LabelSelector.tsx#16-78), [Checkbox](file:///e:/Projects/jolia-app/src/components/Checkbox.tsx#3-23), [Tooltip](file:///e:/Projects/jolia-app/src/components/Tooltip.tsx#4-29)
- [Card](file:///e:/Projects/jolia-app/src/components/Card.tsx#5-11), [Modal](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#71-75), `Dropdown`
- [ActionMenu](file:///e:/Projects/jolia-app/src/components/transactions/ActionMenu.tsx#6-47), [LabelSelector](file:///e:/Projects/jolia-app/src/components/LabelSelector.tsx#16-78)
- [EditableCell](file:///e:/Projects/jolia-app/src/components/EditableCell.tsx#17-86), `CurrencyInput`

---

## 🧪 Estratégias de Teste Recomendadas

### **Para Hooks com Firebase**
```typescript
// Usar vi.mock() para mockar Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: vi.fn(),
  // ... etc
}));
```

### **Para Componentes Complexos**
```typescript
// Usar React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';

// Mockar contextos e hooks
vi.mock('../contexts/ProfileContext', () => ({
  useProfileContext: () => ({
    profile: mockProfile,
    setProfile: vi.fn()
  })
}));
```

### **Para Integração**
- Testar fluxos completos (ex: criar transação → verificar na lista → editar → deletar)
- Usar MSW (Mock Service Worker) para simular Firebase
- Testar navegação entre telas

---

## 📝 Gaps de Teste Identificados

### **🔴 Gaps Críticos**
1. **Nenhum teste de mutações no Firebase** - risco altíssimo
2. **Nenhum teste de componentes com formulários complexos**
3. **Nenhum teste de lógica de parcelamento**
4. **Nenhum teste de sistema de rateio**

### **🟡 Gaps Importantes**
1. Testes de hooks de leitura Firebase (loading, error states)
2. Testes de modais (validação, submit)
3. Testes de filtros complexos
4. Testes de navegação mês a mês

### **🟢 Gaps Menores**
1. Testes de componentes UI simples
2. Testes de telas secundárias
3. Testes de edge cases em utilitários

---

## 🎯 Recomendações de Implementação

### **Fase 1: Fundações (2-3 dias)**
1. Configurar mocks do Firebase para testes
2. Criar fixtures de dados de teste reutilizáveis  
3. Configurar MSW se necessário

### **Fase 2: Testes Críticos (1 semana)**
1. [useTransactionMutations](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#8-428) - todos os cenários
2. [useDashboardData](file:///e:/Projects/jolia-app/src/hooks/useDashboardData.ts#5-83) - integração completa
3. [TransactionModal](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#31-35) - validação e lógica

### **Fase 3: Testes Importantes (1 semana)**
1. Outros hooks Firebase
2. [DashboardScreen](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#50-539) - interações principais
3. [TransactionFilters](file:///e:/Projects/jolia-app/src/components/TransactionFilters.tsx#14-148), [TransactionTable](file:///e:/Projects/jolia-app/src/components/TransactionTable.tsx#31-220)

### **Fase 4: Testes Complementares (ongoing)**
1. Telas secundárias
2. Edge cases
3. Performance e otimização

---

## 📊 Métricas de Cobertura Estimadas

| Categoria | Cobertura Atual | Meta Ideal | Prioridade |
|-----------|-----------------|------------|------------|
| Lógica Pura | ~80% | 95% | ✅ Boa |
| Hooks (sem Firebase) | ~30% | 80% | 🟡 Média |
| Hooks (com Firebase) | 0% | 70% | 🔴 Crítica |
| Componentes (simples) | ~15% | 60% | 🟢 Baixa |
| Componentes (complexos) | ~5% | 75% | 🔴 Crítica |
| Integração | ~10% | 50% | 🟡 Média |

---

## 🔧 Ferramentas e Bibliotecas

### **Já Configuradas**
- ✅ Vitest
- ✅ React Testing Library
- ✅ @testing-library/user-event
- ✅ jsdom

### **Recomendadas para Adicionar**
- 🔹 MSW (Mock Service Worker) - para mockar Firebase
- 🔹 @testing-library/react-hooks - para testes isolados de hooks
- 🔹 vitest-mock-extended - mocks mais poderosos

---

## 💡 Observações Finais

1. **Refatoração Bem-Sucedida**: O código já está bem estruturado com lógica isolada em funções puras, facilitando testes.

2. **Arquitetura Testável**: A separação entre:
   - Lógica pura (`src/logic/*`)
   - Hooks de dados (`src/hooks/*`)
   - Componentes de apresentação (`src/components/*`)
   
   ...torna o sistema muito mais testável.

3. **Priorize Testes de Mutação**: Dado que o app gerencia dados financeiros, os testes mais críticos são os que validam operações de escrita (criar, editar, deletar transações).

4. **Mocking Firebase**: Principal desafio técnico. Considere usar a Firebase Emulator Suite para testes de integração mais realistas.

5. **Cobertura Incremental**: Não é necessário 100% de cobertura. Foque nos fluxos críticos e casos extremos.
