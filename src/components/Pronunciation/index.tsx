import { useRef, useState } from 'react';
import { RiPauseCircleFill, RiPlayCircleFill } from 'react-icons/ri';
import { Button } from './styles';

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
    <Button
      role='button'
      aria-label='How to pronounce my name'
      onClick={togglePronunciation}
    >
      {isPlaying ? <RiPauseCircleFill /> : <RiPlayCircleFill />}
      <audio
        src='/static/audio/pronunciation.mp3'
        ref={pronunciationAudio}
        onEnded={() => setIsPlaying(false)}
      />
    </Button>
  );
}
