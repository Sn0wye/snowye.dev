export type Projects = {
  year: string;
  projects: Project[];
}[];

export interface Project {
  id: string;
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  stats?: string;
}

export const projects: Projects = [
  {
    year: '2022',
    projects: [
      {
        id: 'abe5780c-1ff2-4b9c-a2ac-f39d799e3b77',
        title: 'Personal Portfolio',
        url: 'https://github.com/Sn0wye/snowye.dev',
        description: "This portfolio. It's open souce!",
        iconName: 'book'
      },
      {
        id: '70fd55f4-4b6d-4024-b611-d52d8ef34ceb',
        title: 'iFinance',
        url: 'https://ifinance.snowye.dev',
        description: 'Finances app to keep track of your gains and dispenses',
        iconName: 'savings'
      },
      {
        id: '8853fe16-122d-4b1f-9faf-381c26375a00',
        title: 'Spaces',
        url: 'https://spaces.snowye.dev/',
        description:
          'A simple and straightforward todo app to get your tasks done best.',
        iconName: 'assignment'
      },
      // {
      //   title: 'duque.dev',
      //   url: 'https://duque.dev',
      //   description: 'Portfolio developed for Felipe Duque.',
      //   iconName: 'bolt'
      // },
      {
        id: '98c9094e-8a53-47db-900f-b9a52cfe1d8d',
        title: 'Coffee Delivery',
        url: 'https://coffee-delivery-pied.vercel.app/',
        description: "One of the first applications I've done."
      }
      // {
      //   title: 'Snowye UI (WIP)',
      //   url: 'https://snowye-ui.snowye.dev/',
      //   description: 'React Powered, accessible Component UI.',
      //   iconName: 'snowye-ui'
      // }
    ]
  }
];
