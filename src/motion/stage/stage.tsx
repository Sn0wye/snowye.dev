'use client';

import { Pause, Play, StepBack, StepForward } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react';

import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { useTimeScale } from '@/lib/time-scale';
import { type ListasKind, listasScenes } from '@/motion/listas/moments';
import type { LiveKind, Recording } from '@/motion/registry';
import { duration as amountDuration } from '@/motion/splitty/amount';
import { duration as chartsDuration } from '@/motion/splitty/charts';
import {
  type CoinTimeline,
  curveFor,
  loader,
  settledCoin,
  splash
} from '@/motion/splitty/timelines';

import { type Clock, useClock, useRefreshRate } from './clock';
import { LiveAmount } from './live-amount';
import { LiveCharts } from './live-charts';
import { LiveCoin } from './live-coin';
import { LiveListas } from './live-listas';

const coinTimelines: Partial<Record<LiveKind, () => CoinTimeline>> = {
  'settled-coin': settledCoin,
  splash,
  loader
};

const isListas = (kind: LiveKind): kind is ListasKind => kind in listasScenes;

const listasDurations = Object.fromEntries(
  Object.entries(listasScenes).map(([kind, scene]) => [kind, scene().duration])
) as Record<ListasKind, number>;

const durationOf = (kind: LiveKind) =>
  isListas(kind)
    ? listasDurations[kind]
    : kind === 'charts'
      ? chartsDuration
      : (coinTimelines[kind]?.().duration ?? amountDuration);

/** The app's background in dark appearance. */
const APP_BACKGROUND = '#09090b';

/**
 * Where each moment last was, by slug and view. A tile writes it every
 * frame; the expanded stage reads it on mount, so opening a moment carries
 * on from the frame you clicked instead of starting over.
 */
const lastTime = new Map<string, number>();

export type StageCopy = {
  live: string;
  recording: string;
  play: string;
  pause: string;
  speed: string;
  frameBack: string;
  frameForward: string;
};

const SPEEDS = [1, 0.25, 0.1];

/* -------------------------------------------------------------------------- */
/* Views                                                                       */
/* -------------------------------------------------------------------------- */

/** The live port, drawn every display frame from its pure timeline. */
function LiveView({
  kind,
  speed,
  active,
  timeKey,
  onClock
}: {
  kind: LiveKind;
  speed: number;
  active: boolean;
  timeKey: string;
  onClock?: (clock: Clock) => void;
}) {
  const coin = useMemo(() => coinTimelines[kind]?.(), [kind]);
  const drawRef = useRef<(t: number) => void>(() => {});
  const clock = useClock({
    duration: durationOf(kind),
    speed,
    active,
    initial: lastTime.get(timeKey) ?? 0,
    draw: t => {
      lastTime.set(timeKey, t);
      drawRef.current(t);
    }
  });
  const time = clock.time;
  const register = useCallback(
    (draw: (t: number) => void) => {
      drawRef.current = draw;
      draw(time());
    },
    [time]
  );

  const onClockRef = useRef(onClock);
  onClockRef.current = onClock;
  useEffect(() => {
    onClockRef.current?.(clock);
  });

  if (isListas(kind)) return <LiveListas kind={kind} onDraw={register} />;
  if (kind === 'amount') return <LiveAmount onDraw={register} />;
  if (kind === 'charts') return <LiveCharts onDraw={register} />;
  if (!coin) return null;
  return kind === 'splash' ? (
    <LiveCoin
      timeline={coin}
      cut="reversed"
      ground="#f2542d"
      ink="#ffffff"
      onDraw={register}
    />
  ) : (
    <LiveCoin
      timeline={coin}
      ground={APP_BACKGROUND}
      ink={kind === 'loader' ? '#f2542d' : undefined}
      onDraw={register}
    />
  );
}

