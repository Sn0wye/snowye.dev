import type { AppLocale } from '@/i18n/routing';

export type Projects = {
  year: number;
  projects: Project[];
}[];

export interface Project {
  id: string;
  title: string;
  url: string;
  description?: Record<AppLocale, string>;
  iconName?: string;
  stats?: string;
  featured: boolean;
}

export const projects: Projects = [
  {
    year: 2026,
    projects: [
      {
        id: 'e6096f40-9bf4-4a75-bceb-910f2af61de9',
        title: 'Paytrack',
        url: 'https://paytrack.com.br',
        description: {
          en: 'A platform for corporate travel and expense management.',
          pt: 'Plataforma de gestão de viagens e despesas corporativas.'
        },
        iconName: 'credit-card',
        featured: true
      },
      {
        id: 'd927829b-514e-40d5-a732-3bbcea05b5a4',
        title: 'CloudCertify',
        url: 'https://cloudcertify.snowye.dev',
        description: {
          en: 'A platform to help you prepare for cloud certifications with practice exams, and progress tracking.',
          pt: 'Plataforma para se preparar para certificações em nuvem com simulados e acompanhamento de progresso.'
        },
        iconName: 'cloud',
        featured: true
      }
    ]
  },
  {
    year: 2025,
    projects: [
      {
        id: 'af02f8ed-5c06-4993-a4e5-996db2d48472',
        title: 'Bradesco',
        url: 'https://banco.bradesco',
        description: {
          en: 'The bank with the most clients in Brazil.',
          pt: 'O banco com mais clientes no Brasil.'
        },
        iconName: 'bank',
        featured: false
      }
    ]
  },
  {
    year: 2024,
    projects: [
      {
        id: '7c75cb9e-91ec-4da2-9b01-58e59750b899',
        title: 'Mundo Invest',
        url: 'https://mundoinvest.com.br',
        description: {
          en: 'A platform that guides your investments and financial planning to achieve your goals.',
          pt: 'Plataforma que orienta seus investimentos e planejamento financeiro para alcançar seus objetivos.'
        },
        iconName: 'coins',
        featured: false
      }
    ]
  },
  {
    year: 2023,
    projects: [
      {
        id: 'c3db7b4b-6efa-4bb9-8028-28ee3cafe3a7',
        title: 'Topdek Informática',
        url: 'https://www.topdekinformatica.com.br/',
        description: {
          en: 'Informatics store.',
          pt: 'Loja de informática.'
        },
        iconName: 'store',
        featured: false
      },
      {
        id: '0de56908-98a2-42e5-a7e3-ea3928f21f0b',
        title: 'BNT Global',
        url: 'https://globalparaguay.com/',
        description: {
          en: 'Vapes/Miscellaneous store.',
          pt: 'Loja de vapes e variedades.'
        },
        iconName: 'store',
        featured: false
      }
    ]
  },
  {
    year: 2022,
    projects: [
      {
        id: '33117c18-5dc0-4ab4-a717-d36f4661904d',
        title: 'Smart Store',
        url: 'https://smartstore.com.py/',
        description: {
          en: 'E-commerce for a cosmetics store.',
          pt: 'E-commerce de uma loja de cosméticos.'
        },
        iconName: 'store',
        featured: false
      },

      {
        id: 'e8cd5863-f2ac-47a3-943e-1ab98ffbd997',
        title: 'Flash Importados',
        url: 'https://flashimportados.com/',
        description: {
          en: 'Store specialized in sweets, various foods, beverages, and cosmetics.',
          pt: 'Loja especializada em doces, alimentos, bebidas e cosméticos.'
        },
        iconName: 'store',
        featured: false
      },
      {
        id: '7cd1cb16-4f40-4360-b4fd-168b174b7f6e',
        title: 'Nitecore Outdoor',
        url: 'https://nitecoreoutdoor.com.py/category/edc-everday-carry-series',
        description: {
          en: 'Official Nitecore distributor: flashlights and outdoor gear.',
          pt: 'Distribuidor oficial Nitecore: lanternas e equipamentos outdoor.'
        },
        iconName: 'store',
        featured: false
      }
      // {
      //   id: '70fd55f4-4b6d-4024-b611-d52d8ef34ceb',
      //   title: 'iFinance',
      //   url: 'https://ifinance.snowye.dev',
      //   description: 'Finances app to keep track of your gains and dispenses',
      //   iconName: 'savings'
      // },
      // {
      //   id: '8853fe16-122d-4b1f-9faf-381c26375a00',
      //   title: 'Spaces',
      //   url: 'https://spaces.snowye.dev/',
      //   description:
      //     'A simple and straightforward todo app to get your tasks done best.',
      //   iconName: 'assignment'
      // }

      // {
      //   title: 'Snowye UI (WIP)',
      //   url: 'https://snowye-ui.snowye.dev/',
      //   description: 'React Powered, accessible Component UI.',
      //   iconName: 'snowye-ui'
      // }
    ]
  },
  {
    year: 2021,
    projects: [
      {
        id: '76637bd1-38dd-4e52-8310-c73b7210178e',
        title: 'Sunflex S.A.',
        url: 'https://sunflexsa.com.py/',
        description: {
          en: 'Fishing articles store.',
          pt: 'Loja de artigos de pesca.'
        },
        iconName: 'store',
        featured: false
      },

      {
        id: 'b65eb1bb-2a18-4d50-a967-4676ff809710',
        title: 'Jack Center',
        url: 'https://farmaciajackcenter.com.py/',
        description: {
          en: 'Supplements store.',
          pt: 'Loja de suplementos.'
        },
        iconName: 'store',
        featured: false
      },
      {
        id: 'ca1f1c6a-ede8-4921-a3d4-d7ff5cd48ba0',
        title: 'Visão VIP',
        url: 'https://www.visaovip.com/',
        description: {
          en: 'Informatics store.',
          pt: 'Loja de informática.'
        },
        iconName: 'store',
        featured: false
      }
    ]
  },
  {
    year: 2020,
    projects: [
      {
        id: '9d6af6d0-7bd6-44eb-adf8-68afa586d0d4',
        title: 'Sunflex Sport',
        url: 'https://sunflexsport.com/',
        description: {
          en: 'Fishing articles store.',
          pt: 'Loja de artigos de pesca.'
        },
        iconName: 'store',
        featured: false
      },
      {
        id: '9a50806a-5795-48b8-8a31-b5e54df99e2f',
        title: 'Maruri Fishing',
        url: 'https://marurifishing.com.py/',
        description: {
          en: 'Fishing equipment store.',
          pt: 'Loja de equipamentos de pesca.'
        },
        iconName: 'store',
        featured: false
      }
    ]
  }
];

type Craft = {
  id: string;
  title: string;
  url: string;
  description?: Record<AppLocale, string>;
  iconName?: string;
};

export const crafts: {
  year: number;
  crafts: Craft[];
}[] = [
  {
    year: 2024,
    crafts: [
      {
        id: '570ec5fb-60ef-48bb-b827-b173f0bd9353',
        title: 'Investment Comparator',
        url: 'https://investment-comparator.vercel.app',
        description: {
          en: 'A comparator for Brazilian fixed-income investments (CDB, LCI, LCA).',
          pt: 'Comparador de investimentos de renda fixa brasileiros (CDB, LCI, LCA).'
        },
        iconName: 'savings'
      },
      {
        id: '932d4363-ae5d-41c8-a2d6-3328e2afeaef',
        title: 'Onboarding',
        url: 'https://onboarding-mocha-eight.vercel.app',
        description: {
          en: 'An onboarding animation.',
          pt: 'Uma animação de onboarding.'
        }
      }
    ]
  }
];
