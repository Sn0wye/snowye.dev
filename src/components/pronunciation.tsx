'use client';

import { useRef, useState } from 'react';
import { RiPauseCircleFill, RiPlayCircleFill } from 'react-icons/ri';

export function Pronunciation() {
  const pronunciationAudio = useRef<HTMLMediaElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePronunciation = () => {
    if (
      pronunciationAudio.current !== null &&
      pronunciationAudio.current?.duration > 0 &&
      !pronunciationAudio.current?.paused
    ) {
      setIsPlaying(false);
      pronunciationAudio.current?.pause();
    } else {
      setIsPlaying(true);
      void pronunciationAudio.current?.play();
    }
  };

  return (
    <button
      className="relative top-[2px] mx-1 transform-none cursor-pointer border-none bg-transparent p-0 text-primary transition-transform duration-200 ease-in-out hover:scale-110"
      role="button"
      aria-label="How to pronounce my name"
      onClick={togglePronunciation}
    >
      {isPlaying ? <RiPauseCircleFill /> : <RiPlayCircleFill />}
      <audio
        src="/static/audio/pronunciation.mp3"
        ref={pronunciationAudio}
        onEnded={() => setIsPlaying(false)}
      />
    </button>
  );
}