/** The clip as recorded: AV1 where the browser decodes it, H.264 otherwise. */
function RecordingView({
  project,
  recording,
  speed,
  active,
  timeKey,
  onVideo
}: {
  project: string;
  recording: Recording;
  speed: number;
  active: boolean;
  timeKey: string;
  onVideo?: (el: HTMLVideoElement) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const base = `/static/motion/${project}/${recording.name}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    onVideo?.(el);
    const resume = () => {
      el.currentTime = lastTime.get(timeKey) ?? 0;
    };
    if (el.readyState >= 1) resume();
    else el.addEventListener('loadedmetadata', resume, { once: true });
    const remember = () => lastTime.set(timeKey, el.currentTime);
    el.addEventListener('timeupdate', remember);
    return () => el.removeEventListener('timeupdate', remember);
  }, [timeKey, onVideo]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  return (
    <div className="flex size-full items-center justify-center bg-black">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={`${base}.webp`}
        width={recording.width}
        height={recording.height}
        className="h-full w-auto max-w-full object-contain"
      >
        <source
          src={`${base}.av1.mp4`}
          type='video/mp4; codecs="av01.0.05M.08"'
        />
        <source src={`${base}.h264.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tile: plays on its own while visible                                        */
/* -------------------------------------------------------------------------- */

export function MomentTile({
  slug,
  kind,
  project,
  recording,
  className
}: {
  slug: string;
  kind?: LiveKind;
  project: string;
  recording?: Recording;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const { scale } = useTimeScale();
  const active = inView && !reduced;

  return (
    <motion.div
      ref={ref}
      layoutId={`frame-${slug}`}
      transition={{ type: 'spring', bounce: 0.12, duration: 0.5 }}
      style={{ borderRadius: 16 }}
      className={cn('relative overflow-hidden', className)}
    >
      {kind ? (
        <LiveView
          kind={kind}
          speed={scale}
          active={active}
          timeKey={`${slug}:live`}
        />
      ) : recording ? (
        <RecordingView
          project={project}
          recording={recording}
          speed={scale}
          active={active}
          timeKey={`${slug}:recording`}
        />
      ) : null}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage: the expanded player                                                  */
/* -------------------------------------------------------------------------- */

export function MomentStage({
  slug,
  project,
  live,
  recording,
  copy,
  frameClassName
}: {
  slug: string;
  project: string;
  live?: LiveKind;
  recording?: Recording;
  copy: StageCopy;
  frameClassName?: string;
}) {
  const [view, setView] = useState<'live' | 'recording'>(
    live ? 'live' : 'recording'
  );
  const { chosen, setChosen, scale } = useTimeScale();
  const [playing, setPlaying] = useState(true);
  const hz = useRefreshRate();
  const clock = useRef<Clock | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const scrub = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const head = useRef<SVGLineElement>(null);
  const coin = useMemo(
    () => (live ? coinTimelines[live]?.() : undefined),
    [live]
  );
  const liveDuration = live ? durationOf(live) : 0;

  const show = useCallback((t: number, total: number) => {
    const fraction = total ? t / total : 0;
    if (scrub.current) scrub.current.value = String(fraction);
    if (readout.current)
      readout.current.textContent = `${(t * 1000).toFixed(0).padStart(4, '0')} ms`;
    head.current?.setAttribute('x1', String(fraction * CURVE_W));
    head.current?.setAttribute('x2', String(fraction * CURVE_W));
  }, []);

  // Live: follow the clock.
  const unsubscribe = useRef<(() => void) | null>(null);
  const onClock = useCallback(
    (c: Clock) => {
      if (clock.current === c) return;
      clock.current = c;
      unsubscribe.current?.();
      unsubscribe.current = c.subscribe(t => show(t, liveDuration));
    },
    [show, liveDuration]
  );
  useEffect(() => () => unsubscribe.current?.(), []);

  // Recording: follow decoded frames, not timeupdate, so the playhead moves
  // once per video frame.
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const onVideo = useCallback((el: HTMLVideoElement) => {
    video.current = el;
    setVideoEl(el);
  }, []);
  useEffect(() => {
    if (view !== 'recording' || !videoEl) return;
    type FrameVideo = HTMLVideoElement & {
      requestVideoFrameCallback?: (
        cb: (now: number, meta: { mediaTime: number }) => void
      ) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };
    const v = videoEl as FrameVideo;
    if (v.requestVideoFrameCallback) {
      let handle = 0;
      const onFrame = (_: number, meta: { mediaTime: number }) => {
        show(meta.mediaTime, v.duration || 0);
        handle = v.requestVideoFrameCallback?.(onFrame) ?? 0;
      };
      handle = v.requestVideoFrameCallback(onFrame);
      return () => v.cancelVideoFrameCallback?.(handle);
    }
    const onTime = () => show(v.currentTime, v.duration || 0);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [view, videoEl, show]);

  const togglePlay = () => setPlaying(p => !p);

  const seek = (fraction: number) => {
    if (view === 'live') clock.current?.seek(fraction * liveDuration);
    else if (video.current)
      video.current.currentTime = fraction * (video.current.duration || 0);
  };

  const step = (direction: 1 | -1) => {
    setPlaying(false);
    if (view === 'live') {
      // One frame at the display's own rate.
      const frame = 1 / (hz ?? 60);
      clock.current?.seek((clock.current?.time() ?? 0) + direction * frame);
    } else if (video.current) {
      video.current.pause();
      video.current.currentTime = Math.max(
        0,
        video.current.currentTime + direction / (recording?.fps ?? 60)
      );
    }
  };

  // The live rate is measured, not assumed; until it is known, say only "live".
  const fpsLabel =
    view === 'live'
      ? hz
        ? `${hz} fps · ${copy.live}`
        : copy.live
      : `${recording?.fps ?? 60} fps · ${copy.recording}`;

  return (
    <div data-dismiss className="flex w-full flex-col items-center gap-4">
      <motion.div
        layoutId={`frame-${slug}`}
        transition={{ type: 'spring', bounce: 0.12, duration: 0.5 }}
        style={{ borderRadius: 28 }}
        className={cn(
          'relative overflow-hidden bg-[#0c0b10] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.08]',
          frameClassName
        )}
      >
        {view === 'live' && live ? (
          <LiveView
            kind={live}
            speed={scale}
            active={playing}
            timeKey={`${slug}:live`}
            onClock={onClock}
          />
        ) : recording ? (
          <RecordingView
            project={project}
            recording={recording}
            speed={scale}
            active={playing}
            timeKey={`${slug}:recording`}
            onVideo={onVideo}
          />
        ) : null}
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 font-mono text-[11px] text-white/90 tabular-nums ring-1 ring-white/10 backdrop-blur-md">
          {fpsLabel}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { delay: 0.15, duration: 0.3 }
        }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
        className="flex w-full max-w-[34rem] flex-col gap-2"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 text-[12px]">
          {live && recording && (
            <Segmented
              label="View"
              value={view}
              onChange={v => {
                setView(v as 'live' | 'recording');
                setPlaying(true);
              }}
              options={[
                { value: 'live', label: copy.live },
                { value: 'recording', label: copy.recording }
              ]}
            />
          )}
          <IconButton
            label={playing ? copy.pause : copy.play}
            onClick={togglePlay}
          >
            {playing ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </IconButton>
          <IconButton label={copy.frameBack} onClick={() => step(-1)}>
            <StepBack className="size-3.5" />
          </IconButton>
          <IconButton label={copy.frameForward} onClick={() => step(1)}>
            <StepForward className="size-3.5" />
          </IconButton>
          <Segmented
            label={copy.speed}
            value={String(chosen)}
            onChange={v => setChosen(Number(v))}
            options={SPEEDS.map(s => ({ value: String(s), label: `${s}×` }))}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={scrub}
            type="range"
            min={0}
            max={1}
            step={0.0005}
            defaultValue={0}
            aria-label="Scrub"
            onPointerDown={() => setPlaying(false)}
            onInput={event => seek(Number(event.currentTarget.value))}
            className="scrubber flex-1"
          />
          <span
            ref={readout}
            className="w-14 text-right font-mono text-[11px] text-secondary/70 tabular-nums"
          >
            0000 ms
          </span>
        </div>
        {view === 'live' && coin && <CurveChart timeline={coin} head={head} />}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

const CURVE_W = 640;

/**
 * The moment's values over its whole duration, with a playhead that follows
 * the stage. Separation is the cut, scale is the coin; marks are the
 * instants the Swift code schedules.
 */
function CurveChart({
  timeline,
  head
}: {
  timeline: CoinTimeline;
  head: React.RefObject<SVGLineElement | null>;
}) {
  const H = 72;
  const pad = 6;
  const series = useMemo(() => {
    const sep = curveFor(timeline, 'separation');
    const scale = curveFor(timeline, 'scale');
    const toX = (t: number) => (t / timeline.duration) * CURVE_W;
    const toY = (v: number, lo: number, hi: number) =>
      pad + (1 - (v - lo) / (hi - lo)) * (H - pad * 2);
    const path = (pts: { t: number; v: number }[], lo: number, hi: number) =>
      pts
        .map(
          (p, i) =>
            `${i ? 'L' : 'M'}${toX(p.t).toFixed(1)},${toY(p.v, lo, hi).toFixed(1)}`
        )
        .join(' ');
    const sLo = Math.min(...scale.map(p => p.v));
    const sHi = Math.max(...scale.map(p => p.v));
    return {
      separation: path(sep, 0, Math.max(1.15, ...sep.map(p => p.v))),
      scale: sHi - sLo < 1e-6 ? null : path(scale, sLo - 0.02, sHi + 0.02),
      marks: timeline.marks.map(m => ({ ...m, x: toX(m.at) }))
    };
  }, [timeline]);

  return (
    <div className="mt-1 rounded-xl bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/[0.05] ring-inset">
      <svg
        viewBox={`0 0 ${CURVE_W} ${H}`}
        className="h-auto w-full overflow-visible"
        aria-hidden
      >
        {series.marks.map(m => (
          <g key={m.label}>
            <line
              x1={m.x}
              x2={m.x}
              y1={0}
              y2={H}
              stroke="rgb(255 255 255 / 0.12)"
              strokeDasharray="2 3"
            />
            <text
              x={m.x + 4}
              y={9}
              fill="rgb(255 255 255 / 0.4)"
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              {m.label}
            </text>
          </g>
        ))}
        <path
          d={series.separation}
          fill="none"
          stroke="#f2542d"
          strokeWidth={1.5}
        />
        {series.scale && (
          <path
            d={series.scale}
            fill="none"
            stroke="#4ade80"
            strokeWidth={1.5}
          />
        )}
        <line
          ref={head}
          x1={0}
          x2={0}
          y1={0}
          y2={H}
          stroke="rgb(255 255 255 / 0.8)"
        />
      </svg>
      <div className="mt-1.5 flex gap-4 font-mono text-[10px] text-secondary/70">
        <span className="flex items-center gap-1.5">
          <span className="h-px w-3 bg-[#f2542d]" /> separation
        </span>
        {series.scale && (
          <span className="flex items-center gap-1.5">
            <span className="h-px w-3 bg-[#4ade80]" /> scale
          </span>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full text-primary ring-1 ring-white/[0.08] ring-inset transition-colors hover:bg-white/[0.06]"
    >
      {children}
    </button>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <fieldset
      aria-label={label}
      className="flex h-8 items-center rounded-full p-0.5 ring-1 ring-white/[0.08] ring-inset"
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative isolate h-full rounded-full px-3 transition-colors',
              selected ? 'text-primary' : 'text-secondary hover:text-primary'
            )}
          >
            {selected && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring.snappy}
                className="absolute inset-0 -z-10 rounded-full bg-white/[0.09]"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
