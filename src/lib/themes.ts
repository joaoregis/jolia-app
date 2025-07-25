// src/lib/themes.ts

export interface Theme {
  name: string;
  variables: {
    '--background': string;
    '--sidebar': string;
    '--card': string;
    '--table-header': string;
    '--table-header-text': string;
    '--table-footer': string;
    '--table-footer-text': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--sidebar-text-primary': string;
    '--sidebar-text-secondary': string;
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
      '--background': '#0f172a',
      '--sidebar': '#1e293b',
      '--card': '#162033',
      '--table-header': '#1e293b',
      '--table-header-text': '#f8fafc',
      '--table-footer': '#1e293b',
      '--table-footer-text': '#f8fafc',
      '--text-primary': '#f8fafc',
      '--text-secondary': '#cbd5e1',
      '--sidebar-text-primary': '#f8fafc',
      '--sidebar-text-secondary': '#cbd5e1',
      '--accent': '#3b82f6',
      '--accent-hover': '#60a5fa',
      '--border': '#283447',
    }
  },
  padrao_claro: {
    name: 'Padrão Claro',
    variables: {
      '--background': '#f1f5f9',
      '--sidebar': '#ffffff',
      '--card': '#f8fafc',
      '--table-header': '#f1f5f9',
      '--table-header-text': '#1f2937',
      '--table-footer': '#e2e8f0',
      '--table-footer-text': '#1f2937',
      '--text-primary': '#1f2937',
      '--text-secondary': '#475569',
      '--sidebar-text-primary': '#1f2937',
      '--sidebar-text-secondary': '#475569',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--border': '#e5e7eb',
    }
  },
  // NOVOS TEMAS PASTEL
  jardim_de_algodao: {
    name: 'Jardim de Algodão',
    variables: {
      '--background': '#fdfdff',
      '--sidebar': '#fbfaff',
      '--card': '#ffffff',
      '--table-header': '#fbfaff',
      '--table-header-text': '#5b616a',
      '--table-footer': '#f4f2f7',
      '--table-footer-text': '#4a5058',
      '--text-primary': '#3e4249',
      '--text-secondary': '#787f89',
      '--sidebar-text-primary': '#3e4249',
      '--sidebar-text-secondary': '#787f89',
      '--accent': '#a6c1ee', // Azul Pastel
      '--accent-hover': '#b8d0f2',
      '--border': '#eef0f4',
    }
  },
  aurora_pessego: {
    name: 'Aurora Pêssego',
    variables: {
      '--background': '#fff9f6',
      '--sidebar': '#fff7f2',
      '--card': '#ffffff',
      '--table-header': '#fff7f2',
      '--table-header-text': '#6d5d52',
      '--table-footer': '#fdeee5',
      '--table-footer-text': '#63534a',
      '--text-primary': '#59493f',
      '--text-secondary': '#8b7d73',
      '--sidebar-text-primary': '#59493f',
      '--sidebar-text-secondary': '#8b7d73',
      '--accent': '#ffb28b', // Pêssego Pastel
      '--accent-hover': '#ffc3a3',
      '--border': '#fae5d9',
    }
  },
  serenidade_noturna: {
    name: 'Serenidade Noturna',
    variables: {
      '--background': '#232931',
      '--sidebar': '#2a313a',
      '--card': '#2f3844',
      '--table-header': '#2a313a',
      '--table-header-text': '#eef2f7',
      '--table-footer': '#2a313a',
      '--table-footer-text': '#eef2f7',
      '--text-primary': '#ffffff',
      '--text-secondary': '#b0b8c4',
      '--sidebar-text-primary': '#ffffff',
      '--sidebar-text-secondary': '#b0b8c4',
      '--accent': '#8eadd3', // Azul Cinza Pastel
      '--accent-hover': '#9eb8e0',
      '--border': '#3b4351',
    }
  },
  crepusculo_lavanda: {
    name: 'Crepúsculo Lavanda',
    variables: {
      '--background': '#2c2a3e',
      '--sidebar': '#34314c',
      '--card': '#3c3958',
      '--table-header': '#34314c',
      '--table-header-text': '#f2f2f8',
      '--table-footer': '#34314c',
      '--table-footer-text': '#f2f2f8',
      '--text-primary': '#ffffff',
      '--text-secondary': '#c4c2d4',
      '--sidebar-text-primary': '#ffffff',
      '--sidebar-text-secondary': '#c4c2d4',
      '--accent': '#c7b8ea', // Lavanda Pastel
      '--accent-hover': '#d4c7f0',
      '--border': '#48456a',
    }
  },
  // TEMAS ANTIGOS
  floresta_sombria: {
    name: 'Floresta Sombria',
    variables: {
      '--background': '#18261c',
      '--sidebar': '#223d2b',
      '--card': '#1c3324',
      '--table-header': '#223d2b',
      '--table-header-text': '#e8f5e9',
      '--table-footer': '#223d2b',
      '--table-footer-text': '#e8f5e9',
      '--text-primary': '#e8f5e9',
      '--text-secondary': '#c8e6c9',
      '--sidebar-text-primary': '#e8f5e9',
      '--sidebar-text-secondary': '#c8e6c9',
      '--accent': '#66bb6a',
      '--accent-hover': '#81c784',
      '--border': '#2a4a35',
    }
  },
  ceu_de_verao: {
    name: 'Céu de Verão',
    variables: {
      '--background': '#eff6ff',
      '--sidebar': '#ffffff',
      '--card': '#e0f2fe',
      '--table-header': '#eff6ff',
      '--table-header-text': '#1e3a8a',
      '--table-footer': '#dbeafe',
      '--table-footer-text': '#1e3a8a',
      '--text-primary': '#1e3a8a',
      '--text-secondary': '#1e40af',
      '--sidebar-text-primary': '#1e3a8a',
      '--sidebar-text-secondary': '#1e40af',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--border': '#dbeafe',
    }
  },
  manha_de_nevoa: {
    name: 'Manhã de Névoa',
    variables: {
        '--background': '#f9fafb',
        '--sidebar': '#ffffff',
        '--card': '#f3f4f6',
        '--table-header': '#f9fafb',
        '--table-header-text': '#111827',
        '--table-footer': '#e5e7eb',
        '--table-footer-text': '#111827',
        '--text-primary': '#111827',
        '--text-secondary': '#4b5563',
        '--sidebar-text-primary': '#111827',
        '--sidebar-text-secondary': '#4b5563',
        '--accent': '#14b8a6',
        '--accent-hover': '#0d9488',
        '--border': '#e5e7eb',
    }
  },
  ametista_noturna: {
    name: 'Ametista Noturna',
    variables: {
      '--background': '#2c1d3d',
      '--sidebar': '#432c5a',
      '--card': '#3b2551',
      '--table-header': '#432c5a',
      '--table-header-text': '#f3e8ff',
      '--table-footer': '#432c5a',
      '--table-footer-text': '#f3e8ff',
      '--text-primary': '#f3e8ff',
      '--text-secondary': '#e9d5ff',
      '--sidebar-text-primary': '#f3e8ff',
      '--sidebar-text-secondary': '#e9d5ff',
      '--accent': '#a855f7',
      '--accent-hover': '#c084fc',
      '--border': '#50366b',
    }
  },
  vinho_do_porto: {
    name: 'Vinho do Porto',
    variables: {
      '--background': '#4c1d24',
      '--sidebar': '#772d3a',
      '--card': '#6b2834',
      '--table-header': '#772d3a',
      '--table-header-text': '#fee2e2',
      '--table-footer': '#772d3a',
      '--table-footer-text': '#fee2e2',
      '--text-primary': '#fee2e2',
      '--text-secondary': '#fecaca',
      '--sidebar-text-primary': '#fee2e2',
      '--sidebar-text-secondary': '#fecaca',
      '--accent': '#ef4444',
      '--accent-hover': '#f87171',
      '--border': '#881337',
    }
  },
  doce_algodao: {
    name: 'Doce Algodão',
    variables: {
      '--background': '#fdf2f8',
      '--sidebar': '#ffffff',
      '--card': '#fce7f3',
      '--table-header': '#fdf2f8',
      '--table-header-text': '#831843',
      '--table-footer': '#fbcfe8',
      '--table-footer-text': '#831843',
      '--text-primary': '#831843',
      '--text-secondary': '#9d174d',
      '--sidebar-text-primary': '#831843',
      '--sidebar-text-secondary': '#9d174d',
      '--accent': '#ec4899',
      '--accent-hover': '#db2777',
      '--border': '#fbcfe8',
    }
  },
  por_do_sol_rosa: {
    name: 'Pôr do Sol Rosa',
    variables: {
      '--background': '#fff7ed',
      '--sidebar': '#ffffff',
      '--card': '#ffedd5',
      '--table-header': '#fff7ed',
      '--table-header-text': '#7c2d12',
      '--table-footer': '#fed7aa',
      '--table-footer-text': '#7c2d12',
      '--text-primary': '#7c2d12',
      '--text-secondary': '#9a3412',
      '--sidebar-text-primary': '#7c2d12',
      '--sidebar-text-secondary': '#9a3412',
      '--accent': '#f97316',
      '--accent-hover': '#ea580c',
      '--border': '#fed7aa',
    }
  },
  energia_solar: {
    name: 'Energia Solar',
    variables: {
      '--background': '#fffbeb',
      '--sidebar': '#ffffff',
      '--card': '#fef3c7',
      '--table-header': '#fffbeb',
      '--table-header-text': '#78350f',
      '--table-footer': '#fde68a',
      '--table-footer-text': '#78350f',
      '--text-primary': '#78350f',
      '--text-secondary': '#92400e',
      '--sidebar-text-primary': '#78350f',
      '--sidebar-text-secondary': '#92400e',
      '--accent': '#f59e0b',
      '--accent-hover': '#d97706',
      '--border': '#fde68a',
    }
  },
   brisa_citrica: {
    name: 'Brisa Cítrica',
    variables: {
      '--background': '#f7fee7',
      '--sidebar': '#ffffff',
      '--card': '#ecfccb',
      '--table-header': '#f7fee7',
      '--table-header-text': '#365314',
      '--table-footer': '#d9f99d',
      '--table-footer-text': '#365314',
      '--text-primary': '#365314',
      '--text-secondary': '#3f6212',
      '--sidebar-text-primary': '#365314',
      '--sidebar-text-secondary': '#3f6212',
      '--accent': '#84cc16',
      '--accent-hover': '#65a30d',
      '--border': '#d9f99d',
    }
  },
};