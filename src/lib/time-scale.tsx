'use client';

import type { Transition } from 'motion/react';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

/**
 * Playback speed for craft demos. 1 is real time; holding Shift drops to
 * a tenth, the way macOS slows its own animations, so any detail can be
 * studied mid-flight.
 */
type TimeScale = {
  scale: number;
  /** Speed picked from the controls; Shift overrides it while held. */
  chosen: number;
  setChosen: (scale: number) => void;
  shift: boolean;
};

const SHIFT_SCALE = 0.1;

const TimeScaleContext = createContext<TimeScale>({
  scale: 1,
  chosen: 1,
  setChosen: () => {},
  shift: false
});

export function TimeScaleProvider({ children }: { children: ReactNode }) {
  const [chosen, setChosen] = useState(1);
  const [shift, setShift] = useState(false);

  useEffect(() => {
    // Capitals in a text field are typing, not a request for slow motion.
    const onKey = (event: KeyboardEvent) =>
      setShift(
        event.shiftKey &&
          !(event.target as HTMLElement).closest?.('input, textarea')
      );
    const onBlur = () => setShift(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const value = useMemo(
    () => ({
      scale: shift ? SHIFT_SCALE : chosen,
      chosen,
      setChosen,
      shift
    }),
    [chosen, shift]
  );

  return (
    <TimeScaleContext.Provider value={value}>
      {/* CSS-driven motion reads the same speed through --time-scale. */}
      <div
        style={{ '--time-scale': value.scale } as React.CSSProperties}
        className="contents"
      >
        {children}
      </div>
    </TimeScaleContext.Provider>
  );
}

export const useTimeScale = () => useContext(TimeScaleContext);

/**
 * Stretches a transition in time. Durations and delays divide by the
 * scale; a physical spring keeps its shape by scaling stiffness by s² and
 * damping by s, which is the same curve played slower.
 */
export const scaleTransition = (
  transition: Transition,
  scale: number
): Transition => {
  if (scale === 1) return transition;
  const t = { ...transition } as Record<string, unknown>;
  if (typeof t.duration === 'number') t.duration = t.duration / scale;
  if (typeof t.delay === 'number') t.delay = t.delay / scale;
  if (typeof t.stiffness === 'number') t.stiffness = t.stiffness * scale ** 2;
  if (typeof t.damping === 'number') t.damping = t.damping * scale;
  if (typeof t.visualDuration === 'number')
    t.visualDuration = t.visualDuration / scale;
  return t as Transition;
};

/** `scaleTransition` bound to the current speed. */
export const useScaled = () => {
  const { scale } = useTimeScale();
  return (transition: Transition) => scaleTransition(transition, scale);
};
