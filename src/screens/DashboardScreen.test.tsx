import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardScreen } from './DashboardScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock all hooks and contexts
vi.mock('../hooks/useProfileContext', () => ({
    useProfileContext: () => ({
        profile: {
            id: 'p1',
            name: 'Test Profile',
            icon: '👤',
            status: 'active',
            subprofiles: [
                { id: 'sub1', name: 'Sub 1', status: 'active', theme: 'blue' }
            ],
            apportionmentMethod: 'manual'
        },
        loading: false,
        setActiveThemeBySubprofileId: vi.fn()
    })
}));

vi.mock('../hooks/useTransactions', () => ({
    useTransactions: () => ({
        transactions: [
            { id: 't1', description: 'Test Income', type: 'income', planned: 1000, actual: 1000, date: '2023-01-01', profileId: 'p1', isShared: true, paid: true },
            { id: 't2', description: 'Test Expense', type: 'expense', planned: 500, actual: 500, date: '2023-01-05', profileId: 'p1', isShared: true, paid: false }
        ],
        loading: false
    })
}));

vi.mock('../hooks/useAvailableMonths', () => ({
    useAvailableMonths: () => ({
        availableMonths: ['2023-01', '2023-02'],
        loading: false
    })
}));

vi.mock('../hooks/useLabels', () => ({
    useLabels: () => ({
        labels: [{ id: 'l1', name: 'Food', color: '#ff0000', profileId: 'p1', status: 'active' }],
        loading: false
    })
}));

vi.mock('../hooks/useDashboardLogic', () => ({
    useDashboardLogic: () => ({
        state: {
            currentMonth: new Date('2023-01-01'),
            sortConfig: { key: 'date', direction: 'ascending' },
            filterConfig: {},
            groupBy: 'none',
            selectedIncomeIds: new Set(),
            selectedExpenseIds: new Set(),
            selectedIgnoredIds: new Set()
        },
        setters: {
            setFilterConfig: vi.fn(),
            setGroupBy: vi.fn(),
            setSelectedIncomeIds: vi.fn(),
            setSelectedExpenseIds: vi.fn(),
            setSelectedIgnoredIds: vi.fn()
        },
        handlers: {
            changeMonth: vi.fn(),
            resetSelections: vi.fn(),
            requestSort: vi.fn(),
            handleMonthSelect: vi.fn(),
            createSelectionHandler: () => vi.fn(),
            createSelectAllHandler: () => vi.fn(),
            handleClearAllSelections: vi.fn()
        }
    })
}));

vi.mock('../hooks/useDashboardData', () => ({
    useDashboardData: () => ({
        sortedData: {
            receitas: [{ id: 't1', description: 'Test Income', type: 'income', planned: 1000, actual: 1000, date: '2023-01-01', profileId: 'p1', isShared: true, paid: true }],
            despesas: [{ id: 't2', description: 'Test Expense', type: 'expense', planned: 500, actual: 500, date: '2023-01-05', profileId: 'p1', isShared: true, paid: false }]
        },
        ignoredTransactions: [],
        subprofileRevenueProportions: new Map(),
        activeTransactions: []
    })
}));

vi.mock('../hooks/useTransactionMutations', () => ({
    useTransactionMutations: () => ({
        handleSaveTransaction: vi.fn(),
        handleFieldUpdate: vi.fn(),
        performDelete: vi.fn(),
        handleConfirmTransfer: vi.fn(),
        handleSkipTransaction: vi.fn(),
        handleUnskipTransaction: vi.fn(),
        handleTogglePaid: vi.fn(),
        handleSaveNote: vi.fn()
    })
}));

vi.mock('../hooks/useSubprofileManager', () => ({
    useSubprofileManager: () => ({
        handleCreateSubprofile: vi.fn(),
        handleUpdateSubprofile: vi.fn(),
        handleArchiveSubprofile: vi.fn(),
        handleSaveCustomTheme: vi.fn(),
        handleDeleteCustomTheme: vi.fn()
    })
}));

vi.mock('../hooks/useDashboardState', () => ({
    useDashboardState: () => ({
        modals: {
            transaction: { isOpen: false, open: vi.fn(), close: vi.fn(), initialValues: null },
            addSubprofile: { isOpen: false, open: vi.fn(), close: vi.fn() },
            editSubprofile: { isOpen: false, open: vi.fn(), close: vi.fn(), subprofileToEdit: null },
            archiveSubprofile: { isOpen: false, open: vi.fn(), close: vi.fn(), subprofileToArchive: null },
            closeMonth: { isOpen: false, open: vi.fn(), close: vi.fn() },
            deleteTransaction: { isOpen: false, open: vi.fn(), close: vi.fn(), transactionToDelete: null },
            import: { isOpen: false, open: vi.fn(), close: vi.fn() },
            export: { isOpen: false, open: vi.fn(), close: vi.fn() },
            settings: { isOpen: false, open: vi.fn(), close: vi.fn() },
            transfer: { isOpen: false, open: vi.fn(), close: vi.fn(), transactionToTransfer: null },
            seriesAction: { isOpen: false, open: vi.fn(), close: vi.fn(), actionType: null, transaction: null }
        },
        contextMenu: { state: null, open: vi.fn(), close: vi.fn() },
        editScope: { state: null, set: vi.fn() }
    })
}));

vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({
        showToast: vi.fn()
    })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ profileId: 'p1', subprofileId: undefined }),
        useNavigate: () => vi.fn()
    };
});

describe('DashboardScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render dashboard with profile name', () => {
        render(
            <BrowserRouter>
                <DashboardScreen />
            </BrowserRouter>
        );

        expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });

    it('should render tabs for subprofiles', () => {
        render(
            <BrowserRouter>
                <DashboardScreen />
            </BrowserRouter>
        );

        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
        expect(screen.getByText('Sub 1')).toBeInTheDocument();
    });

    it('should render transaction filters', () => {
        render(
            <BrowserRouter>
                <DashboardScreen />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText('Buscar transações...')).toBeInTheDocument();
    });

    it('should render transaction tables', () => {
        render(
            <BrowserRouter>
                <DashboardScreen />
            </BrowserRouter>
        );

        expect(screen.getByText('Receitas da Casa')).toBeInTheDocument();
        expect(screen.getByText('Despesas da Casa')).toBeInTheDocument();
    });

    it('should render summary cards', () => {
        render(
            <BrowserRouter>
                <DashboardScreen />
            </BrowserRouter>
        );

        // SummaryCards should render with the mocked data - Brazilian format: 1.000,00
        const incomeAmount = screen.getAllByText(/1\.000,00/);
        expect(incomeAmount.length).toBeGreaterThan(0);
    });
});
