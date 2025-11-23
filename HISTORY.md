# Jolia Finance App - AI Agent Knowledge Base

> **Purpose**: This document contains all critical information an AI agent needs to effectively work on the Jolia Finance App. It serves as a comprehensive onboarding guide for future development, bug fixes, and feature implementations.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Code Organization](#architecture--code-organization)
3. [Tech Stack](#tech-stack)
4. [Data Model & Firebase Structure](#data-model--firebase-structure)
5. [Core Business Logic](#core-business-logic)
6. [Component Reference](#component-reference)
7. [Hook Reference](#hook-reference)
8. [Common Patterns & Conventions](#common-patterns--conventions)
9. [Testing Strategy](#testing-strategy)
10. [Known Issues & Corner Cases](#known-issues--corner-cases)
11. [Development Workflow](#development-workflow)
12. [Common Tasks & Guides](#common-tasks--guides)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is Jolia Finance App?
Jolia is a **personal/family finance management application** built with React + Firebase. It allows users to:
- Track income and expenses across multiple months
- Organize transactions by labels and subprofiles (family members)
- Handle recurring transactions and installment purchases
- Share expenses across family members (apportionment/rateio)
- Close months to prevent accidental edits
- Import/Export data in CSV/Excel formats

### Key Concepts
1. **Profile**: The main user account (contains subprofiles, labels, closed months)
2. **Subprofile**: Family members or budget categories (e.g., "João", "Maria", "Pet")
3. **Transaction**: A single financial record (income or expense)
4. **Label**: Category/tag for transactions (e.g., "Food", "Salary", "Rent")
5. **Parcelamento**: Installment purchases (1 purchase → N monthly transactions)
6. **Rateio**: Shared expenses distributed proportionally across subprofiles
7. **Closed Month**: A month that has been locked for editing (to preserve historical data)

---

## 🏗️ Architecture & Code Organization

### Directory Structure
```
src/
├── components/          # React components
│   ├── transactions/    # Transaction-specific components
│   │   ├── ActionMenu.tsx
│   │   ├── TransactionItem.tsx (mobile card view)
│   │   └── TransactionRow.tsx (desktop table row)
│   ├── TransactionFilters.tsx
│   ├── TransactionTable.tsx
│   ├── TransactionModal.tsx
│   ├── TransactionForm.tsx
│   └── [40+ other UI components]
│
├── screens/            # Page-level components
│   ├── DashboardScreen.tsx (main screen)
│   ├── LoginScreen.tsx
│   ├── ProfileSelector.tsx
│   ├── SettingsScreen.tsx
│   ├── TrashScreen.tsx
│   └── WishlistScreen.tsx
│
├── hooks/              # Custom React hooks
│   ├── useDashboardData.ts      # Fetches & aggregates all dashboard data
│   ├── useDashboardLogic.ts     # Dashboard state & business logic
│   ├── useDashboardState.ts     # Modal/UI state management
│   ├── useTransactionMutations.ts # All transaction CRUD operations
│   ├── useProfile.ts            # Fetches profile data
│   ├── useLabels.ts             # Fetches labels
│   ├── useTransactions.ts       # Fetches transactions for a month
│   ├── useAvailableMonths.ts    # Fetches all months with data
│   └── useSubprofileManager.ts  # Subprofile CRUD operations
│
├── logic/              # Pure functions (business logic)
│   ├── calculations.ts          # Financial calculations
│   ├── grouping.ts              # Transaction grouping
│   ├── transactionProcessing.ts # Filtering & sorting
│   └── [tests for each]
│
├── contexts/           # React contexts
│   ├── ProfileContext.tsx       # Current profile state
│   └── ToastContext.tsx         # Toast notifications
│
├── lib/                # Utilities & configuration
│   ├── firebase.ts              # Firebase initialization
│   ├── utils.ts                 # Utility functions
│   ├── themes.ts                # Theme definitions
│   └── dateUtils.ts             # Date manipulation helpers
│
├── types/              # TypeScript type definitions
│   └── index.ts                 # All type definitions
│
├── integration/        # Integration tests
│   └── dashboard.test.tsx
│
└── test/              # Test utilities
    └── setup.ts
```

### Architecture Principles
1. **Separation of Concerns**:
   - **Pure functions** in `src/logic/*` (no side effects, easy to test)
   - **Hooks** for data fetching and state management
   - **Components** focus on presentation
   - **Screens** compose components and hooks

2. **Data Flow**:
   ```
   Firebase → Hooks → Screens → Components
                ↓
         Pure Functions (calculations, filtering, sorting)
   ```

3. **State Management**:
   - **Local component state**: useState for simple UI state
   - **Custom hooks**: useDashboardState, useDashboardLogic for complex state
   - **Context**: ProfileContext for app-wide profile data
   - **Firebase real-time**: onSnapshot for reactive data

---

## 🛠️ Tech Stack

### Core
- **React 18** (with TypeScript)
- **Vite** (build tool, dev server)
- **React Router 7** (navigation)
- **Firebase 11** (Firestore database, Authentication)

### Styling
- **Tailwind CSS 3** (utility-first CSS)
- **CSS Variables** (for theming)

### Testing
- **Vitest 4** (test runner)
- **React Testing Library** (component testing)
- **@testing-library/user-event** (user interaction simulation)
- **jsdom** (DOM environment for tests)

### Utilities
- **lucide-react** (icons)
- **papaparse** (CSV parsing)
- **xlsx** (Excel import/export)
- **uuid** (unique ID generation)

### Development Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm test         # Run tests in watch mode
```

---

## 🗄️ Data Model & Firebase Structure

### Firestore Collections

#### `profiles`
```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Profile name
  icon: string;            // Emoji icon
  status: 'active' | 'archived';
  subprofiles: Subprofile[]; // Nested array (not subcollection)
  closedMonths?: string[]; // Array of 'YYYY-MM' strings
  apportionmentMethod?: 'proportional' | 'manual';
  savedThemes?: CustomTheme[]; // User-saved color themes
}
```

#### `labels`
```typescript
{
  id: string;
  profileId: string;       // Foreign key to profile
  name: string;
  color: string;           // Hex color
  status: 'active' | 'archived';
  createdAt: Timestamp;
}
```

#### `transactions`
```typescript
{
  id: string;
  profileId: string;
  subprofileId?: string;   // If tied to a subprofile
  description: string;
  type: 'income' | 'expense';
  date: string;            // 'YYYY-MM-DD' (transaction month)
  planned: number;         // Planned amount
  actual: number;          // Actual amount
  paid?: boolean;
  paymentDate?: string;    // 'YYYY-MM-DD'
  dueDate?: string;        // 'YYYY-MM-DD' (for expenses)
  labelIds?: string[];     // Array of label IDs
  isShared?: boolean;      // True if rateio (apportioned)
  isRecurring?: boolean;   // True for recurring transactions
  isApportioned?: boolean; // True for child transactions of a rateio
  parentId?: string;       // Parent transaction ID (for rateio children)
  
  // For installment purchases (parcelamento)
  seriesId?: string;       // Groups all installments together
  currentInstallment?: number;
  totalInstallments?: number;
  originalDate?: string;   // Original purchase date
  
  // For skip/unskip feature
  skippedInMonths?: string[]; // Array of 'YYYY-MM' strings
  generatedFutureTransactionId?: string;
  
  notes?: string;
  createdAt?: Timestamp;
}
```

### Key Relationships
1. **Profile → Labels**: One-to-many (via `profileId`)
2. **Profile → Transactions**: One-to-many (via `profileId`)
3. **Subprofile → Transactions**: One-to-many (via `subprofileId`)
4. **Transaction → Labels**: Many-to-many (via `labelIds` array)
5. **Parent Transaction → Child Transactions**: One-to-many (rateio, via `parentId`)
6. **Series → Installments**: One-to-many (parcelamento, via `seriesId`)

---

## 💼 Core Business Logic

### 1. Parcelamento (Installment Purchases)
**What**: Split a purchase into N monthly installments

**How it works**:
1. User creates a transaction with `isInstallmentPurchase: true` and `totalInstallments: N`
2. System generates N transactions:
   - All share the same `seriesId` (UUID)
   - Each has `currentInstallment: 1..N`
   - Dates are incremented monthly from the original date
   - Description includes " (1/N)", " (2/N)", etc.
   
**Edit/Delete behavior**:
- **Edit scope = 'one'**: Only edits the current installment
- **Edit scope = 'future'**: Edits current + all future installments in the series

**Code**: [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts) → [handleSaveTransaction](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#10-187), [performDelete](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#270-298)

---

### 2. Rateio (Shared Expenses)
**What**: Distribute a "Geral" (shared) expense proportionally across subprofiles

**How it works**:
1. User creates a transaction with `isShared: true` in the "Geral" tab
2. System calculates each subprofile's income proportion:
   ```
   Subprofile A income: 2000
   Subprofile B income: 3000
   Total income: 5000
   
   A's proportion: 2000/5000 = 0.4 (40%)
   B's proportion: 3000/5000 = 0.6 (60%)
   ```
3. System creates **child transactions** for each subprofile:
   - `isApportioned: true`
   - `parentId: <parent transaction ID>`
   - `actual = parent.actual * proportion`
   - Description prefixed with "[Rateio]"

**Edit/Delete behavior**:
- Editing the parent → recalculates and recreates all children
- Deleting the parent → deletes all children
- Children cannot be edited directly

**Code**: [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts) → [recalculateApportionedChildren](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#188-201), [prepareApportionedChild](file:///e:/Projects/jolia-app/src/lib/transactionUtils.ts#70-95)

---

### 3. Skip/Unskip (Recurring Transactions)
**What**: Skip a recurring transaction for one month without deleting it

**How it works**:
1. User clicks "Skip" on a recurring transaction
2. System:
   - Adds current month to `skippedInMonths` array
   - Creates next month's transaction immediately
   - Stores reference in `generatedFutureTransactionId`

3. To unskip:
   - Removes month from `skippedInMonths`
   - Deletes the auto-generated future transaction

**Code**: [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts) → [handleSkipTransaction](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#356-392), [handleUnskipTransaction](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#393-411)

---

### 4. Transfer Between Tabs
**What**: Move a transaction from "Geral" to a subprofile or vice versa

**Scenarios**:
- **Geral (shared) → Subprofile**: Deletes all child transactions, assigns to subprofile
- **Geral (not shared) → Subprofile**: Simple update of `subprofileId`
- **Subprofile → Geral (shared)**: Creates child transactions for rateio
- **Subprofile → Geral (not shared)**: Removes `subprofileId`

**Code**: [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts) → [handleConfirmTransfer](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#299-355)

---

### 5. Close Month
**What**: Lock a month to prevent accidental edits

**How it works**:
1. User clicks "Close Month" (only if all transactions are marked as paid)
2. System adds `'YYYY-MM'` to profile's `closedMonths` array
3. UI disables all edit buttons for that month
4. Recurring transactions still generate future months

**Code**: `CloseMonthModal.tsx`, checked throughout UI components

---

### 6. Filtering & Sorting
**Filtering** (pure function):
- By search term (description, case-insensitive)
- By amount range (min/max)
- By date range (start/end)
- By label IDs (OR logic: transaction matches ANY selected label)
- Combined filters (AND logic across different filter types)

**Sorting** (pure function):
- By: description, date, planned, actual, labelIds, paid, dueDate, paymentDate
- Direction: ascending, descending
- Label sorting: uses the FIRST label's name

**Code**: [src/logic/transactionProcessing.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts)

---

### 7. Grouping
**Pure function** that groups transactions by:
- **Label**: Groups by first label (or "Sem Rótulo")
- **Date**: Groups by day (DD/MM/YYYY)
- **Type**: Groups by Income/Expense
- **None**: Returns null (no grouping)

**Code**: [src/logic/grouping.ts](file:///e:/Projects/jolia-app/src/logic/grouping.ts)

---

## 📦 Component Reference

### Critical Components

#### [DashboardScreen.tsx](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx)
**Purpose**: Main application screen  
**Responsibilities**:
- Coordinates all dashboard hooks (data, state, logic)
- Manages modal visibility
- Handles bulk actions (select all, delete multiple)
- Renders tabs for Geral + each subprofile

**Key State**:
- `activeTab`: Current subprofile or 'geral'
- `currentMonth`: Selected month (Date object)

**Dependencies**: [useDashboardData](file:///e:/Projects/jolia-app/src/hooks/useDashboardData.ts#5-83), [useDashboardLogic](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.ts#6-130), [useDashboardState](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#5-112), [useTransactionMutations](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#8-428)

---

#### [TransactionTable.tsx](file:///e:/Projects/jolia-app/src/components/TransactionTable.tsx)
**Purpose**: Renders the transaction list as a table (desktop) or cards (mobile)  
**Key Features**:
- Responsive: `hidden md:block` for table, `md:hidden` for cards
- Supports grouping (renders group headers)
- Bulk selection with checkboxes
- Sortable column headers
- Footer with totals

**Props**:
- `data`: Transaction[]
- `labels`: Label[]
- `type`: 'income' | 'expense'
- `isClosed`: boolean (disables editing)
- `sortConfig`: { key, direction }
- `requestSort`: (key) => void
- [actions](file:///e:/Projects/jolia-app/src/hooks/useTransactions.ts#7-41): TransactionActions
- `selectedIds`: Set<string>
- `groupBy`: 'none' | 'label' | 'date' | 'type'

---

#### [TransactionRow.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionRow.tsx) (desktop) / [TransactionItem.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionItem.tsx) (mobile)
**Purpose**: Individual transaction rendering  
**Key Features**:
- Inline editing for description, planned, actual
- Inline date pickers for dueDate, paymentDate
- Label badges with remove button
- Action menu (edit, delete, skip, transfer)
- Indicators for recurring, installment, rateio, notes

**Important**: These are **presentational components** - all logic is in parent or hooks

---

#### [TransactionFilters.tsx](file:///e:/Projects/jolia-app/src/components/TransactionFilters.tsx)
**Purpose**: Filter bar for search, amount range, date range, labels, grouping  
**Key Features**:
- Search input with debounce (500ms)
- Min/Max amount inputs
- Start/End date inputs
- Multi-select label dropdown
- "Group By" dropdown
- "Clear Filters" button

**Props**:
- `filters`: FilterConfig
- `onFilterChange`: (filters) => void
- `labels`: Label[]
- `groupBy`: GroupBy
- `onGroupByChange`: (value) => void

---

#### [TransactionModal.tsx](file:///e:/Projects/jolia-app/src/components/TransactionModal.tsx) / [TransactionForm.tsx](file:///e:/Projects/jolia-app/src/components/TransactionForm.tsx)
**Purpose**: Create or edit a transaction  
**Key Features**:
- Toggles: isShared, isRecurring, isInstallmentPurchase
- Installment count selector (2-12)
- Label multi-select
- Date pickers with validation
- Scope selector for editing series ('one' vs 'future')

**Validation**:
- Description required
- Planned/Actual must be >= 0
- Date required

---

### Modal Components

| Modal | Purpose | Key Props |
|-------|---------|-----------|
| `DeleteConfirmationModal` | Confirm transaction deletion | `transaction`, [onConfirm](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#347-359) |
| `SeriesEditConfirmationModal` | Choose scope for editing installments | [onConfirm(scope)](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#347-359) |
| `TransactionTransferModal` | Transfer transaction between tabs | `transaction`, `subprofiles` |
| `CloseMonthModal` | Close current month | `currentMonth`, `transactions` |
| `AddSubprofileModal` | Create new subprofile | [onSave(name, themeId)](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#396-404) |
| [EditSubprofileModal](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#41-45) | Edit subprofile (name, theme) | `subprofile`, [onSave](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#396-404) |
| `SettingsModal` | App settings (theme, export, import) | N/A |
| `ImportModal` | Import CSV/Excel | `currentMonth`, `existingLabels` |
| `ExportModal` | Export data to CSV/Excel | `transactions`, `labels` |

---

## 🪝 Hook Reference

### Data Fetching Hooks

#### [useProfile(profileId?: string)](file:///e:/Projects/jolia-app/src/hooks/useProfile.ts#8-39)
**Returns**: `{ profile, loading }`  
**Behavior**: Real-time listener on `profiles/{profileId}`  
**Error handling**: Navigates to `/` if profile not found

#### [useLabels(profileId?: string)](file:///e:/Projects/jolia-app/src/hooks/useLabels.ts#8-39)
**Returns**: `{ labels, loading }`  
**Behavior**: Real-time listener on `labels` where `profileId == profileId`  
**Sorted by**: `createdAt` ascending

#### [useTransactions(profileId?: string, currentMonth?: Date)](file:///e:/Projects/jolia-app/src/hooks/useTransactions.ts#7-41)
**Returns**: `{ transactions, loading }`  
**Behavior**: Real-time listener on `transactions` for the given month  
**Query**: `where('profileId', '==', profileId) && where('date', '>=', startOfMonth) && where('date', '<=', endOfMonth)`

#### [useAvailableMonths(profileId?: string)](file:///e:/Projects/jolia-app/src/hooks/useAvailableMonths.ts#6-49)
**Returns**: `{ availableMonths, loading }`  
**Behavior**: Fetches all transactions, extracts unique months  
**Format**: Returns array of 'YYYY-MM' strings, sorted chronologically

---

### Aggregation Hooks

#### [useDashboardData(profile, currentMonth)](file:///e:/Projects/jolia-app/src/hooks/useDashboardData.ts#5-83)
**Returns**:
```typescript
{
  transactions, labels, loading,
  
  // Filtered & sorted data
  filteredIncomeTransactions,
  filteredExpenseTransactions,
  filteredIgnoredTransactions,
  
  // Aggregated totals
  incomeTotals: { planned, actual },
  expenseTotals: { planned, actual },
  balance: { planned, actual },
  
  // Tab-specific data
  activeTabIncomeTransactions,
  activeTabExpenseTransactions,
  activeTabIgnoredTransactions,
  activeTabIncomeTotals,
  activeTabExpenseTotals,
  activeTabBalance,
  
  // Subprofile revenue proportions (for rateio)
  subprofileRevenueProportions
}
```

**Logic**:
1. Fetches profile, labels, transactions
2. Applies filters (from [useDashboardLogic](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.ts#6-130))
3. Applies sorting (from [useDashboardLogic](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.ts#6-130))
4. Calculates totals using [src/logic/calculations.ts](file:///e:/Projects/jolia-app/src/logic/calculations.ts)
5. Filters by active tab (Geral or subprofile)

---

### State Management Hooks

#### [useDashboardLogic(profile, availableMonths, isCurrentMonthClosed)](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.ts#6-130)
**Returns**:
```typescript
{
  state: {
    currentMonth,
    sortConfig,
    filterConfig,
    groupBy,
    selectedIncomeIds,
    selectedExpenseIds,
    selectedIgnoredIds
  },
  
  handlers: {
    changeMonth(offset),
    requestSort(key),
    handleFilterChange(filters),
    createSelectionHandler(setter)
  },
  
  setters: {
    setSortConfig,
    setFilterConfig,
    setGroupBy,
    setSelectedIncomeIds,
    setSelectedExpenseIds,
    setSelectedIgnoredIds
  }
}
```

**Logic**:
- Manages sort/filter/group state
- Persists sort config to localStorage
- Initializes to first open month
- Provides helper functions for month navigation

---

#### [useDashboardState()](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#5-112)
**Returns**:
```typescript
{
  modals: {
    transaction: { isOpen, open, close, initialValues },
    addSubprofile: { isOpen, open, close },
    editSubprofile: { isOpen, open, close, subprofileToEdit },
    archiveSubprofile: { isOpen, open, close, subprofileToArchive },
    deleteTransaction: { isOpen, open, close, transactionToDelete },
    transfer: { isOpen, open, close, transactionToTransfer },
    seriesAction: { isOpen, actionType, transaction, open, close },
    import: { isOpen, open, close },
    export: { isOpen, open, close },
    closeMonth: { isOpen, open, close },
    settings: { isOpen, open, close }
  },
  
  editScope: { state, set },
  
  contextMenu: { state, open, close }
}
```

**Logic**: Centralized modal state management

---

### Mutation Hooks

#### [useTransactionMutations(profile)](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#8-428)
**Returns**:
```typescript
{
  handleSaveTransaction(data, id?, subprofileRevenueProportions?, activeTab?, editScope?),
  handleFieldUpdate(id, field, value, scope?),
  performDelete(transaction, scope?),
  handleConfirmTransfer(transactionId, destination, subprofileRevenueProportions?),
  handleSkipTransaction(transaction, currentMonthString),
  handleUnskipTransaction(transaction, currentMonthString)
}
```

**Key Patterns**:
- Uses Firestore `writeBatch()` for atomic operations
- Handles parcelamento (creates N transactions)
- Handles rateio (creates child transactions)
- Handles series edits (scope = 'one' vs 'future')

**Important**: All mutations use batched writes for consistency

---

#### [useSubprofileManager(profile)](file:///e:/Projects/jolia-app/src/hooks/useSubprofileManager.ts#6-69)
**Returns**:
```typescript
{
  handleCreateSubprofile(name, themeId),
  handleUpdateSubprofile(id, newName, newThemeId, customTheme?),
  handleArchiveSubprofile(subprofile),
  handleSaveCustomTheme(name, variables),
  handleDeleteCustomTheme(themeId)
}
```

**Note**: Subprofiles are stored as an **array** in the profile document, not a subcollection

---

## 🎨 Common Patterns & Conventions

### 1. Component Naming
- **Screens**: `*Screen.tsx` (e.g., [DashboardScreen.tsx](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx))
- **Modals**: `*Modal.tsx` (e.g., [TransactionModal.tsx](file:///e:/Projects/jolia-app/src/components/TransactionModal.tsx))
- **Forms**: `*Form.tsx` (e.g., [TransactionForm.tsx](file:///e:/Projects/jolia-app/src/components/TransactionForm.tsx))
- **UI Components**: PascalCase (e.g., [Card.tsx](file:///e:/Projects/jolia-app/src/components/Card.tsx), `Button.tsx`)

### 2. Hook Naming
- **Data fetching**: `use<Entity>` (e.g., [useProfile](file:///e:/Projects/jolia-app/src/hooks/useProfile.ts#8-39), [useLabels](file:///e:/Projects/jolia-app/src/hooks/useLabels.ts#8-39))
- **State management**: `use<Feature>State` (e.g., [useDashboardState](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts#5-112))
- **Business logic**: `use<Feature>Logic` (e.g., [useDashboardLogic](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.ts#6-130))
- **Mutations**: `use<Feature>Mutations` (e.g., [useTransactionMutations](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#8-428))

### 3. File Organization
- **One component per file** (except for very small helper components)
- **Co-locate tests** with the file they test (e.g., [utils.ts](file:///e:/Projects/jolia-app/src/lib/utils.ts) → [utils.test.ts](file:///e:/Projects/jolia-app/src/lib/utils.test.ts))
- **Group related components** in subdirectories (e.g., `components/transactions/`)

### 4. TypeScript Patterns
```typescript
// Always define prop types
interface ComponentProps {
  data: Transaction[];
  onSave: (data: Transaction) => void;
}

// Use existing types from src/types/index.ts
import { Transaction, Label, Profile } from '../types';

// Avoid 'any' - use 'unknown' or proper types
```

### 5. Firebase Patterns
```typescript
// Real-time listener
useEffect(() => {
  if (!profileId) return;
  
  const q = query(
    collection(db, 'labels'),
    where('profileId', '==', profileId)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Label[];
    setLabels(data);
  });
  
  return () => unsubscribe(); // Always cleanup!
}, [profileId]);

// Batched writes for multiple operations
const batch = writeBatch(db);
batch.set(docRef1, data1);
batch.update(docRef2, data2);
batch.delete(docRef3);
await batch.commit();
```

### 6. Date Handling
```typescript
// Always use ISO date strings in Firestore
const dateString = '2023-10-15'; // YYYY-MM-DD

// Convert to Date for display
const date = new Date(dateString + 'T00:00:00');

// Use utils
import { formatShortDate, formatFullDate, addMonths } from '../lib/utils';
formatShortDate('2023-10-15'); // → "15/10"
formatFullDate('2023-10-15'); // → "15/10/2023"
addMonths(new Date('2023-01-15'), 1); // → Feb 15, 2023
```

### 7. Tailwind CSS Classes
```typescript
// Responsive classes (mobile-first)
className="text-sm md:text-base lg:text-lg"

// Theme variables (see src/lib/themes.ts)
className="bg-background text-text-primary"
className="border-border hover:bg-accent"

// Common patterns
className="flex items-center gap-2"
className="grid grid-cols-1 md:grid-cols-2"
className="p-4 rounded-lg shadow-md"
```

---

## 🧪 Testing Strategy

### Current Test Coverage (39 tests passing)

#### Unit Tests
- ✅ [calculations.ts](file:///e:/Projects/jolia-app/src/logic/calculations.ts) (6 tests)
- ✅ [grouping.ts](file:///e:/Projects/jolia-app/src/logic/grouping.ts) (4 tests)
- ✅ [transactionProcessing.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts) (12 tests)
- ✅ [utils.ts](file:///e:/Projects/jolia-app/src/lib/utils.ts) (8 tests)

#### Hook Tests
- ✅ [useDashboardLogic.test.ts](file:///e:/Projects/jolia-app/src/hooks/useDashboardLogic.test.ts) (4 tests)

#### Component Tests
- ✅ [TransactionRow.test.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionRow.test.tsx) (3 tests)

#### Integration Tests
- ✅ [dashboard.test.tsx](file:///e:/Projects/jolia-app/src/integration/dashboard.test.tsx) (2 tests)

### Testing Patterns

#### Unit Tests (Pure Functions)
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotals } from './calculations';

describe('calculateTotals', () => {
  it('should calculate correct totals', () => {
    const transactions = [
      { planned: 100, actual: 90 },
      { planned: 200, actual: 210 }
    ];
    
    const result = calculateTotals(transactions);
    
    expect(result).toEqual({ planned: 300, actual: 300 });
  });
});
```

#### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboardLogic } from './useDashboardLogic';

it('should change month correctly', () => {
  const { result } = renderHook(() => 
    useDashboardLogic(mockProfile, mockMonths, false)
  );
  
  act(() => {
    result.current.handlers.changeMonth(1);
  });
  
  expect(result.current.state.currentMonth.getMonth()).toBe(1);
});
```

#### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should call onTogglePaid when clicked', async () => {
  const user = userEvent.setup();
  const mockToggle = vi.fn();
  
  render(<TransactionRow {...props} actions={{ onTogglePaid: mockToggle }} />);
  
  const button = screen.getByText('Sim');
  await user.click(button);
  
  expect(mockToggle).toHaveBeenCalled();
});
```

### Critical Gaps (see TEST_COVERAGE_ANALYSIS.md)
1. 🔴 **No tests for Firebase mutations** (useTransactionMutations, etc.)
2. 🔴 **No tests for complex modals** (TransactionModal, etc.)
3. 🟡 **Limited component tests** (only TransactionRow tested)
4. 🟡 **Limited integration tests** (only 2 tests)

---

## ⚠️ Known Issues & Corner Cases

### 1. Parcelamento Edge Cases
- **Issue**: Editing installment dates can cause confusion
- **Solution**: Always use `editScope` correctly
  - `'one'`: Edit only this installment
  - `'future'`: Edit this + all future installments

### 2. Rateio Calculation
- **Issue**: If total income is 0, proportions are equal (1/N)
- **Code**: [recalculateApportionedChildren](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#188-201) in [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts)

### 3. Closed Month Checks
- **Issue**: Must check `isClosed` before ANY mutation
- **Pattern**: Every edit button should be disabled when `isClosed`
```typescript
disabled={isClosed || isApportioned || isInstallment}
```

### 4. Date Timezone Issues
- **Issue**: JavaScript Date() can have timezone issues
- **Solution**: Always append 'T00:00:00' when creating Date from YYYY-MM-DD
```typescript
const date = new Date(dateString + 'T00:00:00');
```

### 5. Label Sorting
- **Issue**: Transactions can have multiple labels
- **Current behavior**: Sorts by FIRST label only
- **Code**: [transactionProcessing.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts) → [sortTransactions](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts#20-60)

### 6. Firebase Batch Limits
- **Issue**: Firestore batches limited to 500 operations
- **Current risk**: Low (unlikely to have 500+ installments)
- **Future**: If adding bulk import, need to chunk batches

### 7. Skip/Unskip on Series
- **Issue**: Skipping an installment creates the next month's installment
- **Behavior**: This is intentional - user wants to skip THIS month, but still pay next month

### 8. Transfer Validation
- **Missing**: No validation preventing transfer of child (rateio) transactions
- **Workaround**: UI hides transfer button for `isApportioned` transactions

---

## 🔧 Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173
```

### Building
```bash
# Type check + build
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests in watch mode
npm test

# Run tests once
npx vitest run

# Run specific test file
npm test src/logic/calculations.test.ts
```

### Firebase Setup
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore and Authentication (Email/Password)
3. Copy config to [src/lib/firebase.ts](file:///e:/Projects/jolia-app/src/lib/firebase.ts)
4. Set up Firestore indexes (see Firebase console errors)

### Common Firestore Indexes Needed
```
Collection: transactions
Fields: profileId (Ascending), date (Ascending)

Collection: labels
Fields: profileId (Ascending), createdAt (Ascending)
```

---

## 📚 Common Tasks & Guides

### Task 1: Add a New Transaction Field

**Steps**:
1. Update type in [src/types/index.ts](file:///e:/Projects/jolia-app/src/types/index.ts):
   ```typescript
   export interface Transaction {
     // ... existing fields
     newField?: string; // Add here
   }
   ```

2. Update [TransactionForm.tsx](file:///e:/Projects/jolia-app/src/components/TransactionForm.tsx):
   - Add input field
   - Add to form state
   - Add to validation

3. Update display components:
   - [TransactionRow.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionRow.tsx) (desktop view)
   - [TransactionItem.tsx](file:///e:/Projects/jolia-app/src/components/transactions/TransactionItem.tsx) (mobile view)

4. Update mutations if needed:
   - [useTransactionMutations.ts](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts) → [handleSaveTransaction](file:///e:/Projects/jolia-app/src/hooks/useTransactionMutations.ts#10-187)

5. Update filters/sort if needed:
   - [transactionProcessing.ts](file:///e:/Projects/jolia-app/src/logic/transactionProcessing.ts)

---

### Task 2: Add a New Modal

**Steps**:
1. Create component: `src/components/NewModal.tsx`
   ```typescript
   interface NewModalProps {
     isOpen: boolean;
     onClose: () => void;
     onSave: (data: any) => void;
   }
   
   export const NewModal: FC<NewModalProps> = ({ isOpen, onClose, onSave }) => {
     if (!isOpen) return null;
     
     return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-background p-6 rounded-lg max-w-md w-full">
           {/* Modal content */}
         </div>
       </div>
     );
   };
   ```

2. Add state to [useDashboardState.ts](file:///e:/Projects/jolia-app/src/hooks/useDashboardState.ts):
   ```typescript
   const [isNewModalOpen, setIsNewModalOpen] = useState(false);
   
   return {
     modals: {
       // ... existing modals
       newModal: {
         isOpen: isNewModalOpen,
         open: () => setIsNewModalOpen(true),
         close: () => setIsNewModalOpen(false)
       }
     }
   };
   ```

3. Use in [DashboardScreen.tsx](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx):
   ```typescript
   <NewModal
     isOpen={modals.newModal.isOpen}
     onClose={modals.newModal.close}
     onSave={handleSave}
   />
   ```

---

### Task 3: Add Unit Tests for a Pure Function

**Steps**:
1. Create test file: `src/logic/myFunction.test.ts`

2. Write tests:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { myFunction } from './myFunction';
   
   describe('myFunction', () => {
     it('should handle normal case', () => {
       const result = myFunction(input);
       expect(result).toEqual(expected);
     });
     
     it('should handle edge case', () => {
       const result = myFunction(edgeInput);
       expect(result).toEqual(expectedEdge);
     });
     
     it('should handle empty input', () => {
       const result = myFunction([]);
       expect(result).toEqual(defaultValue);
     });
   });
   ```

3. Run tests: `npm test`

---

### Task 4: Debug Firebase Query Not Working

**Checklist**:
1. ✅ Check index exists in Firebase Console
2. ✅ Verify `profileId` matches current profile
3. ✅ Check date format (YYYY-MM-DD)
4. ✅ Verify collection name is correct
5. ✅ Check Firebase Rules allow read/write
6. ✅ Look for errors in browser console
7. ✅ Check if `loading` state is stuck as `true`

**Common Firebase Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{profileId} {
      allow read, write: if request.auth != null;
    }
    
    match /labels/{labelId} {
      allow read, write: if request.auth != null;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### Task 5: Add a New Theme

**Steps**:
1. Open [src/lib/themes.ts](file:///e:/Projects/jolia-app/src/lib/themes.ts)

2. Add theme object:
   ```typescript
   export const themes: Theme[] = [
     // ... existing themes
     {
       id: 'my-theme',
       name: 'My Theme',
       variables: {
         background: '#FFFFFF',
         textPrimary: '#000000',
         accent: '#FF5733',
         // ... all required variables
       }
     }
   ];
   ```

3. Theme will automatically appear in Settings → Theme selector

---

## 🐛 Troubleshooting

### Build Fails with TypeScript Errors

**Symptoms**:
```
error TS2353: Object literal may only specify known properties
```

**Solution**:
1. Check if you're adding a property that doesn't exist in the type
2. Update type definition in [src/types/index.ts](file:///e:/Projects/jolia-app/src/types/index.ts)
3. Make sure mock data in tests matches the type

---

### Tests Fail with "Cannot find module"

**Symptoms**:
```
Error: Cannot find module '@testing-library/react'
```

**Solution**:
```bash
npm install @testing-library/react @testing-library/jest-dom --save-dev
```

---

### Firebase "Missing or insufficient permissions"

**Symptoms**:
```
FirebaseError: Missing or insufficient permissions
```

**Solution**:
1. Check Firebase Rules in Firebase Console
2. Verify user is authenticated (`request.auth != null`)
3. Check if collection/document path is correct

---

### Transactions Not Appearing

**Checklist**:
1. ✅ Check if month has data (use MonthSelector to see available months)
2. ✅ Verify filters aren't hiding transactions (click "Clear Filters")
3. ✅ Check if transaction [date](file:///e:/Projects/jolia-app/src/screens/DashboardScreen.tsx#371-379) is in the current month
4. ✅ Check if `profileId` matches
5. ✅ Check browser console for errors

---

### Rateio Not Working

**Checklist**:
1. ✅ Verify transaction is marked as `isShared: true`
2. ✅ Verify transaction is in "Geral" tab (not a subprofile)
3. ✅ Check if subprofiles have income transactions (for proportions)
4. ✅ Check `subprofileRevenueProportions` calculation in [useDashboardData](file:///e:/Projects/jolia-app/src/hooks/useDashboardData.ts#5-83)

---

## 🎯 Quick Reference

### Important File Paths
```
src/screens/DashboardScreen.tsx       # Main screen
src/hooks/useTransactionMutations.ts  # All CRUD operations
src/hooks/useDashboardData.ts         # Data aggregation
src/logic/transactionProcessing.ts    # Filtering & sorting
src/types/index.ts                    # All type definitions
src/lib/firebase.ts                   # Firebase config
src/lib/utils.ts                      # Utility functions
```

### Key Type Definitions
```typescript
Transaction, Label, Profile, Subprofile,
SortConfig, FilterConfig, GroupBy,
TransactionActions, TransactionFormState
```

### localStorage Keys
```
jolia_sort_config  # Persisted sort configuration
```

### Environment
- Dev server: `http://localhost:5173`
- Build output: `dist/`
- Test coverage: See [TEST_COVERAGE_ANALYSIS.md](file:///C:/Users/jooh_/.gemini/antigravity/brain/c894d086-08df-4d49-b9dc-9e5db22773b0/TEST_COVERAGE_ANALYSIS.md)

---

## 📖 Additional Resources

- **Project Docs**:
  - [TEST_COVERAGE_ANALYSIS.md](file:///C:/Users/jooh_/.gemini/antigravity/brain/c894d086-08df-4d49-b9dc-9e5db22773b0/TEST_COVERAGE_ANALYSIS.md) - Comprehensive test coverage analysis
  - [TEST_SCENARIOS.md](file:///C:/Users/jooh_/.gemini/antigravity/brain/c894d086-08df-4d49-b9dc-9e5db22773b0/TEST_SCENARIOS.md) - List of implemented test scenarios
  - [walkthrough.md](file:///C:/Users/jooh_/.gemini/antigravity/brain/c894d086-08df-4d49-b9dc-9e5db22773b0/walkthrough.md) - Refactoring work summary
  - [task.md](file:///C:/Users/jooh_/.gemini/antigravity/brain/c894d086-08df-4d49-b9dc-9e5db22773b0/task.md) - Project task tracking

- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **React Testing Library**: https://testing-library.com/react
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Last Updated**: 2025-11-23  
**Version**: 1.0.0  
**Status**: ✅ Build passing, 39/39 tests passing, refactoring complete
