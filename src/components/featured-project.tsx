import { motion } from 'framer-motion';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import { type Dispatch, type SetStateAction, useRef } from 'react';
import type { Project } from '../data/projects';

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
  const icon = require(`../../public/static/icons/${iconName}.json`);
  const iconRef = useRef<LottieRefCurrentProps | null>(null);

  return (
    <a
      className="flex w-auto rounded-lg border-0 no-underline hover:opacity-100 md:w-[11.25rem]"
      href={url}
      target="_blank"
      onMouseEnter={() => { onHover(title); iconRef.current?.play(); }}
      onMouseLeave={() => { onHover(''); iconRef.current?.stop(); }}
      rel="noreferrer"
    >
      <span className="relative w-full p-5">
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
      </span>
    </a>
  );
}
