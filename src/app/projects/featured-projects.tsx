'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FeaturedProject } from '@/components/featured-project';

type Projects = {
  year: string;
  projects: Project[];
}[];

interface Project {
  title: string;
  url: string;
  description?: string;
  iconName?: string;
  stats?: string;
}

interface FeaturedProjectsProps {
  featured: string[];
}

export const FeaturedProjects = ({ featured }: FeaturedProjectsProps) => {
  const [isHovered, setIsHovered] = useState('');

  const projects: Projects = [
    {
      year: '2022',
      projects: [
        {
          title: 'Personal Portfolio',
          url: 'https://github.com/Sn0wye/snowye.dev',
          description: "This portfolio. It's open source!",
          iconName: 'book'
        },
        {
          title: 'iFinance',
          url: 'https://ifinance.snowye.dev',
          description: 'Finances app to keep track of your gains and expenses',
          iconName: 'savings'
        },
        {
          title: 'Spaces',
          url: 'https://spaces.snowye.dev/',
          description:
            'A simple and straightforward todo app to get your tasks done best.',
          iconName: 'assignment'
        },
        // {
        //   title: 'duque.dev',
        //   url: 'https://duque.dev',
        //   description: t('duquedev.description'),
        //   iconName: 'bolt'
        // },
        {
          title: 'Coffee Delivery',
          url: 'https://coffee-delivery-pied.vercel.app/'
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

  return (
    <motion.div className="-mb-5 mt-2.5 flex flex-col flex-wrap md:flex-row">
      {projects
        .flatMap(item =>
          item.projects.filter(project => featured.includes(project.title))
        )
        .map((item, index) => (
          <FeaturedProject
            key={index}
            project={item}
            onHover={setIsHovered}
            isHovered={item.title === isHovered}
          />
        ))}
    </motion.div>
  );
};
