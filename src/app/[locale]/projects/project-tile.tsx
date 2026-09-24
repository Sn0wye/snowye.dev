'use client';

import type { LottieRefCurrentProps } from 'lottie-react';
import { ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { type PointerEvent, useRef } from 'react';
import { Specimen } from './specimen';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type ProjectTileProps = {
  title: string;
  note: string;
  url: string;
  description?: string;
  iconName?: string;
};

/** A project as a specimen: the card leans toward the pointer and its icon plays. */
export function ProjectTile({
  title,
  note,
  url,
  description,
  iconName
}: ProjectTileProps) {
  const card = useRef<HTMLDivElement>(null);
  const icon = useRef<LottieRefCurrentProps | null>(null);
  const animation = iconName
    ? require(`../../../../public/static/icons/${iconName}.json`)
    : null;

  const onMove = (event: PointerEvent<HTMLElement>) => {
    const el = card.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 12}deg) scale(1.02)`;
  };

  const onLeave = () => {
    if (card.current) card.current.style.transform = '';
    icon.current?.stop();
  };

  return (
    <Specimen
      title={title}
      note={note}
      href={url}
      onPointerEnter={() => icon.current?.play()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <ArrowUpRight
        aria-hidden
        className="absolute top-4 right-4 size-4 text-secondary/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
      <div
        ref={card}
        className="flex flex-col items-center px-8 text-center transition-transform duration-200 ease-out"
      >
        {animation ? (
          <Lottie
            lottieRef={icon}
            animationData={animation}
            loop={false}
            autoplay={false}
            style={{ width: 40, height: 40 }}
            className="mb-4"
          />
        ) : null}
        <p className="text-[1.5rem] font-medium tracking-[-0.03em] text-primary">
          {title}
        </p>
        {description && (
          <p className="mt-2 line-clamp-3 text-secondary">{description}</p>
        )}
        <p className="mt-4 text-[12px] text-secondary/50 transition-colors group-hover:text-secondary">
          {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </p>
      </div>
    </Specimen>
  );
}
