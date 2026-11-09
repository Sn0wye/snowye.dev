'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { type YtdKind, ytdScenes } from '@/motion/ytd/moments';
import { COLS, type Key, type Line, ROWS, type Tone } from '@/motion/ytd/trail';

/** pkg/ui's lipgloss colours, on a dark terminal. */
const FG = '#e4e4e7';
const BG = '#111015';
const tones: Record<Tone, string> = {
  accent: 'color:#ff4d4d',
  rail: 'color:#4a4a55',
  dim: 'color:#8b8b96',
  bold: `color:#fafafa;font-weight:700`,
  ok: 'color:#4ade80',
  track: 'color:#33333d',
  badge: 'color:#fff;background:#ff4d4d;font-weight:700',
  prompt: 'color:#8b8b96'
};

const LINE = 20;
const PAD_X = 18;
const PAD_Y = 14;
const TITLE_H = 34;

/**
 * Box drawing and the trail's shapes are drawn in CSS, the way a terminal
 * draws them itself, so the rail joins up between rows and nothing depends
 * on which fallback font has ◒ or ◇.
 */
const cells: Record<string, string> = {
  '│': 'v',
  '┌': 'dr',
  '└': 'ur',
  '╸': 'hh',
  '◒': 'sp sp0',
  '◐': 'sp sp1',
  '◓': 'sp sp2',
  '◑': 'sp sp3',
  '◇': 'dia',
  '◆': 'dia fill',
  '▲': 'tri',
  '●': 'dot fill',
  '○': 'dot'
};

const CSS = `
.yt-c{display:inline-block;position:relative;width:1ch;height:${LINE}px;vertical-align:top;text-align:center}
.yt-c::before,.yt-c::after{content:'';position:absolute}
.yt-v::before{left:calc(50% - .7px);width:1.4px;top:0;bottom:0;background:currentColor}
.yt-dr::before{left:calc(50% - .7px);width:1.4px;top:calc(50% - .7px);bottom:0;background:currentColor}
.yt-dr::after{left:calc(50% - .7px);right:0;top:calc(50% - .7px);height:1.4px;background:currentColor}
.yt-ur::before{left:calc(50% - .7px);width:1.4px;top:0;bottom:calc(50% - .7px);background:currentColor}
.yt-ur::after{left:calc(50% - .7px);right:0;top:calc(50% - .7px);height:1.4px;background:currentColor}
.yt-hv{display:inline-block;height:${LINE}px;vertical-align:top;background:linear-gradient(currentColor,currentColor) left center/100% 3px no-repeat}
.yt-hh::before{left:0;width:50%;top:calc(50% - 1.5px);height:3px;background:currentColor}
.yt-sp::before{left:calc(50% - .32em);top:calc(50% - .32em);width:.64em;height:.64em;box-sizing:border-box;border:1.4px solid currentColor;border-radius:50%}
.yt-sp0::before{background:linear-gradient(to top,currentColor 50%,transparent 50%)}
.yt-sp1::before{background:linear-gradient(to right,currentColor 50%,transparent 50%)}
.yt-sp2::before{background:linear-gradient(to bottom,currentColor 50%,transparent 50%)}
.yt-sp3::before{background:linear-gradient(to left,currentColor 50%,transparent 50%)}
.yt-dia::before{left:calc(50% - .24em);top:calc(50% - .24em);width:.48em;height:.48em;box-sizing:border-box;border:1.4px solid currentColor;transform:rotate(45deg)}
.yt-dia.yt-fill::before{background:currentColor}
.yt-tri::before{left:calc(50% - .33em);top:calc(50% - .3em);width:.66em;height:.56em;background:currentColor;clip-path:polygon(50% 0,100% 100%,0 100%)}
.yt-dot::before{left:calc(50% - .26em);top:calc(50% - .26em);width:.52em;height:.52em;box-sizing:border-box;border:1.4px solid currentColor;border-radius:50%}
.yt-dot.yt-fill::before{background:currentColor}
`;

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** One span of a line: ASCII as text, anything else one cell at a time. */
function spanHtml(text: string, style: string) {
  let out = '';
  let ascii = '';
  const flush = () => {
    if (ascii) out += escape(ascii);
    ascii = '';
  };
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i] ?? '';
    if (ch.charCodeAt(0) < 0x7f) {
      ascii += ch;
      continue;
    }
    flush();
    if (ch === '━') {
      let n = 1;
      while (chars[i + n] === '━') n++;
      out += `<span class="yt-hv" style="width:${n}ch"></span>`;
      i += n - 1;
      continue;
    }
    const cell = cells[ch];
    out += cell
      ? `<span class="yt-c ${cell
          .split(' ')
          .map(c => `yt-${c}`)
          .join(' ')}"></span>`
      : `<span class="yt-c">${escape(ch)}</span>`;
  }
  flush();
  return style ? `<span style="${style}">${out}</span>` : out;
}

