'use client';

import { FeaturedProject } from '@/components/featured-project';
import { projects } from '@/data/projects';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const FeaturedProjects = () => {
  const featuredOrder = ['Mundo Invest', 'Personal Portfolio'];

  const [isHovered, setIsHovered] = useState('');
  const featuredProjects = projects
    .flatMap(i => i.projects.filter(p => p.featured))
    .sort(
      (a, b) => featuredOrder.indexOf(a.title) - featuredOrder.indexOf(b.title)
    );

  return (
    <motion.div className="-mb-5 mt-2.5 flex flex-col flex-wrap md:flex-row">
      {featuredProjects.map(item => (
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
