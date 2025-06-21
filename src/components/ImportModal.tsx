// src/components/ImportModal.tsx

import React, { useState } from 'react';
import { TransactionFormState } from '../types';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactions: TransactionFormState[]) => void;
    activeSubprofileId: string; 
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSave, activeSubprofileId }) => {
    const [jsonText, setJsonText] = useState('');
    const [parsedData, setParsedData] = useState<TransactionFormState[]>([]);
    const [error, setError] = useState('');

    const handleParseJson = () => {
        setError('');
        if (!jsonText.trim()) {
            setError('A área de texto está vazia.');
            return;
        }
        try {
            const data = JSON.parse(jsonText);
            if (!Array.isArray(data)) {
                setError('O JSON deve ser um array de transações.');
                return;
            }
            
            // Mapeamento atualizado para incluir o campo 'isRecurring'
            const validData: TransactionFormState[] = data.map(item => ({
                description: String(item.description || 'Sem descrição'),
                planned: Number(item.planned) || 0,
                actual: Number(item.actual) || 0,
                date: String(item.date || new Date().toISOString().split('T')[0]),
                type: item.type === 'income' ? 'income' : 'expense',
                paid: Boolean(item.paid),
                isShared: Boolean(item.isShared),
                isRecurring: Boolean(item.isRecurring), // Adicionado
                subprofileId: activeSubprofileId,
            }));
            setParsedData(validData);
        } catch (e) {
            setError('JSON inválido. Verifique a sintaxe.');
            console.error(e);
        }
    };

    const handleDataChange = (index: number, field: keyof TransactionFormState, value: any) => {
        const updatedData = [...parsedData];
        const item = updatedData[index];
        
        if (typeof item[field] === 'boolean') {
            (item[field] as any) = Boolean(value);
        } else if (typeof item[field] === 'number') {
            (item[field] as any) = Number(value);
        }
        else {
            (item[field] as any) = value;
        }

        setParsedData(updatedData);
    };

    const handleSaveAll = () => {
        onSave(parsedData);
        onClose();
        setJsonText('');
        setParsedData([]);
    };

    if (!isOpen) return null;

    const inputStyle = "w-full bg-slate-100 dark:bg-slate-700 dark:text-slate-200 p-1 rounded border-transparent focus:border-blue-500 focus:ring-blue-500";
    const selectStyle = `${inputStyle} dark:bg-slate-700`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Importar Transações em Massa</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full">&times;</button>
                </div>
                
                <div className="p-6 space-y-4 flex-shrink-0">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cole o conteúdo do seu ficheiro JSON aqui:</label>
                    <textarea 
                        className="w-full h-24 p-2 font-mono text-sm border rounded-md dark:bg-slate-900 dark:text-slate-300 focus:ring-blue-500 focus:border-blue-500"
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder='[{"description": "Exemplo", ...}]'
                    />
                    <button onClick={handleParseJson} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Upload size={16} /> Carregar e Validar Dados
                    </button>
                    {error && <div className="text-red-500 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
                </div>
                
                <div className="flex-grow overflow-y-auto px-6">
                    <table className="w-full text-xs text-left table-auto">
                        <thead className="text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 w-2/5">Descrição</th>
                                <th className="p-2">Previsto</th>
                                <th className="p-2">Efetivo</th>
                                <th className="p-2">Data</th>
                                <th className="p-2">Tipo</th>
                                <th className="p-2 text-center">Pago/Recebido</th>
                                <th className="p-2 text-center">Da Casa?</th>
                                <th className="p-2 text-center">Recorrente?</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {parsedData.map((item, index) => (
                                <tr key={index}>
                                    <td className="p-1"><input type="text" value={item.description} onChange={e => handleDataChange(index, 'description', e.target.value)} className={inputStyle}/></td>
                                    <td className="p-1"><input type="number" value={item.planned} onChange={e => handleDataChange(index, 'planned', parseFloat(e.target.value))} className={inputStyle}/></td>
                                    <td className="p-1"><input type="number" value={item.actual} onChange={e => handleDataChange(index, 'actual', parseFloat(e.target.value))} className={inputStyle}/></td>
                                    <td className="p-1"><input type="date" value={item.date} onChange={e => handleDataChange(index, 'date', e.target.value)} className={inputStyle}/></td>
                                    <td className="p-1"><select value={item.type} onChange={e => handleDataChange(index, 'type', e.target.value)} className={selectStyle}><option value="expense">Despesa</option><option value="income">Receita</option></select></td>
                                    <td className="p-1 text-center"><input type="checkbox" checked={item.paid} onChange={e => handleDataChange(index, 'paid', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/></td>
                                    <td className="p-1 text-center"><input type="checkbox" checked={item.isShared} onChange={e => handleDataChange(index, 'isShared', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/></td>
                                    <td className="p-1 text-center"><input type="checkbox" checked={item.isRecurring} onChange={e => handleDataChange(index, 'isRecurring', e.target.checked)} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t dark:border-slate-700 flex justify-end gap-4 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancelar
                    </button>
                    <button onClick={handleSaveAll} disabled={parsedData.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400">
                        <Check size={16}/> Salvar {parsedData.length} Itens
                    </button>
                </div>
            </div>
        </div>
    );
};
