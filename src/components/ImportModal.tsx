// src/components/ImportModal.tsx

import React, { useState } from 'react';
import Papa from 'papaparse';
import { TransactionFormState } from '../types';
import { Upload, Check, AlertCircle, Trash2, FileJson, FileSpreadsheet, Copy } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transactions: TransactionFormState[]) => void;
    activeSubprofileId: string; 
}

const jsonExample = [
    {
        "description": "Salário Mensal",
        "type": "income",
        "planned": 5000,
        "actual": 5000,
        "date": "2025-07-05",
        "paymentDate": "2025-07-05",
        "paid": true,
        "isShared": false,
        "isRecurring": true
    },
    {
        "description": "Aluguer",
        "type": "expense",
        "planned": 1500,
        "actual": 1500,
        "date": "2025-07-10",
        "paymentDate": "2025-07-10",
        "dueDate": "2025-07-15",
        "paid": true,
        "isShared": true,
        "isRecurring": true
    }
];

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSave, activeSubprofileId }) => {
    const [importType, setImportType] = useState<'json' | 'csv'>('json');
    const [textValue, setTextValue] = useState('');
    const [parsedData, setParsedData] = useState<TransactionFormState[]>([]);
    const [error, setError] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('Copiar');

    const handleParse = () => {
        setError('');
        setParsedData([]);

        if (importType === 'json') {
            if (!textValue.trim()) {
                setError('A área de texto JSON está vazia.');
                return;
            }
            try {
                const data = JSON.parse(textValue);
                if (!Array.isArray(data)) {
                    setError('O JSON deve ser um array de transações.');
                    return;
                }
                processData(data);
            } catch (e) {
                setError('JSON inválido. Verifique a sintaxe.');
                console.error(e);
            }
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setParsedData([]);
        const file = event.target.files?.[0];

        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        setError(`Erro ao processar CSV: ${results.errors[0].message}`);
                        return;
                    }
                    processData(results.data);
                },
                error: (err) => {
                    setError(`Falha ao ler o ficheiro CSV: ${err.message}`);
                }
            });
        }
    };

    const processData = (data: any[]) => {
        const validData: TransactionFormState[] = data.map(item => ({
            description: String(item.description || 'Sem descrição'),
            planned: Number(item.planned) || 0,
            actual: Number(item.actual) || 0,
            date: String(item.date || new Date().toISOString().split('T')[0]),
            paymentDate: item.paymentDate ? String(item.paymentDate) : String(item.date || new Date().toISOString().split('T')[0]),
            dueDate: item.dueDate ? String(item.dueDate) : undefined,
            type: item.type === 'income' ? 'income' : 'expense',
            paid: String(item.paid).toLowerCase() === 'true',
            isShared: String(item.isShared).toLowerCase() === 'true',
            isRecurring: String(item.isRecurring).toLowerCase() === 'true',
            subprofileId: activeSubprofileId,
        }));
        setParsedData(validData);
    };

    const handleDataChange = (index: number, field: keyof TransactionFormState, value: any) => {
        const updatedData = [...parsedData];
        const item = updatedData[index];
        const fieldType = typeof item[field];

        if (fieldType === 'boolean') {
            (item[field] as any) = Boolean(value);
        } else if (fieldType === 'number') {
            (item[field] as any) = Number(value) || 0;
        } else {
            (item[field] as any) = value;
        }

        setParsedData(updatedData);
    };

    const handleRemoveRow = (indexToRemove: number) => {
        setParsedData(currentData => currentData.filter((_, index) => index !== indexToRemove));
    };

    const handleCopyExample = async () => {
        const exampleString = JSON.stringify(jsonExample, null, 2);
        try {
            await navigator.clipboard.writeText(exampleString);
            setCopyButtonText('Copiado!');
            setTimeout(() => {
                setCopyButtonText('Copiar');
            }, 2000); 
        } catch (err) {
            console.error('Falha ao copiar o texto: ', err);
            setCopyButtonText('Erro!');
            setTimeout(() => {
                setCopyButtonText('Copiar');
            }, 2000);
        }
    };


    const handleSaveAll = () => {
        onSave(parsedData);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setTextValue('');
        setParsedData([]);
        setError('');
        setCopyButtonText('Copiar');
        onClose();
    };

    if (!isOpen) return null;

    const inputStyle = "w-full bg-background text-text-primary p-1 rounded border-transparent focus:border-accent focus:ring-accent";
    const selectStyle = `${inputStyle}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-card text-text-primary rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-semibold">Importar Transações</h3>
                    <button onClick={handleCloseModal} className="text-text-secondary hover:opacity-75 p-2 rounded-full">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto bg-background">
                    <div className="p-6 space-y-4">
                        <div className="flex gap-4 border-b border-border-color pb-4">
                            <button onClick={() => setImportType('json')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${importType === 'json' ? 'bg-accent text-white' : 'bg-background text-text-secondary hover:opacity-80'}`}>
                                <FileJson size={16}/> Importar JSON
                            </button>
                            <button onClick={() => setImportType('csv')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${importType === 'csv' ? 'bg-accent text-white' : 'bg-background text-text-secondary hover:opacity-80'}`}>
                               <FileSpreadsheet size={16}/> Importar CSV
                            </button>
                        </div>

                        {importType === 'json' ? (
                            <div>
                                <label htmlFor="jsonInput" className="block text-sm font-medium text-text-secondary">Cole o conteúdo JSON aqui:</label>
                                <textarea 
                                    id="jsonInput"
                                    className="w-full h-24 p-2 mt-1 font-mono text-sm border rounded-md bg-background text-text-primary border-border-color focus:ring-accent focus:border-accent"
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    placeholder='[{"description": "Exemplo", ...}]'
                                />
                                <details className="mt-2 text-xs">
                                    <summary className="cursor-pointer text-text-secondary hover:underline">Ver exemplo de JSON</summary>
                                    <div className="relative mt-2">
                                        <button
                                            type="button"
                                            onClick={handleCopyExample}
                                            className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs bg-card hover:opacity-80 rounded-md text-text-secondary z-10"
                                        >
                                            <Copy size={12} />
                                            {copyButtonText}
                                        </button>
                                        <pre className="p-2 bg-background rounded-md overflow-x-auto text-text-primary">
                                            <code>{JSON.stringify(jsonExample, null, 2)}</code>
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="csvInput" className="block text-sm font-medium text-text-secondary">Carregue um ficheiro CSV:</label>
                                <input
                                    id="csvInput"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30"
                                />
                                <p className="mt-2 text-xs text-text-secondary">
                                    O CSV deve ter as colunas: `description`, `type`, `planned`, `actual`, `date`, `paymentDate`, `dueDate`, `paid`, `isShared`, `isRecurring`.
                                </p>
                            </div>
                        )}
                        
                        {importType === 'json' && (
                            <button onClick={handleParse} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover">
                                <Upload size={16} /> Carregar e Validar Dados
                            </button>
                        )}

                        {error && <div className="text-red-500 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
                    </div>
                
                    <div className="px-6 pb-6">
                        <table className="w-full text-xs text-left table-auto">
                            <thead className="text-text-secondary uppercase bg-card sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 w-1/5">Descrição</th>
                                    <th className="p-2">Previsto</th>
                                    <th className="p-2">Efetivo</th>
                                    <th className="p-2">Data Lanç.</th>
                                    <th className="p-2">Data Pag.</th>
                                    <th className="p-2">Data Venc.</th>
                                    <th className="p-2">Tipo</th>
                                    <th className="p-2 text-center">Pago</th>
                                    <th className="p-2 text-center">Casa</th>
                                    <th className="p-2 text-center">Recorr.</th>
                                    <th className="p-2 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y border-border-color">
                                {parsedData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-1"><input type="text" value={item.description} onChange={e => handleDataChange(index, 'description', e.target.value)} className={inputStyle}/></td>
                                        <td className="p-1"><input type="number" value={item.planned} onChange={e => handleDataChange(index, 'planned', parseFloat(e.target.value))} className={inputStyle}/></td>
                                        <td className="p-1"><input type="number" value={item.actual} onChange={e => handleDataChange(index, 'actual', parseFloat(e.target.value))} className={inputStyle}/></td>
                                        <td className="p-1"><input type="date" value={item.date} onChange={e => handleDataChange(index, 'date', e.target.value)} className={inputStyle}/></td>
                                        <td className="p-1"><input type="date" value={item.paymentDate} onChange={e => handleDataChange(index, 'paymentDate', e.target.value)} className={inputStyle}/></td>
                                        <td className="p-1"><input type="date" value={item.dueDate} onChange={e => handleDataChange(index, 'dueDate', e.target.value)} className={inputStyle}/></td>
                                        <td className="p-1"><select value={item.type} onChange={e => handleDataChange(index, 'type', e.target.value)} className={selectStyle}><option value="expense">Despesa</option><option value="income">Receita</option></select></td>
                                        <td className="p-1 text-center"><input type="checkbox" checked={item.paid} onChange={e => handleDataChange(index, 'paid', e.target.checked)} className="h-5 w-5 rounded border-border-color text-accent focus:ring-accent"/></td>
                                        <td className="p-1 text-center"><input type="checkbox" checked={item.isShared} onChange={e => handleDataChange(index, 'isShared', e.target.checked)} className="h-5 w-5 rounded border-border-color text-accent focus:ring-accent"/></td>
                                        <td className="p-1 text-center"><input type="checkbox" checked={item.isRecurring} onChange={e => handleDataChange(index, 'isRecurring', e.target.checked)} className="h-5 w-5 rounded border-border-color text-accent focus:ring-accent"/></td>
                                        <td className="p-1 text-center">
                                            <button onClick={() => handleRemoveRow(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-border-color flex justify-end gap-4">
                    <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-text-primary bg-background rounded-lg hover:opacity-80 border border-border-color">
                        Cancelar
                    </button>
                    <button onClick={handleSaveAll} disabled={parsedData.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        <Check size={16}/> Salvar {parsedData.length} Itens
                    </button>
                </div>
            </div>
        </div>
    );
};