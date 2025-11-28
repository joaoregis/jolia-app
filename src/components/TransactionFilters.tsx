import React, { useState } from 'react';
import { Search, Filter, X, Layers } from 'lucide-react';
import { Select } from './Select';
import { FilterConfig, Label, GroupBy } from '../types';

interface TransactionFiltersProps {
    filters: FilterConfig;
    onFilterChange: (filters: FilterConfig) => void;
    labels: Label[];
    onClearFilters: () => void;
    groupBy: GroupBy;
    onGroupByChange: (groupBy: GroupBy) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onFilterChange, labels, onClearFilters, groupBy, onGroupByChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLabelToggle = (labelId: string) => {
        const currentLabels = filters.labelIds || [];
        const newLabels = currentLabels.includes(labelId)
            ? currentLabels.filter(id => id !== labelId)
            : [...currentLabels, labelId];
        onFilterChange({ ...filters, labelIds: newLabels });
    };

    const activeLabels = labels.filter(l => l.status === 'active');

    const hasActiveFilters = !!(filters.searchTerm || filters.minAmount || filters.maxAmount || (filters.labelIds && filters.labelIds.length > 0) || filters.startDate || filters.endDate);

    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar transações..."
                        value={filters.searchTerm || ''}
                        onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                        className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                    />
                </div>

                <div className="w-48">
                    <Select
                        value={groupBy}
                        onChange={(val) => onGroupByChange(val as GroupBy)}
                        options={[
                            { value: 'none', label: 'Sem Agrupamento' },
                            { value: 'label', label: 'Por Rótulo' },
                            { value: 'date', label: 'Por Data' },
                            { value: 'type', label: 'Por Tipo' },
                        ]}
                        icon={<Layers size={16} />}
                    />
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-2 rounded-md border ${isExpanded || hasActiveFilters ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:bg-background'}`}
                    title="Filtros Avançados"
                >
                    <Filter size={20} />
                </button>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-md"
                        title="Limpar Filtros"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Valor Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Valor</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minAmount || ''}
                                onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary"
                            />
                            <span className="text-text-secondary">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxAmount || ''}
                                onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary"
                            />
                        </div>
                    </div>

                    {/* Data Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-secondary">Data</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary"
                            />
                            <span className="text-text-secondary">-</span>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-text-primary"
                            />
                        </div>
                    </div>

                    {/* Rótulos */}
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-text-secondary">Rótulos</label>
                        <div className="flex flex-wrap gap-2">
                            {activeLabels.map(label => {
                                const isSelected = filters.labelIds?.includes(label.id);
                                return (
                                    <button
                                        key={label.id}
                                        onClick={() => handleLabelToggle(label.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${isSelected ? 'ring-2 ring-offset-1 ring-offset-card' : 'opacity-70 hover:opacity-100'}`}
                                        style={{
                                            backgroundColor: label.color,
                                            color: '#FFF',
                                            borderColor: label.color,
                                            boxShadow: isSelected ? `0 0 0 2px ${label.color}` : 'none'
                                        }}
                                    >
                                        {label.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
