'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { type ListasKind, listasScenes } from '@/motion/listas/moments';
import {
  LIST_W,
  LIST_X,
  LIST_Y,
  META_Y,
  rowHeight,
  SCREEN_H,
  SCREEN_W,
  type ScreenFrame,
  type ScreenSpec
} from '@/motion/listas/scene';

/** globals.css, dark appearance. */
type Rgba = [number, number, number, number];
const BG = '#000000';
const SURFACE = '#1c1c1e';
const TEXT: Rgba = [0xf5, 0xf5, 0xf7, 1];
const TEXT_2: Rgba = [0x8d, 0x8d, 0x93, 1];
const SEP = 'rgb(255 255 255 / 0.08)';
const SEP_STRONG: Rgba = [255, 255, 255, 0.18];
const NONE: Rgba = [0, 0, 0, 0];
const DONE: Rgba = [0x34, 0xd1, 0x78, 1];
const DANGER = '#ff5b61';
const INK = '#f5f5f7';
const ON_INK = '#111113';
const SANS =
  '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

const css = (c: Rgba) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${c[3]})`;

/** Colours interpolate premultiplied, as CSS transitions do. */
const mix = (a: Rgba, b: Rgba, p: number) => {
  const alpha = a[3] + (b[3] - a[3]) * p;
  if (alpha <= 0) return 'transparent';
  const channel = (i: number) =>
    ((a[i] ?? 0) * a[3] + ((b[i] ?? 0) * b[3] - (a[i] ?? 0) * a[3]) * p) /
    alpha;
  return `rgb(${channel(0)} ${channel(1)} ${channel(2)} / ${alpha})`;
};

const RING = { size: 20, stroke: 2.25 };
const RING_R = (RING.size - RING.stroke) / 2;
const RING_C = 2 * Math.PI * RING_R;
/** TypingIndicator: pb-1.5 under a 13 px line. */
const TYPING_H = 6 + 13 * 1.35;

type RowEls = {
  li: HTMLDivElement | null;
  inner: HTMLDivElement | null;
  button: HTMLDivElement | null;
  box: HTMLSpanElement | null;
  path: SVGPathElement | null;
  strike: HTMLSpanElement | null;
  byline: HTMLSpanElement | null;
  stepper: HTMLSpanElement | null;
  times: HTMLSpanElement | null;
  grip: HTMLSpanElement | null;
  backdrop: HTMLDivElement | null;
  trash: HTMLSpanElement | null;
  here: HTMLSpanElement | null;
};

/** The app's icons.tsx: 24-unit strokes in currentColor. */
const PATHS = {
  back: ['M15 5l-7 7 7 7'],
  bell: [
    'M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z',
    'M10 19a2 2 0 0 0 4 0'
  ],
  pin: [
    'M12 17v5',
    'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'
  ],
  share: ['M12 3v12M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7'],
  trash: ['M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  grip: ['M5 8h14M5 12h14M5 16h14']
};

function Icon({
  name,
  className = 'size-6',
  strokeWidth = 2
}: {
  name: keyof typeof PATHS;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name].map(d => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const setText = (el: Element | null | undefined, text: string) => {
  if (el && el.textContent !== text) el.textContent = text;
};

/**
 * ItemRow's Quantity on touch: "− n +" for more than one, else a faint "+";
 * once done, "×n" for more than one and nothing otherwise.
 */
function Quantity({
  quantity,
  stepper,
  times
}: {
  quantity: number;
  stepper: (el: HTMLSpanElement | null) => void;
  times: (el: HTMLSpanElement | null) => void;
}) {
  const muted = css(TEXT_2);
  return (
    <>
      <span ref={stepper} className="relative flex shrink-0 items-center">
        {quantity > 1 ? (
          <span
            className="flex h-8 items-center rounded-full"
            style={{ background: BG }}
          >
            <span
              className="grid h-8 w-7 place-items-center"
              style={{ color: muted }}
            >
              <Icon name="minus" className="size-3.5" strokeWidth={2.4} />
            </span>
            <span className="min-w-5 text-center font-semibold text-[15px] tabular-nums">
              {quantity}
            </span>
            <span
              className="grid h-8 w-7 place-items-center"
              style={{ color: muted }}
            >
              <Icon name="plus" className="size-3.5" strokeWidth={2.4} />
            </span>
          </span>
        ) : (
          // .qty-add on touch: always there, at half opacity.
          <span
            className="grid size-8 place-items-center rounded-full"
            style={{ color: muted, opacity: 0.5 }}
          >
            <Icon name="plus" className="size-3.5" strokeWidth={2.4} />
          </span>
        )}
      </span>
      <span
        ref={times}
        className="flex shrink-0 items-center px-2 text-[15px] tabular-nums"
        style={{ color: muted, display: 'none' }}
      >
        ×{quantity}
      </span>
    </>
  );
}

/**
 * Listas' list screen in dark appearance, laid out as the app lays it out
 * at 390 px. Every element is placed per frame from the scene; nothing here
 * animates on its own.
 */
function ListScreen({
  items,
  peers,
  register
}: ScreenSpec & {
  register: (draw: (frame: ScreenFrame) => void) => void;
}) {
  const screen = useRef<HTMLDivElement>(null);
  const rows = useRef<Record<string, Partial<RowEls>>>({});
  const list = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const ringCheck = useRef<SVGSVGElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const clear = useRef<HTMLSpanElement>(null);
  const unpin = useRef<HTMLSpanElement>(null);
  const remove = useRef<HTMLSpanElement>(null);
  const avatars = useRef<Record<string, HTMLSpanElement | null>>({});
  const typing = useRef<HTMLDivElement>(null);
  const typingText = useRef<HTMLSpanElement>(null);
  const dots = useRef<Record<string, HTMLSpanElement | null>>({});
  const toast = useRef<HTMLDivElement>(null);
  const undo = useRef<HTMLSpanElement>(null);
  const finger = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    register(f => {
      if (screen.current) screen.current.style.opacity = String(f.fade);

      for (const item of items) {
        const r = f.rows[item.id];
        const el = rows.current[item.id];
        if (!r || !el?.li) continue;
        el.li.style.display = r.mounted ? '' : 'none';
        if (!r.mounted) continue;
        el.li.style.zIndex = String(r.index);
        el.li.style.boxShadow = `0 10px 30px rgb(0 0 0 / ${0.16 * r.shadow})`;
        // Quantity: a stepper while open, "×n" once done when there is more than one.
        if (el.stepper) el.stepper.style.display = r.done ? 'none' : '';
        if (el.times)
          el.times.style.display =
            r.done && (item.quantity ?? 1) > 1 ? '' : 'none';
        if (el.grip) el.grip.style.visibility = r.grip ? '' : 'hidden';
        el.li.style.transform = `translateY(${r.y + r.shift}px)`;
        el.li.style.height = `${r.height}px`;
        el.li.style.opacity = String(r.opacity);
        el.li.style.borderBottomWidth = r.border ? '1px' : '0';
        if (el.inner) el.inner.style.transform = `translateX(${r.x}px)`;
        if (el.button) el.button.style.transform = `scale(${r.press})`;
        if (el.box) {
          el.box.style.transform = `scale(${r.pop})`;
          el.box.style.borderColor = mix(SEP_STRONG, DONE, r.box);
          el.box.style.background = mix(NONE, DONE, r.box);
        }
        if (el.path) el.path.style.strokeDashoffset = String(1 - r.check);
        if (el.strike) {
          el.strike.style.backgroundSize = `${r.strike * 100}% 1.5px`;
          el.strike.style.color = mix(TEXT, TEXT_2, r.dim);
        }
        if (el.byline) {
          el.byline.style.display = r.byline ? '' : 'none';
          setText(el.byline, r.byline ?? '');
        }
        if (el.backdrop) el.backdrop.style.opacity = String(r.backdrop);
        if (el.trash) el.trash.style.transform = `scale(${r.trash})`;
        if (el.here) {
          el.here.style.opacity = String(r.here?.opacity ?? 0);
          if (r.here) el.here.style.setProperty('--peer', r.here.color);
        }
      }

      if (list.current) list.current.style.height = `${f.listHeight}px`;
      arc.current?.setAttribute(
        'stroke-dashoffset',
        String(RING_C * (1 - f.ring))
      );
      if (ringCheck.current) {
        const s = f.ringCheck;
        ringCheck.current.style.opacity = String(Math.min(1, Math.max(0, s)));
        ringCheck.current.style.transform = `scale(${0.5 + 0.5 * s})`;
      }
      setText(count.current, f.count);

      // Under the list: "Limpar concluídos" pushes the others down as it mounts.
      const below = LIST_Y + f.listFlow + 16;
      if (clear.current) {
        clear.current.style.display = f.clear > 0 ? '' : 'none';
        clear.current.style.opacity = String(f.clear);
        clear.current.style.top = `${below}px`;
      }
      const after = below + (f.clear > 0 ? 44 : 0);
      if (unpin.current) unpin.current.style.top = `${after}px`;
      if (remove.current) remove.current.style.top = `${after + 44}px`;

      for (const peer of peers) {
        const a = f.avatars[peer.id];
        const el = avatars.current[peer.id];
        if (!el) continue;
        el.style.display = a?.mounted ? '' : 'none';
        if (!a?.mounted) continue;
        el.style.opacity = String(a.opacity);
        el.style.transform = `translateX(${a.x}px) scale(${a.scale})`;
      }

      if (typing.current) {
        typing.current.style.height = `${f.typing.open * TYPING_H}px`;
        typing.current.style.opacity = String(f.typing.open);
      }
      setText(typingText.current, f.typing.text);
      const order = Object.keys(f.typing.dots);
      for (const peer of peers) {
        const el = dots.current[peer.id];
        if (!el) continue;
        const i = order.indexOf(peer.id);
        el.style.display = i === -1 ? 'none' : '';
        el.style.order = String(i);
        el.style.marginLeft = i > 0 ? '2px' : '0';
        el.style.opacity = String(f.typing.dots[peer.id] ?? 1);
      }

      if (toast.current) {
        toast.current.style.display = f.toast ? '' : 'none';
        if (f.toast) {
          toast.current.style.opacity = String(f.toast.opacity);
          toast.current.style.transform = `translateX(-50%) translateY(${f.toast.y}px) scale(${f.toast.scale})`;
          if (undo.current)
            undo.current.style.transform = `scale(${f.toast.press})`;
        }
      }

      if (finger.current) {
        finger.current.style.display = f.finger ? '' : 'none';
        if (f.finger) {
          finger.current.style.opacity = String(f.finger.opacity);
          finger.current.style.transform = `translate(${f.finger.x - 20}px, ${f.finger.y - 20}px)`;
        }
      }
    });
  }, [register]);

  const ref =
    <K extends keyof RowEls>(id: string, key: K) =>
    (el: RowEls[K]) => {
      rows.current[id] ??= {};
      (rows.current[id] as Partial<RowEls>)[key] = el;
    };

  return (
    <div
      ref={screen}
      className="relative shrink-0 overflow-hidden"
      style={{
        width: SCREEN_W,
        height: SCREEN_H,
        background: BG,
        color: css(TEXT),
        font: `400 17px/1.35 ${SANS}`
      }}
    >
      {/* TopBar: back home; notifications, pin, share. */}
      <div
        className="absolute inset-x-0 flex items-center px-2 font-medium"
        style={{ top: 0, height: 48 }}
      >
        <span className="-ml-1 flex h-10 items-center pr-3 pl-1">
          <Icon name="back" strokeWidth={2.4} />
          Listas
        </span>
        <span className="ml-auto flex gap-1">
          {(['bell', 'pin', 'share'] as const).map(name => (
            <span key={name} className="grid size-11 place-items-center">
              <Icon name={name} />
            </span>
          ))}
        </span>
      </div>

      <h3
        className="absolute"
        style={{
          left: LIST_X + 4,
          top: 52,
          font: `700 34px/1.1 ${SANS}`,
          color: css(TEXT),
          letterSpacing: '-0.02em'
        }}
      >
        Mercado
      </h3>

      {/* Progress, count, and whoever else is here. */}
      <div
        className="absolute flex items-center gap-2.5 text-[15px]"
        style={{ left: LIST_X, top: META_Y, height: 22, color: css(TEXT_2) }}
      >
        <span
          className="relative inline-grid place-items-center"
          style={{ width: RING.size, height: RING.size }}
        >
          <svg
            width={RING.size}
            height={RING.size}
            viewBox={`0 0 ${RING.size} ${RING.size}`}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={RING.size / 2}
              cy={RING.size / 2}
              r={RING_R}
              fill="none"
              stroke={css(SEP_STRONG)}
              strokeWidth={RING.stroke}
            />
            <circle
              ref={arc}
              cx={RING.size / 2}
              cy={RING.size / 2}
              r={RING_R}
              fill="none"
              stroke={css(DONE)}
              strokeWidth={RING.stroke}
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C}
            />
          </svg>
          <svg
            ref={ringCheck}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              width: RING.size * 0.55,
              height: RING.size * 0.55,
              opacity: 0,
              color: css(DONE)
            }}
            fill="none"
            stroke="currentColor"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        </span>
        <span ref={count} className="tabular-nums">
          0 de 4
        </span>
      </div>
      {peers.map(peer => (
        <span
          key={peer.id}
          ref={el => {
            avatars.current[peer.id] = el;
          }}
          className="absolute left-0 grid size-[22px] place-items-center rounded-full font-semibold text-[11px] text-white uppercase leading-none"
          style={{
            top: META_Y,
            display: 'none',
            background: peer.color,
            boxShadow: `0 0 0 2px ${BG}`
          }}
        >
          {peer.name.charAt(0)}
        </span>
      ))}

      {/* The ul: overflow-hidden, so its drawn height clips the rows. */}
      <div
        ref={list}
        // Isolated, so the rows' paint order stays under the touch.
        className="absolute isolate overflow-hidden rounded-2xl"
        style={{
          left: LIST_X,
          top: LIST_Y,
          width: LIST_W,
          background: SURFACE
        }}
      >
        {items.map(item => (
          <div
            key={item.id}
            ref={ref(item.id, 'li')}
            className="absolute inset-x-0 top-0 overflow-hidden"
            style={{
              height: rowHeight(item.by),
              borderBottom: `1px solid ${SEP}`
            }}
          >
            <div
              ref={ref(item.id, 'backdrop')}
              className="absolute inset-0 flex items-center justify-end pr-7 text-white"
              style={{ background: DANGER, opacity: 0 }}
            >
              <span ref={ref(item.id, 'trash')} className="block">
                <Icon name="trash" className="size-5" />
              </span>
            </div>
            <div
              ref={ref(item.id, 'inner')}
              className="relative flex items-stretch"
              style={{ background: SURFACE }}
            >
              <span
                ref={ref(item.id, 'here')}
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: 0,
                  background:
                    'color-mix(in srgb, var(--peer, transparent) 7%, transparent)'
                }}
              >
                <span
                  className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full"
                  style={{ background: 'var(--peer, transparent)' }}
                />
              </span>
              <div
                ref={ref(item.id, 'button')}
                className="relative flex min-h-14 min-w-0 flex-1 items-start gap-3.5 py-3.5 pr-2 pl-4"
              >
                <span
                  ref={ref(item.id, 'box')}
                  className="mt-px grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px]"
                  style={{ borderColor: css(SEP_STRONG) }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-3.5"
                    fill="none"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path
                      ref={ref(item.id, 'path')}
                      pathLength={1}
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="#fff"
                      style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                    />
                  </svg>
                </span>
                <span className="min-w-0 pt-px">
                  <span
                    ref={ref(item.id, 'strike')}
                    className="break-words"
                    style={{
                      backgroundImage:
                        'linear-gradient(currentColor, currentColor)',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: '0 55%',
                      backgroundSize: '0% 1.5px'
                    }}
                  >
                    {item.text}
                  </span>
                  <span
                    ref={ref(item.id, 'byline')}
                    className="mt-0.5 block text-[13px]"
                    style={{
                      color: css(TEXT_2),
                      display: item.by ? undefined : 'none'
                    }}
                  >
                    {item.by}
                  </span>
                </span>
              </div>
              <Quantity
                quantity={item.quantity ?? 1}
                stepper={ref(item.id, 'stepper')}
                times={ref(item.id, 'times')}
              />
              {/* The grip; on touch the desktop × after it takes no room. */}
              <span
                ref={ref(item.id, 'grip')}
                className="grid w-9 shrink-0 place-items-center"
                style={{ color: 'rgb(141 141 147 / 0.7)' }}
              >
                <Icon name="grip" className="size-5" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <span
        ref={clear}
        className="absolute flex h-10 items-center px-3 font-medium text-[15px]"
        style={{ left: LIST_X + 4, display: 'none', color: css(TEXT_2) }}
      >
        Limpar concluídos
      </span>
      <span
        ref={unpin}
        className="absolute flex h-10 items-center px-3 font-medium text-[15px]"
        style={{ left: LIST_X + 4, color: css(TEXT_2) }}
      >
        Tirar da tela inicial
      </span>
      <span
        ref={remove}
        className="absolute flex h-10 items-center px-3 font-medium text-[15px]"
        style={{ left: LIST_X + 4, color: DANGER }}
      >
        Apagar lista
      </span>

      {/* Composer, with who else is typing above the field. */}
      <div
        className="absolute inset-x-0 bottom-0 px-4 pt-2 pb-3"
        style={{ background: 'rgb(0 0 0 / 0.85)' }}
      >
        <div ref={typing} className="overflow-hidden" style={{ height: 0 }}>
          <div
            className="flex items-center gap-1.5 px-4 pb-1.5 text-[13px]"
            style={{ color: css(TEXT_2) }}
          >
            <span className="flex">
              {peers.map(peer => (
                <span
                  key={peer.id}
                  ref={el => {
                    dots.current[peer.id] = el;
                  }}
                  className="size-1.5 rounded-full"
                  style={{ background: peer.color, display: 'none' }}
                />
              ))}
            </span>
            <span ref={typingText} className="truncate" />
          </div>
        </div>
        <div
          className="flex h-11 items-center rounded-full border px-4"
          style={{
            borderColor: css(SEP_STRONG),
            background: SURFACE,
            color: css(TEXT_2)
          }}
        >
          Novo item
        </div>
      </div>

      {/* Toast, from the top. */}
      <div
        ref={toast}
        className="absolute left-1/2 flex h-11 items-center gap-3 whitespace-nowrap rounded-full pr-2 pl-4 font-medium text-[15px] shadow-[0_8px_30px_rgb(0_0_0/0.18)]"
        style={{ top: 12, display: 'none', background: INK, color: ON_INK }}
      >
        <span>Item removido</span>
        <span
          ref={undo}
          className="flex h-8 items-center rounded-full px-3 font-semibold"
          style={{ background: 'rgb(17 17 19 / 0.15)' }}
        >
          Desfazer
        </span>
      </div>

      {/* A touch, as the Simulator shows them. Not part of the app. */}
      <span
        ref={finger}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 size-10 rounded-full"
        style={{
          display: 'none',
          background: 'rgb(255 255 255 / 0.22)',
          boxShadow: 'inset 0 0 0 1.5px rgb(255 255 255 / 0.45)'
        }}
      />
    </div>
  );
}

/** Space between two phones, and the name over each. */
const GAP = 48;
const LABEL_H = 40;

/**
 * The moment's screens side by side, scaled together to fit the stage: one
 * phone, or two when the moment is about what someone else sees.
 */
export function LiveListas({
  kind,
  onDraw
}: {
  kind: ListasKind;
  onDraw: (draw: (t: number) => void) => void;
}) {
  const scene = useMemo(() => listasScenes[kind](), [kind]);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const draws = useRef<((frame: ScreenFrame) => void)[]>([]);
  const n = scene.screens.length;
  const labelled = scene.screens.some(s => s.owner);
  const width = n * SCREEN_W + (n - 1) * GAP;
  const height = SCREEN_H + (labelled ? LABEL_H : 0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const k =
        Math.min(el.clientWidth / width, el.clientHeight / height) * 0.88;
      if (stage.current) stage.current.style.transform = `scale(${k})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  const registers = useMemo(
    () =>
      scene.screens.map((_, i) => (draw: (frame: ScreenFrame) => void) => {
        draws.current[i] = draw;
      }),
    [scene]
  );

  useEffect(() => {
    onDraw(t => {
      scene.frame(t).forEach((frame, i) => {
        draws.current[i]?.(frame);
      });
    });
  }, [scene, onDraw]);

  return (
    <div
      ref={box}
      className="relative size-full overflow-hidden"
      style={{ background: BG }}
    >
      <div
        ref={stage}
        className="absolute top-1/2 left-1/2 flex origin-center"
        style={{
          width,
          height,
          gap: GAP,
          marginLeft: -width / 2,
          marginTop: -height / 2
        }}
      >
        {scene.screens.map((screen, i) => (
          <div key={screen.owner?.id ?? i} className="flex flex-col">
            {screen.owner && (
              <span
                className="flex items-center justify-center gap-2.5 font-medium text-[22px]"
                style={{
                  height: LABEL_H,
                  color: css(TEXT_2),
                  font: `500 22px ${SANS}`
                }}
              >
                <span
                  className="size-3 rounded-full"
                  style={{ background: screen.owner.color }}
                />
                {screen.owner.name}
              </span>
            )}
            <ListScreen {...screen} register={registers[i] ?? (() => {})} />
          </div>
        ))}
      </div>
    </div>
  );
}
