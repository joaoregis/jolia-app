import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistScreen } from './WishlistScreen';
import { Wishlist } from '../types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useParams: () => ({ profileId: 'p1', subprofileId: undefined }),
    useNavigate: () => mockNavigate
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast })
}));

// Mock ProfileContext
const mockSetActiveTheme = vi.fn();
vi.mock('../hooks/useProfileContext', () => ({
    useProfileContext: () => ({
        profile: {
            id: 'p1',
            name: 'Test Profile',
            icon: '👤',
            status: 'active',
            subprofiles: [
                { id: 's1', name: 'Personal', status: 'active', themeId: 'default' },
                { id: 's2', name: 'Work', status: 'active', themeId: 'default' }
            ],
            savedThemes: []
        },
        loading: false,
        setActiveThemeBySubprofileId: mockSetActiveTheme
    })
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    onSnapshot: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(),
    writeBatch: vi.fn()
}));

vi.mock('../lib/firebase', () => ({
    db: {}
}));

// Mock child components
vi.mock('../components/WishlistFormModal', () => ({
    WishlistFormModal: ({ isOpen, onSave }: any) => isOpen ? (
        <div data-testid="wishlist-form-modal">
            <button onClick={() => onSave('New List')}>Save</button>
        </div>
    ) : null
}));

vi.mock('../components/WishlistItemFormModal', () => ({
    WishlistItemFormModal: ({ isOpen, onSave }: any) => isOpen ? (
        <div data-testid="wishlist-item-form-modal">
            <button onClick={() => onSave({ title: 'New Item', description: '', budget: 0, notes: '' })}>Save Item</button>
        </div>
    ) : null
}));

vi.mock('../components/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm }: any) => isOpen ? (
        <div data-testid="confirmation-modal">
            <button onClick={onConfirm}>Confirm</button>
        </div>
    ) : null
}));

describe('WishlistScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock onSnapshot to return empty wishlists
        const { onSnapshot } = require('firebase/firestore');
        onSnapshot.mockImplementation((query: any, callback: any) => {
            callback({ docs: [] });
            return () => { };
        });
    });

    it('should render screen title and new list button', () => {
        render(<WishlistScreen />);

        expect(screen.getByText('Lista de Desejos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /nova lista/i })).toBeInTheDocument();
    });

    it('should render tabs for geral and subprofiles', () => {
        render(<WishlistScreen />);

        expect(screen.getByText('Geral (Casa)')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should show empty state when no wishlists exist', () => {
        render(<WishlistScreen />);

        expect(screen.getByText(/nenhuma lista de desejos encontrada/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crie a sua primeira lista/i })).toBeInTheDocument();
    });

    it('should open add list modal when nova lista button is clicked', async () => {
        const user = userEvent.setup();
        render(<WishlistScreen />);

        await user.click(screen.getByRole('button', { name: /nova lista/i }));

        expect(screen.getByTestId('wishlist-form-modal')).toBeInTheDocument();
    });

    it('should navigate to correct path when tab is clicked', async () => {
        const user = userEvent.setup();
        render(<WishlistScreen />);

        await user.click(screen.getByText('Personal'));

        expect(mockNavigate).toHaveBeenCalledWith('/profile/p1/wishlist/s1');
    });

    it('should set active theme when tab changes', () => {
        render(<WishlistScreen />);

        // Initially activeTab is 'geral' (no subprofileId in params)
        expect(mockSetActiveTheme).toHaveBeenCalledWith('geral');
    });
});
