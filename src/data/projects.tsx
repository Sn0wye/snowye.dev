export type Projects = {
  year: string;
  projects: Project[];
}[];

export interface Project {
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
        title: 'Personal Portfolio',
        url: 'https://github.com/Sn0wye/snowye.dev',
        description: "This portfolio. It's open souce!",
        iconName: 'book',
      },
      {
        title: 'iFinance',
        url: 'https://ifinance.snowye.dev',
        description: 'Finances app to keep track of your gains and dispenses',
        iconName: 'savings',
      },
      {
        title: 'Spaces',
        url: 'https://spaces.snowye.dev/',
        description:
          'A simple and straightforward todo app to get your tasks done best.',
        iconName: 'assignment',
      },
      {
        title: 'duque.dev',
        url: 'https://duque.dev',
        description: 'Portfolio developed for Felipe Duque.',
        iconName: 'bolt',
      },
      {
        title: 'Coffee Delivery',
        url: 'https://coffee-delivery-pied.vercel.app/'
      }
    ],
  },
];
