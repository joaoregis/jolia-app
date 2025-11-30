// src/screens/TrashScreen.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrashManager } from '../hooks/useTrashManager';
import { ArrowLeft, Trash2, RotateCw } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { useToast } from '../contexts/ToastContext';

export const TrashScreen: React.FC = () => {
    const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'perfil' | 'subperfil', parentProfileId?: string } | null>(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Use the extracted hook for trash management
    const {
        archivedProfiles,
        archivedSubprofiles,
        loading,
        restoreProfile,
        restoreSubprofile,
        permanentlyDeleteProfile,
        permanentlyDeleteSubprofile
    } = useTrashManager();

    const handleRestoreProfile = async (profileId: string) => {
        try {
            await restoreProfile(profileId);
            showToast('Perfil restaurado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao restaurar perfil.', 'error');
        }
    };

    const handleRestoreSubprofile = async (parentProfileId: string, subprofileId: string) => {
        try {
            await restoreSubprofile(parentProfileId, subprofileId);
            showToast('Subperfil restaurado com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao restaurar subperfil.', 'error');
        }
    };

    const handlePermanentDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'perfil') {
                await permanentlyDeleteProfile(itemToDelete.id);
            }
            else if (itemToDelete.type === 'subperfil' && itemToDelete.parentProfileId) {
                await permanentlyDeleteSubprofile(itemToDelete.parentProfileId, itemToDelete.id);
            }
            showToast(`${itemToDelete.type === 'perfil' ? 'Perfil' : 'Subperfil'} excluído permanentemente.`, 'success');
            setItemToDelete(null);
        } catch (error) {
            showToast(`Erro ao excluir o ${itemToDelete.type}.`, 'error');
        }
    };

    const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="p-4 bg-[var(--card)] rounded-lg shadow-md border border-[var(--border)]">{children}</div>;
    const List: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
    const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-md">{children}</div>;


    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-[var(--background)] text-[var(--text-secondary)]">A carregar lixeira...</div>;
    }

    return (
        <>
            <div className="bg-[var(--background)] min-h-screen">
                <header className="bg-[var(--card)] shadow-sm p-4 border-b border-[var(--border)]">
                    <div className="max-w-5xl mx-auto flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-[var(--background)] transition-colors">
                            <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                        </button>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lixeira</h1>
                    </div>
                </header>
                <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                    {archivedProfiles.length === 0 && archivedSubprofiles.length === 0 ? (
                        <div className="text-center py-16 text-[var(--text-secondary)]">
                            A lixeira está vazia.
                        </div>
                    ) : (
                        <>
                            {archivedProfiles.length > 0 && (
                                <Card>
                                    <List title="Perfis Arquivados">
                                        {archivedProfiles.map(p => (
                                            <ListItem key={p.id}>
                                                <span className="font-medium text-[var(--text-primary)]">{p.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleRestoreProfile(p.id)} className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"><RotateCw size={14} /> Restaurar</button>
                                                    <button onClick={() => setItemToDelete({ id: p.id, name: p.name, type: 'perfil' })} className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"><Trash2 size={14} /> Excluir Perm.</button>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Card>
                            )}
                            {archivedSubprofiles.length > 0 && (
                                <Card>
                                    <List title="Subperfis Arquivados">
                                        {archivedSubprofiles.map(s => (
                                            <ListItem key={s.id}>
                                                <div>
                                                    <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                                                    <span className="text-xs text-[var(--text-secondary)] ml-2">(de {s.parentProfileName})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleRestoreSubprofile(s.parentProfileId, s.id)} className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"><RotateCw size={14} /> Restaurar</button>
                                                    <button onClick={() => setItemToDelete({ id: s.id, name: s.name, type: 'subperfil', parentProfileId: s.parentProfileId })} className="flex items-center gap-1.5 text-xs text-red-600 hover:underline"><Trash2 size={14} /> Excluir Perm.</button>
                                                </div>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Card>
                            )}
                        </>
                    )}
                </main>
            </div>
            <DeleteConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handlePermanentDelete}
                itemName={itemToDelete?.name || ''}
                title={`Excluir "${itemToDelete?.name}" permanentemente?`}
                message={
                    <p>
                        Esta ação é <strong className="text-red-500">irreversível</strong> e irá apagar todos os dados associados.
                        Para confirmar, digite <strong className="text-[var(--text-primary)]">{itemToDelete?.name}</strong> na caixa abaixo.
                    </p>
                }
                confirmButtonText="Excluir Permanentemente"
            />
        </>
    );
};