const rowHtml = (line: Line) =>
  `<div style="height:${LINE}px">${line
    .map(span => spanHtml(span.text, span.tone ? tones[span.tone] : ''))
    .join('')}</div>`;

const keyLabels: Record<Key, string> = {
  up: '↑',
  down: '↓',
  home: 'g',
  end: 'G',
  enter: '⏎',
  'ctrl-c': '⌃C'
};
/** How long a key stays on the overlay after it is pressed. */
const KEY_HOLD = 0.55;

/**
 * A `ytd down` session in a terminal window, scaled to fit the stage. The
 * screen is rebuilt only when its text changes, which is once per tick of
 * ytd's own redraw, a key or a keystroke at the prompt.
 */
export function LiveTerminal({
  kind,
  onDraw
}: {
  kind: YtdKind;
  onDraw: (draw: (t: number) => void) => void;
}) {
  const scene = useMemo(() => ytdScenes[kind](), [kind]);
  const box = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const key = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = box.current;
    const w = win.current;
    if (!el || !w) return;
    const fit = () => {
      const k = Math.min(
        (el.clientWidth / w.offsetWidth) * 0.92,
        (el.clientHeight / w.offsetHeight) * 0.9
      );
      w.style.transform = `translate(-50%, -50%) scale(${k})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    observer.observe(w);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let last = '';
    onDraw(t => {
      const frame = scene.frame(t);
      const html = frame.rows.map(rowHtml).join('');
      if (html !== last && rows.current) {
        rows.current.innerHTML = html;
        last = html;
      }
      if (screen.current) screen.current.style.opacity = String(frame.fade);
      const c = cursor.current;
      if (c) {
        c.style.display = frame.cursor ? 'block' : 'none';
        if (frame.cursor) {
          c.style.left = `calc(${PAD_X}px + ${frame.cursor.col}ch)`;
          c.style.top = `${PAD_Y + frame.cursor.row * LINE}px`;
        }
      }
      const k = key.current;
      if (k) {
        const age = frame.press ? t - frame.press.at : Infinity;
        if (frame.press && age < KEY_HOLD) {
          k.textContent = keyLabels[frame.press.key];
          // Pressed: a quick dip, then a fade at the end of the hold.
          const dip = Math.min(1, age / 0.08);
          k.style.opacity = String(Math.min(1, (KEY_HOLD - age) / 0.18));
          k.style.transform = `scale(${0.9 + 0.1 * dip})`;
          k.style.display = 'flex';
        } else k.style.display = 'none';
      }
    });
  }, [scene, onDraw]);

  return (
    <div ref={box} className="relative size-full overflow-hidden bg-[#0a090d]">
      <style>{CSS}</style>
      <div
        ref={win}
        className="absolute top-1/2 left-1/2 origin-center overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.09]"
        style={{ background: BG }}
      >
        <div
          className="flex items-center gap-2 border-white/[0.06] border-b px-4"
          style={{ height: TITLE_H, background: '#18171d' }}
        >
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="flex-1 pr-14 text-center text-[12px] text-white/45">
            zsh — {COLS}×{ROWS}
          </span>
        </div>
        <div
          ref={screen}
          className="relative whitespace-pre font-mono text-[14px]"
          style={{
            width: `calc(${COLS}ch + ${PAD_X * 2}px)`,
            height: ROWS * LINE + PAD_Y * 2,
            padding: `${PAD_Y}px ${PAD_X}px`,
            lineHeight: `${LINE}px`,
            color: FG
          }}
        >
          <div ref={rows} />
          <span
            ref={cursor}
            className="absolute w-[1ch]"
            style={{ height: LINE, background: 'rgb(228 228 231 / 0.85)' }}
          />
        </div>
      </div>
      {/* The key being pressed. Not part of the app. */}
      <span
        ref={key}
        aria-hidden
        className="pointer-events-none absolute right-4 bottom-4 hidden h-8 min-w-8 items-center justify-center rounded-lg bg-white/[0.1] px-2 font-mono text-[13px] text-white/90 ring-1 ring-white/20 backdrop-blur-md"
      />
    </div>
  );
}
