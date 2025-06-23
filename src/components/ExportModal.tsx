// src/components/ExportModal.tsx

import React, { useState } from 'react';
import { Profile, Transaction } from '../types';
import { exportAsJson, exportAsCsv, exportAsXlsx } from '../lib/export';
import { Download } from 'lucide-react';

type ExportFormat = 'json' | 'csv' | 'xlsx';
type ExportScope = 'subprofile' | 'profile';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    activeSubprofileId: string;
    allTransactions: Transaction[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, profile, activeSubprofileId, allTransactions }) => {
    const [format, setFormat] = useState<ExportFormat>('json');
    const [scope, setScope] = useState<ExportScope>('subprofile');

    const handleExport = () => {
        const subprofile = profile.subprofiles.find(s => s.id === activeSubprofileId);
        const date = new Date().toISOString().split('T')[0];
        
        let dataToExport: Transaction[] = [];
        let baseFilename = '';

        if (scope === 'subprofile' && subprofile) {
            dataToExport = allTransactions.filter(t => t.subprofileId === activeSubprofileId);
            baseFilename = `export_${profile.name}_${subprofile.name}_${date}`;
        } else {
            dataToExport = allTransactions;
            baseFilename = `export_${profile.name}_completo_${date}`;
        }

        if (dataToExport.length === 0) {
            alert('Não há dados para exportar nesta seleção.');
            return;
        }

        switch (format) {
            case 'json':
                exportAsJson(dataToExport, baseFilename);
                break;
            case 'csv':
                exportAsCsv(dataToExport, baseFilename);
                break;
            case 'xlsx':
                exportAsXlsx(dataToExport, baseFilename);
                break;
        }
        onClose();
    };

    if (!isOpen) return null;
    
    const RadioGroup: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <div>
            <label className="block text-sm font-medium text-text-secondary">{title}</label>
            <div className="mt-2 flex flex-wrap gap-4">{children}</div>
        </div>
    );

    const RadioButton: React.FC<{id: string, name: string, value: string, checked: boolean, onChange: (val: any) => void, children: React.ReactNode}> = ({ id, name, value, checked, onChange, children }) => (
        <div className="flex items-center">
            <input id={id} name={name} type="radio" value={value} checked={checked} onChange={e => onChange(e.target.value)} className="h-4 w-4 text-accent border-border-color focus:ring-accent"/>
            <label htmlFor={id} className="ml-3 block text-sm text-text-primary">{children}</label>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card text-text-primary rounded-lg shadow-xl w-full max-w-lg">
                 <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold">Exportar Dados</h3>
                    <button onClick={onClose} className="text-text-secondary hover:opacity-75">&times;</button>
                </div>
                <div className="p-6 space-y-6">
                    <RadioGroup title="O que deseja exportar?">
                        <RadioButton id="scope-sub" name="scope" value="subprofile" checked={scope === 'subprofile'} onChange={setScope}>
                            Apenas dados de "{profile.subprofiles.find(s => s.id === activeSubprofileId)?.name}"
                        </RadioButton>
                         <RadioButton id="scope-full" name="scope" value="profile" checked={scope === 'profile'} onChange={setScope}>
                            Perfil Completo "{profile.name}"
                        </RadioButton>
                    </RadioGroup>
                    
                     <RadioGroup title="Escolha o formato">
                        <RadioButton id="format-json" name="format" value="json" checked={format === 'json'} onChange={setFormat}>JSON</RadioButton>
                        <RadioButton id="format-csv" name="format" value="csv" checked={format === 'csv'} onChange={setFormat}>CSV (para Excel, Google Sheets)</RadioButton>
                        <RadioButton id="format-xlsx" name="format" value="xlsx" checked={format === 'xlsx'} onChange={setFormat}>Excel (.xlsx)</RadioButton>
                    </RadioGroup>
                </div>
                <div className="p-4 bg-background/50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-primary bg-card rounded-lg hover:opacity-80 border border-border-color">Cancelar</button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                        <Download size={16}/> Gerar e Baixar
                    </button>
                </div>
            </div>
        </div>
    );
};
