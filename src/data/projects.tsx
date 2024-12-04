export type Projects = {
  year: number;
  projects: Project[];
}[];

export interface Project {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  stats?: string;
  featured: boolean;
}

export const projects: Projects = [
  {
    year: 2024,
    projects: [
      {
        id: '7c75cb9e-91ec-4da2-9b01-58e59750b899',
        title: 'Mundo Invest',
        url: 'https://mundoinvest.com.br',
        description:
          'A platform that guides your investments and financial planning to achieve your goals.',
        iconName: 'coins',
        featured: true
      }
    ]
  },
  {
    year: 2023,
    projects: [
      {
        id: 'c3db7b4b-6efa-4bb9-8028-28ee3cafe3a7',
        title: 'Topdek Informática',
        url: 'https://topdek.com.br/',
        description: 'Informatics store.',
        iconName: 'store',
        featured: false
      },
      {
        id: '0de56908-98a2-42e5-a7e3-ea3928f21f0b',
        title: 'BNT Global',
        url: 'https://globalparaguay.com/',
        description: 'Vapes/Miscellaneous store.',
        iconName: 'store',
        featured: false
      }
    ]
  },
  {
    year: 2022,
    projects: [
      {
        id: '1',
        title: 'Personal Portfolio',
        url: 'https://github.com/Sn0wye/snowye.dev',
        description: "This portfolio. It's open souce!",
        iconName: 'book',
        featured: true
      },
      {
        id: '33117c18-5dc0-4ab4-a717-d36f4661904d',
        title: 'Smart Store',
        url: 'https://smartstore.com.py/',
        description: 'E-commerce for a cosmetics store.',
        iconName: 'store',
        featured: false
      },

      {
        id: 'e8cd5863-f2ac-47a3-943e-1ab98ffbd997',
        title: 'Flash Importados',
        url: 'https://flashimportados.com/',
        description:
          'Store specialized in sweets, various foods, beverages, and cosmetics.',
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
        description: 'Fishing articles store.',
        iconName: 'store',
        featured: false
      },

      {
        id: 'b65eb1bb-2a18-4d50-a967-4676ff809710',
        title: 'Jack Center',
        url: 'https://jackcenter.com.br/',
        description: 'Supplements store.',
        iconName: 'store',
        featured: false
      }
    ]
  },
  {
    year: 2020,
    projects: [
      {
        id: '3',
        title: 'Coffee Delivery',
        url: 'https://coffee-delivery-pied.vercel.app/',
        description: "One of the first applications I've done.",
        featured: false
      }
    ]
  }
];

type Craft = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export const crafts: {
  year: number;
  crafs: Craft[];
}[] = [
  {
    year: 2024,
    crafs: [
      {
        id: '932d4363-ae5d-41c8-a2d6-3328e2afeaef',
        title: 'Onboarding',
        url: 'https://onboarding-mocha-eight.vercel.app',
        description: 'A onboarding animation'
      }
    ]
  }
];
