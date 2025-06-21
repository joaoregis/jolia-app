// src/lib/export.ts

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Transaction } from '../types';

/**
 * Função genérica para acionar o download de um ficheiro no navegador.
 * @param filename O nome do ficheiro a ser baixado.
 * @param content O conteúdo do ficheiro.
 * @param mimeType O tipo MIME do ficheiro.
 */
function downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporta uma lista de transações para formato JSON.
 */
export function exportAsJson(data: Transaction[], filename: string) {
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(`${filename}.json`, jsonString, 'application/json');
}

/**
 * Exporta uma lista de transações para formato CSV.
 */
export function exportAsCsv(data: Transaction[], filename: string) {
    const csvString = Papa.unparse(data);
    // Adiciona um BOM para garantir a codificação UTF-8 correta no Excel
    const BOM = '\uFEFF'; 
    downloadFile(`${filename}.csv`, BOM + csvString, 'text/csv;charset=utf-8;');
}

/**
 * Exporta uma lista de transações para formato XLSX (Excel).
 */
export function exportAsXlsx(data: Transaction[], filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
    
    // Gera o ficheiro e aciona o download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}
