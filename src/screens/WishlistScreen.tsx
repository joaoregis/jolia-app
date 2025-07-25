// src/screens/WishlistScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';
import { useProfileContext } from '../hooks/useProfileContext';
import { Wishlist, WishlistItem } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { formatCurrency } from '../lib/utils';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { WishlistFormModal } from '../components/WishlistFormModal';
import { WishlistItemFormModal } from '../components/WishlistItemFormModal';

// Hook para buscar os dados da Wishlist
const useWishlists = (profileId?: string) => {
    const [wishlists, setWishlists] = useState<Wishlist[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Map<string, WishlistItem[]>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profileId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'wishlists'), where('profileId', '==', profileId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wishlist));
            setWishlists(lists);

            lists.forEach(list => {
                const itemsQuery = query(collection(db, `wishlists/${list.id}/items`), orderBy('createdAt', 'asc'));
                onSnapshot(itemsQuery, (itemsSnapshot) => {
                    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
                    setWishlistItems(prevItems => new Map(prevItems).set(list.id, items));
                });
            });

            setLoading(false);
        }, () => {
            setLoading(false);
        });

        return () => unsubscribe();
    }, [profileId]);

    return { wishlists, wishlistItems, loading };
};


export const WishlistScreen: React.FC = () => {
    const { profileId, subprofileId } = useParams<{ profileId: string; subprofileId?: string }>();
    const navigate = useNavigate();
    const { profile, loading: profileLoading, setActiveThemeBySubprofileId } = useProfileContext();
    const { showToast } = useToast();
    const { wishlists, wishlistItems, loading: wishlistsLoading } = useWishlists(profileId);
    
    const activeTab = subprofileId || 'geral';

    useEffect(() => {
        setActiveThemeBySubprofileId(activeTab);
    }, [activeTab, setActiveThemeBySubprofileId]);

    const [isAddListModalOpen, setAddListModalOpen] = useState(false);
    const [isEditListModalOpen, setEditListModalOpen] = useState(false);
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setEditItemModalOpen] = useState(false);
    const [isDeleteListModalOpen, setDeleteListModalOpen] = useState(false);
    const [isDeleteItemModalOpen, setDeleteItemModalOpen] = useState(false);

    const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
    const [selectedWishlistItem, setSelectedWishlistItem] = useState<WishlistItem | null>(null);


    const activeSubprofiles = useMemo(() => profile?.subprofiles.filter(s => s.status === 'active') || [], [profile]);

    const filteredWishlists = useMemo(() => {
        const sorted = [...wishlists].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        if (activeTab === 'geral') {
            return sorted.filter(w => w.isShared);
        }
        return sorted.filter(w => w.subprofileId === activeTab);
    }, [wishlists, activeTab]);

    // --- Handlers ---
    const handleTabClick = (tabId: string) => {
        const path = tabId === 'geral'
            ? `/profile/${profileId}/wishlist`
            : `/profile/${profileId}/wishlist/${tabId}`;
        navigate(path);
    };

    const handleAddWishlist = async (name: string) => {
        if (!profileId) return;
        try {
            const data: {
                name: string;
                profileId: string;
                isShared: boolean;
                subprofileId?: string;
                createdAt: any;
            } = {
                name,
                profileId,
                isShared: activeTab === 'geral',
                createdAt: serverTimestamp(),
            };
    
            if (activeTab !== 'geral') {
                data.subprofileId = activeTab;
            }
    
            await addDoc(collection(db, 'wishlists'), data);
            showToast('Lista de desejos criada com sucesso!', 'success');
            setAddListModalOpen(false);
        } catch (error) {
            showToast('Erro ao criar a lista de desejos.', 'error');
        }
    };

    const handleEditWishlist = async (newName: string) => {
        if (!selectedWishlist) return;
        try {
            await updateDoc(doc(db, 'wishlists', selectedWishlist.id), { name: newName });
            showToast('Lista de desejos atualizada!', 'success');
            setEditListModalOpen(false);
            setSelectedWishlist(null);
        } catch (error) {
            showToast('Erro ao atualizar a lista.', 'error');
        }
    };
    
    const handleDeleteWishlist = async () => {
        if (!selectedWishlist) return;
        try {
            const batch = writeBatch(db);
            const items = wishlistItems.get(selectedWishlist.id) || [];
            items.forEach(item => {
                batch.delete(doc(db, `wishlists/${selectedWishlist.id}/items`, item.id));
            });
            batch.delete(doc(db, 'wishlists', selectedWishlist.id));
            await batch.commit();
            showToast('Lista de desejos excluída com sucesso.', 'success');
            setDeleteListModalOpen(false);
            setSelectedWishlist(null);
        } catch (error) {
            showToast('Erro ao excluir a lista.', 'error');
        }
    };

    const handleAddWishlistItem = async (itemData: Omit<WishlistItem, 'id' | 'createdAt' | 'isDone'>) => {
        if (!selectedWishlist) return;
        try {
            await addDoc(collection(db, `wishlists/${selectedWishlist.id}/items`), {
                ...itemData,
                isDone: false,
                createdAt: serverTimestamp()
            });
            showToast('Item adicionado à lista!', 'success');
            setAddItemModalOpen(false);
            setSelectedWishlist(null);
        } catch (error) {
            showToast('Erro ao adicionar o item.', 'error');
        }
    };

    const handleEditWishlistItem = async (itemData: Omit<WishlistItem, 'id' | 'createdAt' | 'isDone'>) => {
        if (!selectedWishlist || !selectedWishlistItem) return;
        try {
            await updateDoc(doc(db, `wishlists/${selectedWishlist.id}/items`, selectedWishlistItem.id), { ...itemData });
            showToast('Item atualizado com sucesso!', 'success');
            setEditItemModalOpen(false);
            setSelectedWishlistItem(null);
            setSelectedWishlist(null);
        } catch (error) {
            showToast('Erro ao atualizar o item.', 'error');
        }
    };

    const handleToggleDone = async (listId: string, item: WishlistItem) => {
        try {
            await updateDoc(doc(db, `wishlists/${listId}/items`, item.id), { isDone: !item.isDone });
            showToast(item.isDone ? 'Item marcado como não concluído.' : 'Item marcado como concluído!', 'info');
        } catch (error) {
            showToast('Erro ao atualizar o status do item.', 'error');
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedWishlist || !selectedWishlistItem) return;
        try {
            await deleteDoc(doc(db, `wishlists/${selectedWishlist.id}/items`, selectedWishlistItem.id));
            showToast('Item excluído da lista.', 'success');
            setDeleteItemModalOpen(false);
            setSelectedWishlistItem(null);
            setSelectedWishlist(null);
        } catch (error) {
            showToast('Erro ao excluir o item.', 'error');
        }
    };


    if (profileLoading || wishlistsLoading) {
        return <div className="p-10 text-center text-text-secondary">A carregar...</div>;
    }

    const WishlistItemComponent: React.FC<{ item: WishlistItem; list: Wishlist }> = ({ item, list }) => (
        <div className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${item.isDone ? 'bg-background/50 opacity-60' : 'bg-card hover:bg-background'}`}>
            <ToggleSwitch
                id={`done-${item.id}`}
                checked={item.isDone}
                onChange={() => handleToggleDone(list.id, item)}
            />
            <div className="flex-grow min-w-0">
                <p className={`font-medium text-text-primary ${item.isDone ? 'line-through' : ''}`}>{item.title}</p>
                {item.description && <p className="text-xs text-text-secondary mt-1 break-words">{item.description}</p>}
                {item.notes && <p className="text-xs text-amber-500 mt-1 italic break-all">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-4">
                {item.budget ? <span className="text-sm font-semibold text-accent">{formatCurrency(item.budget)}</span> : null}
                <button onClick={() => { setSelectedWishlist(list); setSelectedWishlistItem(item); setEditItemModalOpen(true); }} className="text-text-secondary hover:text-accent"><Edit size={16} /></button>
                <button onClick={() => { setSelectedWishlist(list); setSelectedWishlistItem(item); setDeleteItemModalOpen(true); }} className="text-text-secondary hover:text-red-500"><Trash2 size={16} /></button>
            </div>
        </div>
    );
    
    return (
        <div className="p-4 md:p-6 lg:p-10 space-y-6">
            <style>
                {`
                    @media (min-width: 768px) {
                        .masonry-grid {
                            column-count: 2;
                        }
                    }
                    @media (min-width: 1280px) {
                        .masonry-grid {
                            column-count: 3;
                        }
                    }
                    .masonry-item {
                        break-inside: avoid-column;
                        page-break-inside: avoid;
                    }
                `}
            </style>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">Lista de Desejos</h2>
                <button onClick={() => setAddListModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                    <Plus size={16}/> Nova Lista
                </button>
            </div>

            <div className="border-b border-border-color">
                <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto">
                    <button onClick={() => handleTabClick('geral')} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === 'geral' ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        Geral (Casa)
                    </button>
                    {activeSubprofiles.map(sub => (
                        <button key={sub.id} onClick={() => handleTabClick(sub.id)} className={`whitespace-nowrap py-4 px-1 md:px-2 border-b-2 font-medium text-sm ${activeTab === sub.id ? 'text-accent border-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                            {sub.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="masonry-grid gap-6">
                {filteredWishlists.length > 0 ? (
                    filteredWishlists.map(list => (
                        <div key={list.id} className="masonry-item mb-6">
                            <Card>
                                <CardHeader className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{list.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setSelectedWishlist(list); setAddItemModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-accent/80 rounded-lg hover:bg-accent">
                                            <Plus size={14} /> Adicionar Item
                                        </button>
                                        <button onClick={() => { setSelectedWishlist(list); setEditListModalOpen(true); }} className="text-text-secondary hover:text-accent"><Edit size={16} /></button>
                                        <button onClick={() => { setSelectedWishlist(list); setDeleteListModalOpen(true); }} className="text-text-secondary hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {(wishlistItems.get(list.id) || []).length > 0 ? (
                                        (wishlistItems.get(list.id) || []).map(item => <WishlistItemComponent key={item.id} item={item} list={list} />)
                                    ) : (
                                        <p className="text-center py-4 text-sm text-text-secondary">Nenhum item nesta lista ainda. Adicione um!</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-slate-500 dark:text-slate-400">
                        <p>Nenhuma lista de desejos encontrada para esta visão.</p>
                        <button onClick={() => setAddListModalOpen(true)} className="mt-4 text-accent font-semibold hover:underline">
                            Crie a sua primeira lista!
                        </button>
                    </div>
                )}
            </div>

            {/* Modais */}
            <WishlistFormModal 
                isOpen={isAddListModalOpen}
                onClose={() => setAddListModalOpen(false)}
                onSave={handleAddWishlist}
            />
            <WishlistFormModal 
                isOpen={isEditListModalOpen}
                onClose={() => { setEditListModalOpen(false); setSelectedWishlist(null); }}
                onSave={handleEditWishlist}
                wishlist={selectedWishlist}
            />
            <WishlistItemFormModal
                isOpen={isAddItemModalOpen}
                onClose={() => { setAddItemModalOpen(false); setSelectedWishlist(null); }}
                onSave={handleAddWishlistItem}
            />
             <WishlistItemFormModal
                isOpen={isEditItemModalOpen}
                onClose={() => { setEditItemModalOpen(false); setSelectedWishlistItem(null); setSelectedWishlist(null); }}
                onSave={handleEditWishlistItem}
                item={selectedWishlistItem}
            />

            <ConfirmationModal 
                isOpen={isDeleteListModalOpen}
                onClose={() => { setDeleteListModalOpen(false); setSelectedWishlist(null); }}
                onConfirm={handleDeleteWishlist}
                title={`Excluir a lista "${selectedWishlist?.name}"?`}
                message="Esta ação é irreversível e irá apagar todos os itens dentro desta lista."
            />
            <ConfirmationModal 
                isOpen={isDeleteItemModalOpen}
                onClose={() => { setDeleteItemModalOpen(false); setSelectedWishlistItem(null); setSelectedWishlist(null); }}
                onConfirm={handleDeleteItem}
                title={`Excluir o item "${selectedWishlistItem?.title}"?`}
                message="Tem certeza que quer excluir este item? Esta ação não pode ser desfeita."
            />
        </div>
    );
};