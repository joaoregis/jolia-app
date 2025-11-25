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

    const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">{children}</div>;
    const List: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
    const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">{children}</div>;


    if (loading) {
        return <div className="flex h-screen items-center justify-center">A carregar lixeira...</div>;
    }

    return (
        <>
            <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
                <header className="bg-white dark:bg-slate-800 shadow-sm p-4 border-b dark:border-slate-700">
                    <div className="max-w-5xl mx-auto flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lixeira</h1>
                    </div>
                </header>
                <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                    {archivedProfiles.length === 0 && archivedSubprofiles.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                            A lixeira está vazia.
                        </div>
                    ) : (
                        <>
                            {archivedProfiles.length > 0 && (
                                <Card>
                                    <List title="Perfis Arquivados">
                                        {archivedProfiles.map(p => (
                                            <ListItem key={p.id}>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{p.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleRestoreProfile(p.id)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><RotateCw size={14} /> Restaurar</button>
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
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{s.name}</span>
                                                    <span className="text-xs text-slate-400 ml-2">(de {s.parentProfileName})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleRestoreSubprofile(s.parentProfileId, s.id)} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"><RotateCw size={14} /> Restaurar</button>
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
                        Para confirmar, digite <strong className="text-slate-900 dark:text-slate-100">{itemToDelete?.name}</strong> na caixa abaixo.
                    </p>
                }
                confirmButtonText="Excluir Permanentemente"
            />
        </>
    );
};