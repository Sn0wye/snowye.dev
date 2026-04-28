'use client';

import TypewriterEffect from 'typewriter-effect';

type TypewriterProps = {
  strings: string;
};

export const Typewriter = ({ strings }: TypewriterProps) => {
  return (
    <TypewriterEffect
      options={{
        strings,
        autoStart: true,
        delay: 16
      }}
    />
  );
};
