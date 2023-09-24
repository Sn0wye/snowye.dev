import { useRef, type Dispatch, type SetStateAction } from 'react';
import { motion } from 'framer-motion';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import type { Project } from '../../data/projects';

interface FeaturedProjectProps {
  project: Project;
  onHover: Dispatch<SetStateAction<string>>;
  isHovered: boolean;
}

export function FeaturedProject({
  project,
  onHover,
  isHovered
}: FeaturedProjectProps) {
  const { title, url, description, iconName, stats } = project;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const icon = require(`../../../public/static/icons/${iconName}.json`);
  const iconRef = useRef<LottieRefCurrentProps | null>(null);

  return (
    <motion.a
      className="relative flex min-w-[200px] flex-col rounded-lg border-0 p-5 no-underline transition-opacity duration-200 ease-in-out hover:opacity-100 md:w-[180px] md:max-w-[8.75rem]"
      href={url}
      target="_blank"
      onHoverStart={() => onHover(title)}
      onHoverEnd={() => onHover('')}
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
      <div className="flex-[1_1_auto]">
        <h3 className="m-0 mb-1 p-0 text-lg text-primary">{title}</h3>
        <p className="m-0 leading-6">{description}</p>
        {stats && (
          <span className="mt-1 inline-block text-xs font-medium uppercase tracking-wider text-primary">
            {stats}
          </span>
        )}
      </div>
      {isHovered && (
        <motion.span
          className="absolute inset-0 -z-10 rounded-lg bg-hover"
          layoutId="projects"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.a>
  );
}
