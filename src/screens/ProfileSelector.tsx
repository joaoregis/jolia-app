// src/screens/ProfileSelector.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileSelection } from '../hooks/useProfileSelection';
import { Plus, Trash2, Settings, Archive, LogOut } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal.tsx';
import { IconPicker } from '../components/IconPicker.tsx';
import { Icon, iconNames } from '../components/Icon.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { Profile } from '../types';

const CreateProfileForm: React.FC<{ onProfileCreated: () => void, showToast: (message: string, type: 'success' | 'error') => void }> = ({ onProfileCreated, showToast }) => {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);
    const { createProfile } = useProfileSelection();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await createProfile(name, selectedIcon);
            showToast('Perfil criado com sucesso!', 'success');
            onProfileCreated();
        } catch (error) {
            showToast('Erro ao criar perfil.', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <h2 className="text-2xl font-bold text-center text-[var(--text-primary)]">Criar Novo Perfil</h2>
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)]">Nome do Perfil (ex: Casa)</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-md border border-[var(--border)] shadow-sm bg-[var(--background)] text-[var(--text-primary)] p-2 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
                />
            </div>
            <IconPicker selectedIcon={selectedIcon} onSelect={setSelectedIcon} />
            <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
                <Plus size={18} /> Criar Perfil
            </button>
        </form>
    )
}

export const ProfileSelector: React.FC = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [manageMode, setManageMode] = useState(false);
    const [itemToArchive, setItemToArchive] = useState<Profile | null>(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Use the extracted hook for profile selection
    const {
        profiles,
        activeProfiles,
        loading,
        shouldShowCreateForm,
        archiveProfile,
        logout
    } = useProfileSelection();

    const handleProfileSelect = (profileId: string) => {
        if (manageMode) return;
        navigate(`/profile/${profileId}`);
    };

    const handleArchiveProfile = async () => {
        if (!itemToArchive) return;
        try {
            await archiveProfile(itemToArchive.id);
            showToast('Perfil arquivado com sucesso!', 'success');
            setItemToArchive(null);
        } catch (error) {
            showToast('Erro ao arquivar o perfil.', 'error');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const archivedCount = profiles.filter(p => p.status === 'archived').length + profiles.flatMap(p => p.subprofiles.filter(s => s.status === 'archived')).length;

    const canAddProfile = activeProfiles.length < 5;

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-[var(--background)] text-[var(--text-secondary)]">A carregar perfis...</div>;
    }

    // Auto-show create form if no active profiles and user hasn't manually opened it
    const shouldDisplayCreateForm = showCreateForm || shouldShowCreateForm;

    if (shouldDisplayCreateForm) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--background)] p-4">
                <div className="w-full max-w-md p-8 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)]">
                    <CreateProfileForm onProfileCreated={() => setShowCreateForm(false)} showToast={showToast} />
                    {profiles.length > 0 && (
                        <button onClick={() => setShowCreateForm(false)} className="w-full text-center mt-4 text-sm text-[var(--accent)] hover:underline">
                            Voltar para seleção
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col min-h-screen items-center justify-center bg-[var(--background)] p-8">
                <div className="absolute top-6 right-6 flex gap-4">
                    {archivedCount > 0 && (
                        <button onClick={() => navigate('/trash')} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hover:bg-[var(--sidebar)] transition-colors">
                            <Archive size={16} /> Lixeira ({archivedCount})
                        </button>
                    )}
                    <button onClick={() => setManageMode(!manageMode)} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hover:bg-[var(--sidebar)] transition-colors">
                        <Settings size={16} /> {manageMode ? 'Concluir' : 'Gerir Perfis'}
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                        <LogOut size={16} /> Sair
                    </button>
                </div>

                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">{manageMode ? 'Gerir Perfis' : 'Quem está a usar?'}</h1>
                <p className="text-[var(--text-secondary)] mb-12">{manageMode ? 'Selecione um perfil para arquivar.' : 'Selecione um perfil para continuar.'}</p>
                <div className="flex flex-wrap justify-center gap-8">
                    {activeProfiles.map(profile => (
                        <div key={profile.id} onClick={() => handleProfileSelect(profile.id)} className="relative flex flex-col items-center gap-4 group">
                            <div className={`w-32 h-32 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white transition-transform ${!manageMode ? 'cursor-pointer group-hover:scale-105' : ''}`}>
                                <Icon name={profile.icon} size={64} />
                            </div>
                            <span className="text-xl font-semibold text-[var(--text-primary)]">{profile.name}</span>
                            {manageMode && (
                                <button onClick={(e) => { e.stopPropagation(); setItemToArchive(profile); }} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {canAddProfile && (
                        <div onClick={() => setShowCreateForm(true)} className="flex flex-col items-center gap-4 group cursor-pointer">
                            <div className="w-32 h-32 bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] group-hover:scale-105 group-hover:border-[var(--accent)] transition-all">
                                <Plus size={64} />
                            </div>
                            <span className="text-xl font-semibold text-[var(--text-primary)]">Adicionar Perfil</span>
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={!!itemToArchive}
                onClose={() => setItemToArchive(null)}
                onConfirm={handleArchiveProfile}
                itemName={itemToArchive?.name || ''}
                title={`Arquivar "${itemToArchive?.name}"?`}
                message={
                    <p>
                        Esta ação não irá apagar os dados, apenas moverá o perfil para a lixeira.
                        Para confirmar, digite <strong className="text-[var(--text-primary)]">{itemToArchive?.name}</strong> na caixa abaixo.
                    </p>
                }
                confirmButtonText="Arquivar"
            />
        </>
    );
};