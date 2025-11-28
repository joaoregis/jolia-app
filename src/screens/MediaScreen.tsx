// src/screens/MediaScreen.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Minus, Film, Tv, Trash2, Edit2, CheckCircle, ExternalLink, Clock, FileText, Video, PlayCircle, Star } from 'lucide-react';
import { useMediaManager } from '../hooks/useMediaManager';
import { useProfileContext } from '../hooks/useProfileContext';
import { MediaFormModal } from '../components/MediaFormModal';
import { QuickRatingModal } from '../components/QuickRatingModal';
import { StarRating } from '../components/StarRating';
import { MonthSelector } from '../components/MonthSelector';
import { MediaItem } from '../types';

export const MediaScreen: React.FC = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const { profile } = useProfileContext();
    const {
        watchList,
        inProgressList,
        historyList,
        addMedia,
        updateMedia,
        deleteMedia,
        updateStatus,
        loading
    } = useMediaManager(profileId);

    const [activeTab, setActiveTab] = useState<'watchlist' | 'inprogress' | 'history'>('watchlist');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MediaItem | undefined>(undefined);
    const [quickRatingItem, setQuickRatingItem] = useState<{ item: MediaItem, season?: number } | undefined>(undefined);

    // ...

    const handleQuickRatingClick = (item: MediaItem, season?: number) => {
        setQuickRatingItem({ item, season });
    };

    const handleQuickRatingSave = async (mediaId: string, ratings: Record<string, number>, season?: number) => {
        if (season) {
            // Update specific season ratings
            // We need to construct the update object carefully for Firestore dot notation
            // But since updateMedia takes Partial<MediaItem>, we might need to cast or handle it in useMediaManager
            // Actually, useMediaManager's updateMedia just calls updateDoc.
            // So we can pass `[`seasonRatings.${season}`]: ratings` if we were calling updateDoc directly.
            // However, updateMedia expects Partial<MediaItem>.
            // Let's assume we can pass a nested object update or we need to fetch, merge and save.
            // A better approach for Firestore nested map updates via our hook:

            // We'll read the current item from the list to get existing seasonRatings
            const currentItem = historyList.find(i => i.id === mediaId) || watchList.find(i => i.id === mediaId) || inProgressList.find(i => i.id === mediaId);
            if (!currentItem) return;

            const currentSeasonRatings = currentItem.seasonRatings || {};
            const updatedSeasonRatings = {
                ...currentSeasonRatings,
                [season]: ratings
            };

            await updateMedia(mediaId, { seasonRatings: updatedSeasonRatings });
        } else {
            await updateMedia(mediaId, { ratings });
        }
        setQuickRatingItem(undefined);
    };

    // History filters
    const [historyDate, setHistoryDate] = useState(new Date());
    const [isYearView, setIsYearView] = useState(false);

    const availableMonths = React.useMemo(() => {
        const months = new Set<string>();
        // Add current month
        const now = new Date();
        months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

        historyList.forEach(item => {
            if (item.displayDate) {
                months.add(item.displayDate);
            }
        });
        return Array.from(months).sort().reverse();
    }, [historyList]);

    const handleAddClick = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (item: MediaItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            await deleteMedia(id);
        }
    };

    const handleToggleWatched = async (item: MediaItem) => {
        if (item.status !== 'watched') {
            // Open modal to fill details (ratings, date)
            setEditingItem({
                ...item,
                status: 'watched',
                watchedDate: new Date().toISOString().slice(0, 7)
            });
            setIsModalOpen(true);
        } else {
            if (window.confirm('Marcar como não assistido?')) {
                await updateStatus(item, 'to_watch');
            }
        }
    };

    const handleFormSubmit = async (data: any) => {
        if (editingItem && editingItem.id) {
            if (data.status !== editingItem.status) {
                const { status, ...otherData } = data;
                await updateStatus(editingItem, status, otherData);
            } else {
                await updateMedia(editingItem.id, data);
            }
        } else {
            await addMedia(data);
        }
    };



    const handleIncrementEpisode = async (item: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!item.currentEpisode || !item.currentSeason) return;

        const currentSeasonEpisodes = item.seasonEpisodes?.[item.currentSeason] || item.totalEpisodes || 999;
        const nextEpisode = item.currentEpisode + 1;

        if (nextEpisode > currentSeasonEpisodes) {
            // Check for next season
            const nextSeason = item.currentSeason + 1;
            // Check if next season exists in seasonEpisodes map
            const hasNextSeason = item.seasonEpisodes && item.seasonEpisodes[nextSeason];

            if (hasNextSeason) {
                if (window.confirm(`Você terminou a Temporada ${item.currentSeason}. Ir para a Temporada ${nextSeason}?`)) {
                    await updateMedia(item.id, {
                        currentSeason: nextSeason,
                        currentEpisode: 1,
                        status: 'in_progress'
                    });
                }
            } else {
                // End of series
                if (window.confirm(`Você chegou ao fim da série (Temporada ${item.currentSeason}). Marcar como assistido?`)) {
                    setEditingItem({
                        ...item,
                        currentEpisode: item.currentEpisode, // Keep at last episode
                        status: 'watched',
                        watchedDate: new Date().toISOString().slice(0, 7)
                    });
                    setIsModalOpen(true);
                }
            }
        } else {
            // Normal increment
            const updates: Partial<MediaItem> = { currentEpisode: nextEpisode };
            if (item.status === 'to_watch') {
                updates.status = 'in_progress';
            }
            await updateMedia(item.id, updates);
        }
    };

    const handleDecrementEpisode = async (item: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!item.currentEpisode || item.currentEpisode <= 1) return;

        const prevEpisode = item.currentEpisode - 1;
        await updateMedia(item.id, { currentEpisode: prevEpisode });
    };

    const getProviderBadge = (provider: string) => {
        const colors: Record<string, string> = {
            'Netflix': 'bg-red-600 text-white',
            'Prime Video': 'bg-blue-500 text-white',
            'Disney+': 'bg-blue-900 text-white',
            'HBO Max': 'bg-purple-700 text-white',
            'Apple TV+': 'bg-gray-800 text-white',
            'Cinema': 'bg-amber-600 text-white',
            'Youtube': 'bg-red-600 text-white',
            'Outro': 'bg-gray-500 text-white'
        };
        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${colors[provider] || colors['Outro']}`}>
                {provider}
            </span>
        );
    };

    const filteredHistory = historyList.filter(item => {
        if (!item.displayDate) return false;
        if (isYearView) {
            return item.displayDate.startsWith(String(historyDate.getFullYear()));
        }
        const selectedMonthStr = `${historyDate.getFullYear()}-${String(historyDate.getMonth() + 1).padStart(2, '0')}`;
        return item.displayDate === selectedMonthStr;
    });

    // Group by month for year view
    const groupedHistory = React.useMemo(() => {
        if (!isYearView) return null;
        const groups: Record<string, MediaItem[]> = {};
        filteredHistory.forEach(item => {
            if (item.displayDate) {
                if (!groups[item.displayDate]) groups[item.displayDate] = [];
                groups[item.displayDate].push(item);
            }
        });
        return groups;
    }, [filteredHistory, isYearView]);

    const sortedMonths = React.useMemo(() => {
        if (!groupedHistory) return [];
        return Object.keys(groupedHistory).sort().reverse();
    }, [groupedHistory]);

    const renderMediaCard = (item: MediaItem) => (
        <div key={item.id} className="bg-card border border-border rounded-xl p-0 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full overflow-hidden">
            {/* Header / Banner Area */}
            <div className="p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                    {getProviderBadge(item.provider)}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-card/90 p-1 rounded-lg shadow-sm border border-border">
                        <button onClick={() => handleEditClick(item)} className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeleteClick(item.id)} className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <h3 className="font-bold text-base text-text-primary leading-tight line-clamp-2 min-h-[2.5rem]" title={item.title}>{item.title}</h3>

                <div className="flex items-center gap-2 text-xs text-text-secondary mt-2">
                    {item.type === 'movie' && <Film size={12} />}
                    {item.type === 'series' && <Tv size={12} />}
                    {item.type === 'documentary' && <FileText size={12} />}
                    {item.type === 'video' && <Video size={12} />}

                    <span>
                        {item.type === 'movie' && 'Filme'}
                        {item.type === 'series' && 'Série'}
                        {item.type === 'documentary' && 'Documentário'}
                        {item.type === 'video' && 'Vídeo'}
                    </span>
                    {item.provider === 'Outro' && item.providerDetail && (
                        <span className="bg-accent/10 px-1.5 py-0.5 rounded text-[10px]">
                            {item.providerDetail}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 flex-grow">
                {/* Progress Section */}
                <div className="mt-2 mb-4">
                    {item.currentSeason ? (
                        <div className="flex items-center justify-between bg-background border border-border rounded-lg p-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-text-secondary font-bold tracking-wider">Progresso</span>
                                <span className="text-sm font-medium text-accent">
                                    S{item.currentSeason}:E{item.currentEpisode || 1}
                                    <span className="text-text-secondary text-xs font-normal">
                                        {item.seasonEpisodes?.[item.currentSeason!]
                                            ? ` / ${item.seasonEpisodes[item.currentSeason!]}`
                                            : (item.totalEpisodes ? ` / ${item.totalEpisodes}` : '')}
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => handleDecrementEpisode(item, e)}
                                    className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                    title="Voltar episódio"
                                >
                                    <Minus size={14} />
                                </button>
                                <button
                                    onClick={(e) => handleIncrementEpisode(item, e)}
                                    className="w-7 h-7 flex items-center justify-center bg-accent text-white rounded hover:bg-accent-hover transition-colors shadow-sm"
                                    title="Assistir próximo episódio"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    ) : item.status === 'in_progress' && item.currentTime ? (
                        <div className="flex items-center gap-2 text-xs text-accent bg-accent/5 p-2 rounded-lg border border-accent/10">
                            <Clock size={12} />
                            <span>{item.currentTime} min assistidos</span>
                        </div>
                    ) : (
                        <div className="h-10"></div> // Spacer for alignment
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-4 py-3 bg-accent/5 border-t border-border mt-auto">
                {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-text-secondary hover:text-accent transition-colors" title="Abrir link">
                        <ExternalLink size={12} />
                        <span>Abrir</span>
                    </a>
                ) : <span></span>}

                <button
                    onClick={() => handleToggleWatched(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-xs font-medium text-gray-700 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm"
                    title="Marcar como assistido"
                >
                    <CheckCircle size={14} />
                    <span>Concluir</span>
                </button>
            </div>
        </div>
    );

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Film className="text-accent" />
                        Entretenimento
                    </h1>
                    <p className="text-text-secondary">Gerencie filmes e séries para assistir em família</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Nova Mídia
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
                <button
                    onClick={() => setActiveTab('watchlist')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'watchlist'
                        ? 'text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Para Assistir ({watchList.length})
                    {activeTab === 'watchlist' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('inprogress')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'inprogress'
                        ? 'text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Em Progresso ({inProgressList.length})
                    {activeTab === 'inprogress' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'history'
                        ? 'text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Histórico
                    {activeTab === 'history' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
                    )}
                </button>
            </div>

            {activeTab === 'watchlist' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {watchList.map(renderMediaCard)}
                    {watchList.length === 0 && (
                        <div className="col-span-full py-12 text-center text-text-secondary">
                            <Film className="mx-auto h-12 w-12 mb-3 opacity-20" />
                            <p>Nenhum item na lista para assistir.</p>
                            <button onClick={handleAddClick} className="text-accent hover:underline mt-2">Adicionar o primeiro</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'inprogress' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {inProgressList.map(renderMediaCard)}
                    {inProgressList.length === 0 && (
                        <div className="col-span-full py-12 text-center text-text-secondary">
                            <PlayCircle className="mx-auto h-12 w-12 mb-3 opacity-20" />
                            <p>Nenhum item em progresso.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-center bg-card p-4 rounded-xl border border-border">
                        <MonthSelector
                            currentMonth={historyDate}
                            availableMonths={availableMonths}
                            closedMonths={[]} // Not applicable for media
                            allowYearSelection={true}
                            onMonthSelect={(year, month) => {
                                if (month === null) {
                                    setIsYearView(true);
                                    setHistoryDate(new Date(year, 0, 1));
                                } else {
                                    setIsYearView(false);
                                    setHistoryDate(new Date(year, month, 1));
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        {isYearView && groupedHistory ? (
                            sortedMonths.map(monthStr => {
                                const [year, month] = monthStr.split('-').map(Number);
                                const date = new Date(year, month - 1, 1);
                                const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                                return (
                                    <div key={monthStr} className="space-y-2">
                                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider pl-1 mt-6 mb-2 border-b border-border pb-1">
                                            {monthName}
                                        </h3>
                                        {groupedHistory[monthStr].map(item => (
                                            <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                                        {item.type === 'movie' && <Film size={24} />}
                                                        {item.type === 'series' && <Tv size={24} />}
                                                        {item.type === 'documentary' && <FileText size={24} />}
                                                        {item.type === 'video' && <Video size={24} />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-text-primary">{item.title}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                            {getProviderBadge(item.provider)}
                                                            <span>•</span>
                                                            <span>
                                                                {item.type === 'movie' && 'Filme'}
                                                                {item.type === 'series' && 'Série'}
                                                                {item.type === 'documentary' && 'Documentário'}
                                                                {item.type === 'video' && 'Vídeo'}
                                                            </span>
                                                            {(item as any).displaySeason ? (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-accent">Temporada {(item as any).displaySeason}</span>
                                                                </>
                                                            ) : (
                                                                item.currentSeason && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-accent">S{item.currentSeason}:E{item.currentEpisode || 1}</span>
                                                                    </>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="hidden md:flex items-center gap-2">
                                                        {/* Show average rating or a star icon */}
                                                        {item.ratings && Object.values(item.ratings).length > 0 ? (
                                                            <div className="flex items-center gap-1 bg-accent/5 px-2 py-1 rounded">
                                                                <StarRating
                                                                    rating={Object.values(item.ratings).reduce((a, b) => a + b, 0) / Object.values(item.ratings).length}
                                                                    readOnly
                                                                    size={14}
                                                                />
                                                                <span className="text-xs text-text-secondary">({Object.values(item.ratings).length})</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-text-secondary">Sem nota</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleQuickRatingClick(item, (item as any).displaySeason)} className="p-2 text-text-secondary hover:text-yellow-500 rounded-lg" title="Avaliar rapidamente">
                                                            <Star size={18} />
                                                        </button>
                                                        <button onClick={() => handleEditClick(item)} className="p-2 text-text-secondary hover:text-accent rounded-lg">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleToggleWatched(item)} className="p-2 text-green-500 hover:text-green-600 rounded-lg" title="Marcar como não assistido">
                                                            <CheckCircle size={18} fill="currentColor" className="text-green-100" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        ) : (
                            filteredHistory.map(item => (
                                <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                            {item.type === 'movie' && <Film size={24} />}
                                            {item.type === 'series' && <Tv size={24} />}
                                            {item.type === 'documentary' && <FileText size={24} />}
                                            {item.type === 'video' && <Video size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-primary">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                {getProviderBadge(item.provider)}
                                                <span>•</span>
                                                <span>
                                                    {item.type === 'movie' && 'Filme'}
                                                    {item.type === 'series' && 'Série'}
                                                    {item.type === 'documentary' && 'Documentário'}
                                                    {item.type === 'video' && 'Vídeo'}
                                                </span>
                                                {(item as any).displaySeason ? (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-accent">Temporada {(item as any).displaySeason}</span>
                                                    </>
                                                ) : (
                                                    item.currentSeason && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-accent">S{item.currentSeason}:E{item.currentEpisode || 1}</span>
                                                        </>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:flex items-center gap-2">
                                            {/* Show average rating or a star icon */}
                                            {item.ratings && Object.values(item.ratings).length > 0 ? (
                                                <div className="flex items-center gap-1 bg-accent/5 px-2 py-1 rounded">
                                                    <StarRating
                                                        rating={Object.values(item.ratings).reduce((a, b) => a + b, 0) / Object.values(item.ratings).length}
                                                        readOnly
                                                        size={14}
                                                    />
                                                    <span className="text-xs text-text-secondary">({Object.values(item.ratings).length})</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-secondary">Sem nota</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEditClick(item)} className="p-2 text-text-secondary hover:text-accent rounded-lg">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleToggleWatched(item)} className="p-2 text-green-500 hover:text-green-600 rounded-lg" title="Marcar como não assistido">
                                                <CheckCircle size={18} fill="currentColor" className="text-green-100" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {filteredHistory.length === 0 && (
                            <div className="py-12 text-center text-text-secondary">
                                <p>Nenhum item assistido neste período.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <MediaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingItem}
                subprofiles={profile?.subprofiles || []}
            />

            {quickRatingItem && (
                <QuickRatingModal
                    isOpen={!!quickRatingItem}
                    onClose={() => setQuickRatingItem(undefined)}
                    mediaItem={quickRatingItem.item}
                    season={quickRatingItem.season}
                    subprofiles={profile?.subprofiles || []}
                    onSave={handleQuickRatingSave}
                />
            )}
        </div>
    );
};
