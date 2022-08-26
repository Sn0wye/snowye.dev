import { Dispatch, SetStateAction } from 'react';
import type { Project } from '../../data/projects';
import {
  Body,
  Description,
  Hover,
  Project as StyledProject,
  Stats,
  Title,
} from './styles';

interface FeaturedProjectProps extends Project {
  onHover: Dispatch<SetStateAction<string>>;
  isHovered: boolean;
}

export function FeaturedProject({
  title,
  url,
  description,
  icon,
  stats,
  onHover,
  isHovered,
}: FeaturedProjectProps) {
  return (
    <StyledProject
      href={url}
      target='_blank'
      onHoverStart={() => onHover(title)}
      onHoverEnd={() => onHover('')}
      data-testid='featuredProject'
    >
      {icon && icon}
      <Body>
        <Title>{title}</Title>
        <Description>{description}</Description>
        {stats && <Stats>{stats}</Stats>}
      </Body>
      {isHovered && (
        <Hover
          layoutId='projects'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </StyledProject>
  );
}
