import { useState } from 'react';
import { projects } from '../../../data/projects';
import { FeaturedProject } from '../../FeaturedProject';
import { StyledFeaturedProjects } from './styles';

interface FeaturedProjectsProps {
  featured: string[];
}

export const FeaturedProjects = ({ featured }: FeaturedProjectsProps) => {
  const [isHovered, setIsHovered] = useState('');

  return (
    <StyledFeaturedProjects>
      {projects
        .map((item) => {
          return item.projects.filter((project) =>
            featured.includes(project.title)
          );
        })
        .filter((item) => item.length > 0 && item)
        .flat()
        .map((item, index) => (
          <FeaturedProject
            key={index}
            project={item}
            onHover={setIsHovered}
            isHovered={item.title === isHovered}
          />
        ))}
    </StyledFeaturedProjects>
  );
};
