// src/components/QuickRatingModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { MediaItem, Subprofile } from '../types';
import { RatingsList } from './RatingsList';

interface QuickRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mediaItem: MediaItem;
    subprofiles: Subprofile[];
    onSave: (mediaId: string, ratings: Record<string, number>, season?: number) => Promise<void>;
    season?: number;
}

export const QuickRatingModal: React.FC<QuickRatingModalProps> = ({
    isOpen,
    onClose,
    mediaItem,
    subprofiles,
    onSave,
    season
}) => {
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && mediaItem) {
            if (season && mediaItem.seasonRatings && mediaItem.seasonRatings[season]) {
                setRatings(mediaItem.seasonRatings[season]);
            } else {
                setRatings(mediaItem.ratings || {});
            }
        }
    }, [isOpen, mediaItem, season]);

    const handleRatingChange = (subprofileId: string, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [subprofileId]: rating
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(mediaItem.id, ratings, season);
            onClose();
        } catch (error) {
            console.error("Error saving ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border shrink-0">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Star className="text-accent" size={20} />
                        Avaliar: {mediaItem.title} {season ? `(Temp ${season})` : ''}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <RatingsList
                        subprofiles={subprofiles}
                        ratings={ratings}
                        onRatingChange={handleRatingChange}
                    />
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border bg-accent/5">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-accent/10 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
