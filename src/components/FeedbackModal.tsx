import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Select } from './Select';
import { useFeedbacks } from '../hooks/useFeedbacks';
import { FeedbackType, FeedbackPriority, Profile } from '../types';
import { Loader2, Trash2, CheckCircle, AlertTriangle, Bug, Lightbulb, Zap, HelpCircle, Archive, ClipboardList, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    activeSubprofileId?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, profile, activeSubprofileId }) => {
    const { feedbacks, loading, addFeedback, updateFeedbackStatus, deleteFeedback, markAsViewed } = useFeedbacks(profile.id);
    const location = useLocation();
    const [view, setView] = useState<'report' | 'list'>('report');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [type, setType] = useState<FeedbackType>('bug');
    const [priority, setPriority] = useState<FeedbackPriority>('medium');

    const activeSubprofile = profile.subprofiles.find(s => s.id === activeSubprofileId);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        try {
            await addFeedback({
                profileId: profile.id,
                subprofileId: activeSubprofileId || 'generic',
                description,
                type,
                priority,
                path: location.pathname + location.search
            });
            // ...
            // Reset form
            setDescription('');
            setType('bug');
            setPriority('medium');
            setView('list');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (type: FeedbackType, size = 16) => {
        switch (type) {
            case 'bug': return <Bug size={size} className="text-red-500" />;
            case 'feature': return <Lightbulb size={size} className="text-yellow-500" />;
            case 'performance': return <Zap size={size} className="text-blue-500" />;
            case 'ux': return <Zap size={size} className="text-purple-500" />; // Or maybe a Layout icon
            case 'tech_debt': return <AlertTriangle size={size} className="text-orange-500" />;
            default: return <HelpCircle size={size} className="text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: FeedbackPriority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
            case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
        }
    };

    const getSubprofileName = (id?: string) => {
        if (!id) return 'Visão Geral';
        return profile.subprofiles.find(s => s.id === id)?.name || 'Desconhecido';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl h-auto max-h-[85vh] flex flex-col animate-zoom-in overflow-hidden">
                <div className="p-6 pb-2 border-b border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                            <ClipboardList className="text-accent" />
                            Feedback & Issues
                        </h2>
                        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex space-x-4 text-sm font-medium">
                        <button
                            onClick={() => setView('report')}
                            className={`pb-2 px-1 transition-colors ${view === 'report' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'}`}
                        >
                            Nova Ação
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`pb-2 px-1 transition-colors ${view === 'list' ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'}`}
                        >
                            Lista ({feedbacks ? feedbacks.filter(f => f.status !== 'resolved').length : 0} abertos)
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-background/50">
                    {view === 'report' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Tipo</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['bug', 'feature', 'ux', 'performance', 'tech_debt', 'other'] as FeedbackType[]).map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-colors
                                                        ${type === t
                                                    ? 'bg-accent text-white border-accent'
                                                    : 'bg-card border-border hover:bg-muted text-text-primary'}`}
                                        >
                                            {getTypeIcon(t, 14)}
                                            <span className="capitalize">{t.replace('_', ' ')}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Prioridade</label>
                                <Select
                                    value={priority}
                                    onChange={(val) => setPriority(val as FeedbackPriority)}
                                    options={[
                                        { value: 'low', label: 'Baixa' },
                                        { value: 'medium', label: 'Média' },
                                        { value: 'high', label: 'Alta' }
                                    ]}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Descrição</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva o problema, ideia ou débito técnico..."
                                    className="w-full h-32 p-3 bg-background border border-border rounded-md resize-none focus:ring-2 focus:ring-accent focus:outline-none text-text-primary placeholder:text-text-secondary"
                                    required
                                />
                            </div>

                            <div className="pt-2 text-xs text-text-secondary">
                                Reportando como: <span className="font-bold text-text-primary">{activeSubprofile?.name || 'Visão Geral'}</span>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Registro'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                            ) : feedbacks.length === 0 ? (
                                <div className="text-center py-10 text-text-secondary">Nenhum registro encontrado.</div>
                            ) : (
                                feedbacks.map(item => (
                                    <div key={item.id} className={`p-4 rounded-lg border ${!item.isViewed ? 'border-l-4 border-l-blue-500 border-y-border border-r-border' : 'border-border'} ${item.status === 'resolved' ? 'bg-muted/30 opacity-60' : 'bg-card'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(item.type)}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                                {item.status === 'resolved' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                                        <CheckCircle size={10} /> Resolvido
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!item.isViewed && (
                                                    <button
                                                        onClick={() => markAsViewed(item.id)}
                                                        className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                        title="Marcar como visualizado"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                {item.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => updateFeedbackStatus(item.id, 'resolved')}
                                                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                        title="Marcar como resolvido"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {item.status === 'resolved' && (
                                                    <button
                                                        onClick={() => updateFeedbackStatus(item.id, 'open')}
                                                        className="p-1 text-text-secondary hover:bg-muted rounded transition-colors"
                                                        title="Reabrir"
                                                    >
                                                        <Archive size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteFeedback(item.id)}
                                                    className="p-1 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium mb-3 whitespace-pre-wrap text-text-primary">{item.description}</p>

                                        <div className="flex justify-between items-center text-xs text-text-secondary border-t border-border pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{getSubprofileName(item.subprofileId)}</span>
                                                <span>•</span>
                                                <span>{item.createdAt ? format(item.createdAt.toDate(), "d MMM, HH:mm", { locale: ptBR }) : '...'}</span>
                                                {item.path && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded truncate max-w-[150px]" title={item.path}>
                                                            {item.path}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
