/**
 * Keystrokes for moments that are driven from a keyboard. A moment scripts
 * what a person presses once, as a list of strokes, and reads two things
 * back from it at any instant: what the strokes typed (for the app to show)
 * and what the overlay shows (for the viewer to follow along).
 *
 * The overlay works like a keycast: typing gathers into one cap, a held or
 * repeated key counts up on its cap, a shortcut shows its modifiers, and
 * the whole row clears once the keyboard has been idle for a moment.
 */

export type Mod = 'ctrl' | 'alt' | 'shift' | 'cmd';

export type Stroke = {
  at: number;
  /** A KeyboardEvent.key: 'a', 'G', 'Enter', 'ArrowDown', 'Escape'… */
  key: string;
  mods?: Mod[];
  /** What the stroke puts into the focused field: a character, or a paste. */
  text?: string;
  /** Typed text, gathered into one cap with the characters around it. */
  typing?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Scripting                                                                   */
/* -------------------------------------------------------------------------- */

/** Seconds between keys while typing: about 120 wpm, never metronomic. */
const PER_KEY = 0.075;
/** Key repeat on macOS: 225 ms before it starts, then 30 per second. */
const REPEAT_DELAY = 0.225;
const REPEAT_EVERY = 1 / 30;

/** A fixed wobble per character, so typing has a rhythm but replays exactly. */
const wobble = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

/**
 * A keyboard timeline, written in order:
 *
 *   const keys = script(0.5).type('ytd down ').wait(0.3).paste(url);
 *   const enter = keys.now;
 *   keys.press('Enter');
 */
export class Script {
  readonly strokes: Stroke[] = [];

  constructor(public now = 0) {}

  /** Move to an absolute time, e.g. when the app is ready for input. */
  at(time: number) {
    this.now = time;
    return this;
  }

  wait(seconds: number) {
    this.now += seconds;
    return this;
  }

  /** One key, then a short beat for the finger to come off it. */
  press(key: string, mods?: Mod[], after = 0) {
    this.strokes.push({ at: this.now, key, mods });
    this.now += after;
    return this;
  }

  /** Each character as a key, at typing speed. */
  type(text: string, perKey = PER_KEY) {
    for (const ch of text) {
      this.strokes.push({ at: this.now, key: ch, text: ch, typing: true });
      // Spaces come a touch later, the way words do.
      const beat = perKey * (1 + 0.45 * wobble(this.strokes.length));
      this.now += ch === ' ' ? beat * 1.4 : beat;
    }
    return this;
  }

  /** ⌘V: the clipboard lands in one go. */
  paste(text: string) {
    this.strokes.push({ at: this.now, key: 'v', mods: ['cmd'], text });
    this.now += 0.05;
    return this;
  }

  /** A key held for `seconds`: one press, then the OS repeat. */
  hold(key: string, seconds: number, mods?: Mod[]) {
    const from = this.now;
    this.strokes.push({ at: from, key, mods });
    for (let at = from + REPEAT_DELAY; at <= from + seconds; at += REPEAT_EVERY)
      this.strokes.push({ at, key, mods });
    this.now = from + seconds;
    return this;
  }
}

export const script = (from = 0) => new Script(from);

/** The strokes after `since` and up to `t`. */
export const between = (strokes: Stroke[], since: number, t: number) =>
  strokes.filter(s => s.at > since && s.at <= t);

/** What the strokes after `since` have typed into a field by `t`. */
export const typedText = (strokes: Stroke[], since: number, t: number) =>
  between(strokes, since, t)
    .map(s => s.text ?? '')
    .join('');

/* -------------------------------------------------------------------------- */
/* The overlay                                                                 */
/* -------------------------------------------------------------------------- */

export type KeyCap = {
  /** Modifier symbols, in Apple's order: ⌃ ⌥ ⇧ ⌘. */
  mods: string;
  label: string;
  /** Presses gathered on this cap: a held key's repeats, or one key tapped again. */
  count: number;
  typing: boolean;
  /** When the cap last changed. */
  at: number;
};

export type KeystrokeFrame = { caps: KeyCap[]; opacity: number };

/** After this long without a key the row fades out, and starts afresh. */
const IDLE = 1.2;
const FADE = 0.3;
/** The same key again within this long counts up instead of a new cap. */
const AGAIN = 0.6;
/** Characters further apart than this start a new typing cap. */
const TYPING_GAP = 0.9;
/** Caps on screen; older ones drop off the left. */
const MAX_CAPS = 4;
/** A typing cap shows its last characters. */
const MAX_TEXT = 16;

const names: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '⏎',
  Escape: 'esc',
  Backspace: '⌫',
  Tab: '⇥',
  Home: 'home',
  End: 'end',
  ' ': '␣'
};
const modOrder: [Mod, string][] = [
  ['ctrl', '⌃'],
  ['alt', '⌥'],
  ['shift', '⇧'],
  ['cmd', '⌘']
];

const labelOf = (s: Stroke) => {
  const named = names[s.key];
  if (named) return named;
  return s.mods?.length ? s.key.toUpperCase() : s.key;
};

const modsOf = (s: Stroke) =>
  modOrder
    .filter(([mod]) => s.mods?.includes(mod))
    .map(([, symbol]) => symbol)
    .join('');

/** The caps on screen at `t`. */
export function keystrokesAt(strokes: Stroke[], t: number): KeystrokeFrame {
  const pressed = strokes.filter(s => s.at <= t);
  const last = pressed.at(-1);
  if (!last || t - last.at > IDLE + FADE) return { caps: [], opacity: 0 };

  // Only the current burst: strokes with no idle gap before the last one.
  let start = pressed.length - 1;
  while (start > 0) {
    const prev = pressed[start - 1];
    const cur = pressed[start];
    if (!prev || !cur || cur.at - prev.at > IDLE) break;
    start--;
  }

  const caps: (KeyCap & { text: string; key: string; mods: string })[] = [];
  let lastAt = -Infinity;
  for (const s of pressed.slice(start)) {
    const top = caps.at(-1);
    const mods = modsOf(s);
    if (s.typing && top?.typing && s.at - lastAt < TYPING_GAP) {
      top.text += s.key;
      top.label = top.text.slice(-MAX_TEXT);
      top.at = s.at;
    } else if (
      !s.typing &&
      top &&
      !top.typing &&
      top.key === s.key &&
      top.mods === mods &&
      s.at - lastAt < AGAIN
    ) {
      top.count++;
      top.at = s.at;
    } else {
      caps.push({
        key: s.key,
        mods,
        label: s.typing ? s.key : labelOf(s),
        text: s.typing ? s.key : '',
        count: 1,
        typing: Boolean(s.typing),
        at: s.at
      });
    }
    lastAt = s.at;
  }

  const idle = t - last.at;
  return {
    caps: caps.slice(-MAX_CAPS).map(({ mods, label, count, typing, at }) => ({
      mods,
      label,
      count,
      typing,
      at
    })),
    opacity: idle <= IDLE ? 1 : Math.max(0, 1 - (idle - IDLE) / FADE)
  };
}
