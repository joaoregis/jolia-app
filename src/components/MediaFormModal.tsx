// src/components/MediaFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { MediaItem, MediaProvider, Subprofile } from '../types';
import { StarRating } from './StarRating';

interface MediaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: MediaItem;
    subprofiles: Subprofile[];
}

const PROVIDERS: MediaProvider[] = ['Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Cinema', 'Youtube', 'Outro'];

export const MediaFormModal: React.FC<MediaFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    subprofiles
}) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'movie' | 'series' | 'documentary' | 'video' | 'other'>('movie');
    const [isEpisodic, setIsEpisodic] = useState(false);
    const [provider, setProvider] = useState<MediaProvider>('Netflix');
    const [providerDetail, setProviderDetail] = useState('');
    const [link, setLink] = useState('');
    const [suggestedBy, setSuggestedBy] = useState('');

    // New Status State
    const [status, setStatus] = useState<'to_watch' | 'in_progress' | 'watched'>('to_watch');

    // Progress
    const [currentTime, setCurrentTime] = useState<number | undefined>(undefined);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);

    // Variable Episodes per Season
    const [seasonEpisodes, setSeasonEpisodes] = useState<Record<number, number>>({ 1: 10 }); // Default S1: 10 eps

    // Watched Data
    const [watchedDate, setWatchedDate] = useState('');
    const [watchedSeasons, setWatchedSeasons] = useState<Record<number, string>>({});
    const [ratings, setRatings] = useState<Record<string, number>>({});

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setType(initialData.type);
                // Determine if episodic based on type or data
                if (initialData.type === 'series') {
                    setIsEpisodic(true);
                } else if (initialData.type === 'documentary' || initialData.type === 'video') {
                    // Check if it has season/episode data to determine if it was saved as episodic
                    setIsEpisodic(!!initialData.currentSeason || !!initialData.seasonEpisodes);
                } else {
                    setIsEpisodic(false);
                }
                setProvider(initialData.provider);
                setProviderDetail(initialData.providerDetail || '');
                setLink(initialData.link || '');
                setSuggestedBy(initialData.suggestedBy);

                // Map legacy isWatched to status if needed
                if (initialData.status) {
                    setStatus(initialData.status);
                } else {
                    setStatus(initialData.isWatched ? 'watched' : 'to_watch');
                }

                setCurrentTime(initialData.currentTime);
                setCurrentSeason(initialData.currentSeason || 1);
                setCurrentEpisode(initialData.currentEpisode || 1);

                // Initialize seasonEpisodes
                if (initialData.seasonEpisodes) {
                    setSeasonEpisodes(initialData.seasonEpisodes);
                } else if (initialData.totalEpisodes) {
                    // Legacy: assume all seasons have same count or just S1
                    setSeasonEpisodes({ 1: initialData.totalEpisodes });
                } else {
                    setSeasonEpisodes({ 1: 10 });
                }

                setWatchedDate(initialData.watchedDate || '');
                setWatchedSeasons(initialData.watchedSeasons || {});
                setRatings(initialData.ratings || (initialData.rating ? { [initialData.suggestedBy]: initialData.rating } : {}));
            } else {
                // Reset form
                setTitle('');
                setType('movie');
                setIsEpisodic(false);
                setProvider('Netflix');
                setProviderDetail('');
                setLink('');
                setSuggestedBy(subprofiles[0]?.id || '');
                setStatus('to_watch');
                setCurrentTime(undefined);
                setCurrentSeason(1);
                setCurrentEpisode(1);
                setSeasonEpisodes({ 1: 10 });
                setWatchedDate(new Date().toISOString().slice(0, 7));
                setWatchedSeasons({});
                setRatings({});
            }
        }
    }, [isOpen, initialData, subprofiles]);

    const handleRatingChange = (subprofileId: string, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [subprofileId]: rating
        }));
    };

    const handleSeasonEpisodeChange = (season: number, episodes: number) => {
        setSeasonEpisodes(prev => ({
            ...prev,
            [season]: episodes
        }));
    };

    const handleWatchedSeasonChange = (season: number, date: string) => {
        setWatchedSeasons(prev => {
            const next = { ...prev };
            if (date) next[season] = date;
            else delete next[season];
            return next;
        });
    };

    const handleAddSeason = () => {
        const nextSeason = Math.max(...Object.keys(seasonEpisodes).map(Number), 0) + 1;
        setSeasonEpisodes(prev => ({
            ...prev,
            [nextSeason]: 10 // Default to 10
        }));
    };

    const handleRemoveSeason = (season: number) => {
        const newEpisodes = { ...seasonEpisodes };
        delete newEpisodes[season];
        setSeasonEpisodes(newEpisodes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: any = {
                title,
                type,
                provider,
                link,
                suggestedBy,
                status
            };

            if (provider === 'Outro') {
                data.providerDetail = providerDetail;
            }

            if (status === 'watched') {
                data.watchedDate = watchedDate;
                data.ratings = ratings;
            }

            if (status === 'in_progress' && !isEpisodic) {
                data.currentTime = currentTime;
            }

            if (type === 'series' || isEpisodic) {
                data.currentSeason = currentSeason;
                data.currentEpisode = currentEpisode;
                data.seasonEpisodes = seasonEpisodes;
                data.totalSeasons = Object.keys(seasonEpisodes).length;
                data.watchedSeasons = watchedSeasons;
                // Legacy support
                data.totalEpisodes = seasonEpisodes[currentSeason] || 0;

                // Smart Status Update for New Seasons
                if (initialData?.status === 'watched' && status === 'watched') {
                    const initialSeasons = initialData.totalSeasons || 0;
                    const newSeasons = Object.keys(seasonEpisodes).length;

                    if (newSeasons > initialSeasons) {
                        if (window.confirm('Você adicionou novas temporadas. Deseja mudar o status para "Para Assistir"?')) {
                            data.status = 'to_watch';
                            data.currentSeason = initialSeasons + 1;
                            data.currentEpisode = 1;
                            // Note: MediaScreen handleFormSubmit must handle clearing watchedDate if status changes
                        }
                    }
                }
            }

            await onSubmit(data);
            onClose();
        } catch (error) {
            console.error("Error saving media:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">
                        {initialData ? 'Editar Mídia' : 'Nova Mídia'}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    {/* Title & Type */}
                    <div className="flex gap-4">
                        <div className="flex-grow">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            />
                        </div>
                        <div className="w-1/3">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="movie">Filme</option>
                                <option value="series">Série</option>
                                <option value="documentary">Documentário</option>
                                <option value="video">Vídeo</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Episodic Toggle for Documentary/Video */}
                    {(type === 'documentary' || type === 'video') && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isEpisodic"
                                checked={isEpisodic}
                                onChange={(e) => setIsEpisodic(e.target.checked)}
                                className="rounded border-border text-accent focus:ring-accent"
                            />
                            <label htmlFor="isEpisodic" className="text-sm text-text-primary">
                                Possui episódios/temporadas?
                            </label>
                        </div>
                    )}

                    {/* Provider & Link */}
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Provedor</label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value as any)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                {PROVIDERS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                {provider === 'Outro' ? 'Qual?' : 'Link (Opcional)'}
                            </label>
                            {provider === 'Outro' ? (
                                <input
                                    type="text"
                                    value={providerDetail}
                                    onChange={(e) => setProviderDetail(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            ) : (
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            )}
                        </div>
                    </div>

                    {/* Status & Suggested By */}
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="to_watch">Para Assistir</option>
                                <option value="in_progress">Em Progresso</option>
                                <option value="watched">Assistido</option>
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Sugerido por</label>
                            <select
                                value={suggestedBy}
                                onChange={(e) => setSuggestedBy(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                required
                            >
                                {subprofiles.map(sp => (
                                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Series/Episodic Specific Fields */}
                    {(type === 'series' || isEpisodic) && (
                        <div className="bg-accent/5 p-3 rounded-lg border border-accent/20 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Temp. Atual</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentSeason}
                                        onChange={(e) => setCurrentSeason(parseInt(e.target.value) || 1)}
                                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-text-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Ep. Atual</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentEpisode}
                                        onChange={(e) => setCurrentEpisode(parseInt(e.target.value) || 1)}
                                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-text-primary text-sm"
                                    />
                                </div>
                            </div>

                            {/* Season Episodes Manager */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-medium text-text-secondary">Episódios por Temporada</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSeason}
                                        className="text-xs flex items-center gap-1 text-accent hover:underline"
                                    >
                                        <Plus size={12} /> Add Temp
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {Object.entries(seasonEpisodes).sort((a, b) => Number(a[0]) - Number(b[0])).map(([season, episodes]) => (
                                        <div key={season} className="flex items-center gap-2">
                                            <span className="text-xs text-text-secondary w-16">Temp {season}:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={episodes}
                                                onChange={(e) => handleSeasonEpisodeChange(Number(season), parseInt(e.target.value) || 0)}
                                                className="flex-grow bg-background border border-border rounded px-2 py-1 text-xs text-text-primary"
                                                placeholder="Qtd Episódios"
                                            />
                                            {Object.keys(seasonEpisodes).length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSeason(Number(season))}
                                                    className="text-text-secondary hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Season History */}
                            <div className="space-y-2 pt-2 border-t border-accent/20">
                                <label className="block text-xs font-medium text-text-secondary">Histórico de Temporadas</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {Object.keys(seasonEpisodes).sort((a, b) => Number(a) - Number(b)).map(season => (
                                        <div key={season} className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-text-primary w-20">Temp {season}</span>
                                            <input
                                                type="month"
                                                value={watchedSeasons[Number(season)] || ''}
                                                onChange={(e) => handleWatchedSeasonChange(Number(season), e.target.value)}
                                                className="flex-grow bg-background border border-border rounded px-2 py-1 text-xs text-text-primary"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standalone/Movie In Progress */}
                    {!isEpisodic && status === 'in_progress' && (
                        <div className="bg-accent/5 p-3 rounded-lg border border-accent/20">
                            <label className="block text-xs font-medium text-text-secondary mb-1">Tempo Assistido (minutos)</label>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-accent" />
                                <input
                                    type="number"
                                    min="0"
                                    value={currentTime || ''}
                                    onChange={(e) => setCurrentTime(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-text-primary text-sm"
                                    placeholder="Ex: 45"
                                />
                            </div>
                        </div>
                    )}

                    {/* Watched Fields */}
                    {status === 'watched' && (
                        <div className="bg-accent/5 p-3 rounded-lg border border-accent/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Quando?</label>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-accent" />
                                    <input
                                        type="month"
                                        value={watchedDate}
                                        onChange={(e) => setWatchedDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-text-primary text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-2">Avaliações</label>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {subprofiles.map(sp => (
                                        <div key={sp.id} className="flex items-center justify-between bg-background/50 p-2 rounded border border-border/50">
                                            <span className="text-sm text-text-primary">{sp.name}</span>
                                            <StarRating
                                                rating={ratings[sp.id] || 0}
                                                onChange={(r) => handleRatingChange(sp.id, r)}
                                                size={16}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-accent/10 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
