// src/screens/SettingsScreen.tsx

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLabels } from '../hooks/useLabels';
import { useToast } from '../contexts/ToastContext';
import { Label } from '../types';
import { Settings, Plus, Edit, Archive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { LabelFormModal } from '../components/LabelFormModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SettingsScreen: React.FC = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const { labels, loading } = useLabels(profileId);
    const { showToast } = useToast();

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);

    const activeLabels = labels.filter(l => l.status === 'active');

    const handleOpenForm = (label: Label | null = null) => {
        setSelectedLabel(label);
        setFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setSelectedLabel(null);
        setFormModalOpen(false);
    };

    const handleSaveLabel = async (formData: Omit<Label, 'id' | 'profileId' | 'createdAt' | 'status'>, id?: string) => {
        if (!profileId) return;

        try {
            if (id) {
                // Editar
                await updateDoc(doc(db, 'labels', id), { ...formData });
                showToast('Rótulo atualizado com sucesso!', 'success');
            } else {
                // Criar
                await addDoc(collection(db, 'labels'), {
                    ...formData,
                    profileId,
                    status: 'active',
                    createdAt: serverTimestamp()
                });
                showToast('Rótulo criado com sucesso!', 'success');
            }
            handleCloseForm();
        } catch (error) {
            showToast('Erro ao salvar o rótulo.', 'error');
            console.error(error);
        }
    };

    const handleOpenArchiveModal = (label: Label) => {
        setSelectedLabel(label);
        setArchiveModalOpen(true);
    };
    
    const handleConfirmArchive = async () => {
        if (!selectedLabel) return;
    
        try {
            // Verifica se o rótulo está em uso
            const q = query(
                collection(db, 'transactions'),
                where('labelIds', 'array-contains', selectedLabel.id),
                limit(1)
            );
            const snapshot = await getDocs(q);
    
            if (!snapshot.empty) {
                showToast('Não é possível arquivar. O rótulo está em uso por uma ou mais transações.', 'error');
                setArchiveModalOpen(false);
                setSelectedLabel(null);
                return;
            }
    
            // Se não estiver em uso, arquiva
            await updateDoc(doc(db, 'labels', selectedLabel.id), { status: 'archived' });
            showToast('Rótulo arquivado com sucesso.', 'success');
            setArchiveModalOpen(false);
            setSelectedLabel(null);
        } catch (error) {
            showToast('Erro ao arquivar o rótulo.', 'error');
            console.error(error);
        }
    };

    return (
        <>
            <div className="p-4 md:p-6 lg:p-10 space-y-6">
                <div className="flex items-center gap-4">
                    <Settings size={32} className="text-accent" />
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Configurações</h2>
                </div>

                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle className="text-lg">Gestão de Rótulos</CardTitle>
                        <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                            <Plus size={14} /> Novo Rótulo
                        </button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-text-secondary">A carregar rótulos...</p>
                        ) : activeLabels.length > 0 ? (
                            <div className="space-y-2">
                                {activeLabels.map(label => (
                                    <div key={label.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-background/80">
                                        <span className="flex items-center gap-3">
                                            <span className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></span>
                                            <span className="font-medium text-text-primary">{label.name}</span>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleOpenForm(label)} className="p-2 text-text-secondary hover:text-accent rounded-full"><Edit size={16} /></button>
                                            <button onClick={() => handleOpenArchiveModal(label)} className="p-2 text-text-secondary hover:text-red-500 rounded-full"><Archive size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-4 text-sm text-text-secondary">Nenhum rótulo criado. Comece a organizar as suas transações!</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <LabelFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseForm}
                onSave={handleSaveLabel}
                label={selectedLabel}
            />

            <ConfirmationModal
                isOpen={isArchiveModalOpen}
                onClose={() => setArchiveModalOpen(false)}
                onConfirm={handleConfirmArchive}
                title={`Arquivar o rótulo "${selectedLabel?.name}"?`}
                message="Esta ação não pode ser desfeita. Rótulos arquivados não poderão ser usados em novas transações."
            />
        </>
    );
};