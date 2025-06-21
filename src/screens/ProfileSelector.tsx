// src/screens/ProfileSelector.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, addDoc, updateDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { Profile } from '../types';
import { Plus, Trash2, Settings, Archive, LogOut } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal.tsx'; 
import { IconPicker } from '../components/IconPicker.tsx';
import { Icon, iconNames } from '../components/Icon.tsx';

const CreateProfileForm: React.FC<{ onProfileCreated: () => void }> = ({ onProfileCreated }) => {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(iconNames[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await addDoc(collection(db, 'profiles'), { 
            name, 
            icon: selectedIcon,
            subprofiles: [],
            status: 'active' 
        });
        onProfileCreated();
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white">Criar Novo Perfil</h2>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome do Perfil (ex: Casa)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 shadow-sm dark:bg-slate-700 dark:text-white p-2" />
            </div>
            <IconPicker selectedIcon={selectedIcon} onSelect={setSelectedIcon} />
            <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Plus size={18} /> Criar Perfil
            </button>
        </form>
    )
}

export const ProfileSelector: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [manageMode, setManageMode] = useState(false);
    const [itemToArchive, setItemToArchive] = useState<Profile | null>(null);
    const navigate = useNavigate();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = collection(db, 'profiles');
        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const loadedProfiles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Profile[];
            setProfiles(loadedProfiles);
            setLoading(false);
            if(loadedProfiles.filter(p => p.status === 'active').length === 0 && !showCreateForm) {
                setShowCreateForm(true);
            }
        }, (error) => {
            console.error("Erro ao carregar perfis:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, showCreateForm]);

    const handleProfileSelect = (profileId: string) => {
        if (manageMode) return;
        navigate(`/profile/${profileId}`);
    };

    const handleArchiveProfile = async () => {
        if (!itemToArchive) return;
        const profileRef = doc(db, 'profiles', itemToArchive.id);
        await updateDoc(profileRef, { status: 'archived' });
        setItemToArchive(null);
    };
    
    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const activeProfiles = profiles.filter(p => p.status === 'active');
    const archivedCount = profiles.filter(p => p.status === 'archived').length + profiles.flatMap(p => p.subprofiles.filter(s => s.status === 'archived')).length;

    const canAddProfile = activeProfiles.length < 5;

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">A carregar perfis...</div>;
    }

    if (showCreateForm) {
        return (
             <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
                <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <CreateProfileForm onProfileCreated={() => setShowCreateForm(false)} />
                    {profiles.length > 0 && (
                        <button onClick={() => setShowCreateForm(false)} className="w-full text-center mt-4 text-sm text-blue-600 hover:underline">
                            Voltar para seleção
                        </button>
                    )}
                </div>
             </div>
        )
    }

    return (
        <>
        <div className="flex flex-col min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-8">
            <div className="absolute top-6 right-6 flex gap-4">
                 {archivedCount > 0 && (
                    <button onClick={() => navigate('/trash')} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-slate-50">
                        <Archive size={16} /> Lixeira ({archivedCount})
                    </button>
                )}
                <button onClick={() => setManageMode(!manageMode)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-slate-600 rounded-lg shadow-sm hover:bg-slate-700">
                    <Settings size={16} /> {manageMode ? 'Concluir' : 'Gerir Perfis'}
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">
                    <LogOut size={16} /> Sair
                </button>
            </div>
            
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{manageMode ? 'Gerir Perfis' : 'Quem está a usar?'}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-12">{manageMode ? 'Selecione um perfil para arquivar.' : 'Selecione um perfil para continuar.'}</p>
            <div className="flex flex-wrap justify-center gap-8">
                {activeProfiles.map(profile => (
                    <div key={profile.id} onClick={() => handleProfileSelect(profile.id)} className="relative flex flex-col items-center gap-4 group">
                        <div className={`w-32 h-32 bg-blue-500 rounded-lg flex items-center justify-center text-white transition-transform ${!manageMode ? 'cursor-pointer group-hover:scale-105' : ''}`}>
                            <Icon name={profile.icon} size={64} />
                        </div>
                        <span className="text-xl font-semibold text-slate-700 dark:text-slate-300">{profile.name}</span>
                        {manageMode && (
                            <button onClick={(e) => { e.stopPropagation(); setItemToArchive(profile); }} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
                {canAddProfile && (
                     <div onClick={() => setShowCreateForm(true)} className="flex flex-col items-center gap-4 group cursor-pointer">
                        <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-105 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-all">
                            <Plus size={64} />
                        </div>
                        <span className="text-xl font-semibold text-slate-700 dark:text-slate-300">Adicionar Perfil</span>
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
                    Para confirmar, digite <strong className="text-slate-900 dark:text-slate-100">{itemToArchive?.name}</strong> na caixa abaixo.
                </p>
            }
            confirmButtonText="Arquivar"
        />
        </>
    );
};
