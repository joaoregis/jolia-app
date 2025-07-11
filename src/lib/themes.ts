// src/lib/themes.ts

export interface Theme {
  name: string;
  variables: {
    '--background': string;
    '--sidebar': string;
    '--card': string;
    '--table-header': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--accent': string;
    '--accent-hover': string;
    '--border': string;
  };
}

export interface ThemePalette {
  [key: string]: Theme;
}

export const themes: ThemePalette = {
  default: {
    name: 'Padrão Escuro',
    variables: {
      '--background': '#0f172a',    // slate-900
      '--sidebar': '#1e293b',       // slate-800
      '--card': '#162033',          
      '--table-header': '#1e293b',  
      '--text-primary': '#f8fafc',    // slate-50
      '--text-secondary': '#94a3b8',  // slate-400
      '--accent': '#3b82f6',         // blue-500
      '--accent-hover': '#60a5fa',    // blue-400
      '--border': '#283447',         // Cor da borda suavizada
    }
  },
  padrao_claro: {
    name: 'Padrão Claro',
    variables: {
      '--background': '#f1f5f9',    // slate-100
      '--sidebar': '#ffffff',       // white
      '--card': '#f8fafc',          // slate-50
      '--table-header': '#f1f5f9',  
      '--text-primary': '#1f2937',    // gray-800
      '--text-secondary': '#4b5563',  // gray-600
      '--accent': '#2563eb',         // blue-600
      '--accent-hover': '#1d4ed8',    // blue-700
      '--border': '#e5e7eb',         // gray-200
    }
  },
  floresta_sombria: {
    name: 'Floresta Sombria',
    variables: {
      '--background': '#18261c', 
      '--sidebar': '#223d2b',
      '--card': '#1c3324',
      '--table-header': '#223d2b',       
      '--text-primary': '#e8f5e9',
      '--text-secondary': '#a5d6a7',
      '--accent': '#66bb6a',      // green-400
      '--accent-hover': '#81c784', // green-300
      '--border': '#2a4a35',      // Cor da borda suavizada
    }
  },
  ceu_de_verao: {
    name: 'Céu de Verão',
    variables: {
      '--background': '#eff6ff', // blue-50
      '--sidebar': '#ffffff',
      '--card': '#e0f2fe',       // light-blue-100
      '--table-header': '#eff6ff',
      '--text-primary': '#1e3a8a', // blue-900
      '--text-secondary': '#6b7280', // gray-500
      '--accent': '#2563eb',      // blue-600
      '--accent-hover': '#1d4ed8', // blue-700
      '--border': '#dbeafe', // blue-100
    }
  },
  manha_de_nevoa: {
    name: 'Manhã de Névoa',
    variables: {
        '--background': '#f9fafb', // gray-50
        '--sidebar': '#ffffff',       // white
        '--card': '#f3f4f6', // gray-100
        '--table-header': '#f9fafb',
        '--text-primary': '#111827', // gray-900
        '--text-secondary': '#6b7280', // gray-500
        '--accent': '#14b8a6',      // teal-500
        '--accent-hover': '#0d9488', // teal-600
        '--border': '#e5e7eb', // gray-200
    }
  },
  ametista_noturna: {
    name: 'Ametista Noturna',
    variables: {
      '--background': '#2c1d3d', 
      '--sidebar': '#432c5a',
      '--card': '#3b2551',
      '--table-header': '#432c5a',
      '--text-primary': '#f3e8ff',
      '--text-secondary': '#d8b4fe',
      '--accent': '#a855f7', // purple-500
      '--accent-hover': '#c084fc', // purple-400
      '--border': '#50366b',      // Cor da borda suavizada
    }
  },
  vinho_do_porto: {
    name: 'Vinho do Porto',
    variables: {
      '--background': '#4c1d24',
      '--sidebar': '#772d3a',
      '--card': '#6b2834',
      '--table-header': '#772d3a',
      '--text-primary': '#fee2e2',
      '--text-secondary': '#fca5a5',
      '--accent': '#ef4444', // red-500
      '--accent-hover': '#f87171', // red-400
      '--border': '#881337', // rose-900
    }
  },
  doce_algodao: {
    name: 'Doce Algodão',
    variables: {
      '--background': '#fdf2f8', // pink-50
      '--sidebar': '#ffffff',
      '--card': '#fce7f3', // pink-100
      '--table-header': '#fdf2f8',
      '--text-primary': '#831843', // pink-900
      '--text-secondary': '#be185d', // pink-700
      '--accent': '#ec4899',      // pink-500
      '--accent-hover': '#db2777', // pink-600
      '--border': '#fbcfe8', // pink-200
    }
  },
  por_do_sol_rosa: {
    name: 'Pôr do Sol Rosa',
    variables: {
      '--background': '#fff7ed', // orange-50
      '--sidebar': '#ffffff',
      '--card': '#ffedd5', // orange-100
      '--table-header': '#fff7ed',
      '--text-primary': '#7c2d12', // orange-900
      '--text-secondary': '#9a3412', // orange-800
      '--accent': '#f97316',      // orange-500
      '--accent-hover': '#ea580c', // orange-600
      '--border': '#fed7aa', // orange-200
    }
  },
  energia_solar: {
    name: 'Energia Solar',
    variables: {
      '--background': '#fffbeb', // yellow-50
      '--sidebar': '#ffffff',
      '--card': '#fef3c7', // amber-100
      '--table-header': '#fffbeb',
      '--text-primary': '#78350f', // amber-900
      '--text-secondary': '#b45309', // amber-700
      '--accent': '#f59e0b',      // amber-500
      '--accent-hover': '#d97706', // amber-600
      '--border': '#fde68a', // amber-200
    }
  },
   brisa_citrica: {
    name: 'Brisa Cítrica',
    variables: {
      '--background': '#f7fee7', // lime-50
      '--sidebar': '#ffffff',
      '--card': '#ecfccb', // lime-100
      '--table-header': '#f7fee7',
      '--text-primary': '#365314', // lime-900
      '--text-secondary': '#4d7c0f', // lime-700
      '--accent': '#84cc16',      // lime-500
      '--accent-hover': '#65a30d', // lime-600
      '--border': '#d9f99d', // lime-200
    }
  },
};