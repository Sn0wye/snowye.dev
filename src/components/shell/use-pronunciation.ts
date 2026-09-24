'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SOURCE = '/static/audio/pronunciation.mp3';

/**
 * Plays the name recording and reports which of `syllables` is being spoken,
 * approximated from playback progress. `current` is -1 while idle.
 */
export function usePronunciation(syllables: number) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const play = useCallback(() => {
    audio.current ??= new Audio(SOURCE);
    const el = audio.current;
    el.currentTime = 0;
    const follow = () => {
      if (el.duration) setProgress(el.currentTime / el.duration);
      if (!el.paused && !el.ended)
        frame.current = requestAnimationFrame(follow);
    };
    el.onended = () => {
      cancelAnimationFrame(frame.current);
      setProgress(null);
    };
    setProgress(0);
    el.play()
      .then(() => {
        frame.current = requestAnimationFrame(follow);
      })
      .catch(() => setProgress(null));
  }, []);

  const current =
    progress === null
      ? -1
      : Math.min(syllables - 1, Math.floor(progress * syllables));

  return { play, playing: progress !== null, progress: progress ?? 0, current };
}
