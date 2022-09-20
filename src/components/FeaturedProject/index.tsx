import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { Dispatch, SetStateAction, useRef } from 'react';
import type { Project } from '../../data/projects';
import {
  Body,
  Description,
  Hover,
  Project as StyledProject,
  Stats,
  Title
} from './styles';

interface FeaturedProjectProps {
  project: Project;
  onHover: Dispatch<SetStateAction<string>>;
  isHovered: boolean;
}

export function FeaturedProject({
  project,
  onHover,
  isHovered,
}: FeaturedProjectProps) {
  const {
    title,
    url,
    description,
    iconName,
    stats
  } = project;
  
  const icon = require(`../../../public/static/icons/${iconName}.json`)
  const iconRef = useRef<LottieRefCurrentProps | null>(null);
  
  return (
    <StyledProject
      href={url}
      target='_blank'
      onHoverStart={() => onHover(title)}
      onHoverEnd={() => onHover('')}
      data-testid='featuredProject'
      onMouseEnter={() => iconRef.current?.play()}
      onMouseLeave={() => iconRef.current?.stop()}
    >
      <Lottie
        lottieRef={iconRef}
        style={{ width: 24, height: 24, marginBottom: 10 }}
        animationData={icon}
        loop={false}
        autoplay={false}
        />
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