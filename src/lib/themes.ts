// src/lib/themes.ts

export interface Theme {
  name: string;
  variables: {
    '--background': string;
    '--card': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--accent': string;
    '--accent-hover': string;
    '--border-color': string;
  };
}

export interface ThemePalette {
  [key: string]: Theme;
}

export const themes: ThemePalette = {
  // CORREÇÃO: "Noite Estrelada" agora é o tema 'default'
  default: {
    name: 'Padrão Escuro',
    variables: {
      '--background': '#0f172a', // slate-900
      '--card': '#1e293b',       // slate-800
      '--text-primary': '#f8fafc', // slate-50
      '--text-secondary': '#94a3b8', // slate-400
      '--accent': '#3b82f6',      // blue-500
      '--accent-hover': '#60a5fa', // blue-400
      '--border-color': '#334155', // slate-700
    }
  },
  // CORREÇÃO: O antigo tema 'default_light' agora é uma opção selecionável
  padrao_claro: {
    name: 'Padrão Claro',
    variables: {
      '--background': '#f1f5f9', // slate-100
      '--card': '#ffffff',       // white
      '--text-primary': '#1f2937', // gray-800
      '--text-secondary': '#4b5563', // gray-600
      '--accent': '#2563eb',      // blue-600
      '--accent-hover': '#1d4ed8', // blue-700
      '--border-color': '#e5e7eb', // gray-200
    }
  },
  floresta_sombria: {
    name: 'Floresta Sombria',
    variables: {
      '--background': '#18261c', 
      '--card': '#223d2b',       
      '--text-primary': '#e8f5e9',
      '--text-secondary': '#a5d6a7',
      '--accent': '#66bb6a',      // green-400
      '--accent-hover': '#81c784', // green-300
      '--border-color': '#385741',
    }
  },
  ceu_de_verao: {
    name: 'Céu de Verão',
    variables: {
      '--background': '#eff6ff', // blue-50
      '--card': '#ffffff',       // white
      '--text-primary': '#1e3a8a', // blue-900
      '--text-secondary': '#6b7280', // gray-500
      '--accent': '#2563eb',      // blue-600
      '--accent-hover': '#1d4ed8', // blue-700
      '--border-color': '#dbeafe', // blue-100
    }
  },
  manha_de_nevoa: {
    name: 'Manhã de Névoa',
    variables: {
      '--background': '#f9fafb', // gray-50
      '--card': '#ffffff',       // white
      '--text-primary': '#111827', // gray-900
      '--text-secondary': '#6b7280', // gray-500
      '--accent': '#14b8a6',      // teal-500
      '--accent-hover': '#0d9488', // teal-600
      '--border-color': '#e5e7eb', // gray-200
    }
  },
  ametista_noturna: {
    name: 'Ametista Noturna',
    variables: {
      '--background': '#2c1d3d', 
      '--card': '#432c5a',
      '--text-primary': '#f3e8ff',
      '--text-secondary': '#d8b4fe',
      '--accent': '#a855f7', // purple-500
      '--accent-hover': '#c084fc', // purple-400
      '--border-color': '#581c87', // purple-900
    }
  },
  vinho_do_porto: {
    name: 'Vinho do Porto',
    variables: {
      '--background': '#4c1d24',
      '--card': '#772d3a',
      '--text-primary': '#fee2e2',
      '--text-secondary': '#fca5a5',
      '--accent': '#ef4444', // red-500
      '--accent-hover': '#f87171', // red-400
      '--border-color': '#881337', // rose-900
    }
  },
  doce_algodao: {
    name: 'Doce Algodão',
    variables: {
      '--background': '#fdf2f8', // pink-50
      '--card': '#ffffff',       // white
      '--text-primary': '#831843', // pink-900
      '--text-secondary': '#be185d', // pink-700
      '--accent': '#ec4899',      // pink-500
      '--accent-hover': '#db2777', // pink-600
      '--border-color': '#fbcfe8', // pink-200
    }
  },
  por_do_sol_rosa: {
    name: 'Pôr do Sol Rosa',
    variables: {
      '--background': '#fff7ed', // orange-50
      '--card': '#ffffff',
      '--text-primary': '#7c2d12', // orange-900
      '--text-secondary': '#9a3412', // orange-800
      '--accent': '#f97316',      // orange-500
      '--accent-hover': '#ea580c', // orange-600
      '--border-color': '#fed7aa', // orange-200
    }
  },
  energia_solar: {
    name: 'Energia Solar',
    variables: {
      '--background': '#fffbeb', // yellow-50
      '--card': '#ffffff',
      '--text-primary': '#78350f', // amber-900
      '--text-secondary': '#b45309', // amber-700
      '--accent': '#f59e0b',      // amber-500
      '--accent-hover': '#d97706', // amber-600
      '--border-color': '#fde68a', // amber-200
    }
  },
   brisa_citrica: {
    name: 'Brisa Cítrica',
    variables: {
      '--background': '#f7fee7', // lime-50
      '--card': '#ffffff',
      '--text-primary': '#365314', // lime-900
      '--text-secondary': '#4d7c0f', // lime-700
      '--accent': '#84cc16',      // lime-500
      '--accent-hover': '#65a30d', // lime-600
      '--border-color': '#d9f99d', // lime-200
    }
  },
};
