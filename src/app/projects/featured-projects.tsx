'use client';

import { FeaturedProject } from '@/components/featured-project';
import { motion } from 'framer-motion';
import { useState } from 'react';

type Projects = {
  year: string;
  projects: Project[];
}[];

interface Project {
  id: string;
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
          id: 'e442eb5a-a376-46f8-89c8-ed791c47eaa7',
          title: 'Personal Portfolio',
          url: 'https://github.com/Sn0wye/snowye.dev',
          description: "This portfolio. It's open source!",
          iconName: 'book'
        },
        {
          id: '1bbcdd1b-a515-466d-9500-0ea6b771abad',
          title: 'iFinance',
          url: 'https://ifinance.snowye.dev',
          description: 'Finances app to keep track of your gains and expenses',
          iconName: 'savings'
        },
        {
          id: 'aa72b287-91b8-42f0-b8e0-92d2dc883331',
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
          id: '3a002f5f-68b7-4497-86b3-ed3fff399010',
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
        .map(item => (
          <FeaturedProject
            key={item.id}
            project={item}
            onHover={setIsHovered}
            isHovered={item.title === isHovered}
          />
        ))}
    </motion.div>
  );
};
