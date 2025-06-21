// src/components/DateInput.tsx

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps {
    value: string; // Espera o formato "yyyy-MM-dd"
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    id: string;
    required?: boolean;
}

/**
 * Formata uma data do formato "yyyy-MM-dd" para "dd/MM/yyyy".
 * @param dateString A data no formato "yyyy-MM-dd".
 * @returns A data formatada como "dd/MM/yyyy" ou uma string vazia se a entrada for inválida.
 */
const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return 'Selecione uma data';
    }
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

/**
 * Um componente de input de data estilizado que exibe o formato dd/MM/yyyy
 * mas utiliza o seletor de data nativo do navegador.
 */
export const DateInput: React.FC<DateInputProps> = ({ value, onChange, name, id, required }) => {
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    // Função para abrir o seletor de data nativo
    const handleButtonClick = () => {
        try {
            dateInputRef.current?.showPicker();
        } catch (error) {
            console.error("Este navegador não suporta 'showPicker()'.", error);
            // Fallback para navegadores que não suportam showPicker (como Firefox)
            // Clicar no input diretamente ainda funciona.
        }
    };

    return (
        <div className="relative mt-1">
            {/* Elemento visível que o usuário clica */}
            <button
                type="button"
                onClick={handleButtonClick}
                className="w-full flex justify-between items-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700 px-3 py-3 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <span className="text-slate-900 dark:text-white">{formatDateForDisplay(value)}</span>
                <Calendar className="h-5 w-5 text-slate-400" />
            </button>

            {/* Input de data real, que fica escondido */}
            <input
                ref={dateInputRef}
                type="date"
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                // Estilo para esconder o input mas mantê-lo funcional
                className="opacity-0 absolute top-0 left-0 w-full h-full pointer-events-none"
            />
        </div>
    );
};
