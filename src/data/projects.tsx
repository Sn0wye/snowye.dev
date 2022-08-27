import { BsCardChecklist } from 'react-icons/bs';
import { FaIdBadge } from 'react-icons/fa';

export type Projects = {
  year: string;
  projects: Project[];
}[];

export interface Project {
  title: string;
  url: string;
  description?: string;
  icon?: JSX.Element;
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
        icon: <FaIdBadge />,
      },
      // {
      //   title: 'iFinance',
      //   url: 'https://', //TODO: Put the deploy link here
      //   description: 'Finances app to keep track of your gains and dispenses',
      //   icon: <RiMoneyDollarBoxFill />,
      // },
      {
        title: 'Spaces',
        url: 'https://spaces-todo.netlify.app',
        description:
          'A simple and straightforward todo app to get your tasks done best.',
        icon: <BsCardChecklist />,
      },
      {
        title: 'duque.dev',
        url: 'https://duque.dev',
        description: 'Portfolio developed for Felipe Duque.',
        icon: <FaIdBadge />,
      },
    ],
  },
];
