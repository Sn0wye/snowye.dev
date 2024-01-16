'use client';

import { type ComponentProps, useRef, useState } from 'react';

const Play = (props: ComponentProps<'svg'>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5854L15.5008 12.3328C15.5447 12.3035 15.5824 12.2658 15.6117 12.2219C15.7343 12.0381 15.6846 11.7897 15.5008 11.6672L10.6219 8.41459Z"></path></svg>
  )
}

const Pause = (props: ComponentProps<'svg'>) => {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9 9V15H11V9H9ZM13 9V15H15V9H13Z"></path></svg>
  )
}

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
      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      <audio
        src="/static/audio/pronunciation.mp3"
        ref={pronunciationAudio}
        onEnded={() => setIsPlaying(false)}
      />
    </button>
  );
}
