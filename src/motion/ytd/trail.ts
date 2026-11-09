import { DURATION, formatSize } from './video';

/**
 * ytd's pkg/ui, ported to a pure function of time. A moment replays the
 * same calls cmd/down.go makes (Intro, Task, Info, Select, StartProgress,
 * Saved, Fail) on a fresh Trail for every frame, and each call draws what
 * the terminal shows at that instant: a live block at its last tick, a
 * picker after the keys pressed so far, a finished step once it is done.
 *
 * The cadences are the Go ones: live blocks redraw every 110 ms, the
 * download reports its bytes every 200 ms, ffmpeg its media time every
 * 500 ms. So the bar steps while the spinner turns, as it does in a TTY.
 */

export const COLS = 92;
export const ROWS = 24;

/** live.go: frameEvery. */
export const FRAME = 0.11;
/** youtube.Download: its progress ticker. */
const BYTES_EVERY = 0.2;
/** ffmpeg -progress: the default stats_period. */
const MEDIA_EVERY = 0.5;
/** progress.go: barWidth. */
const BAR = 30;
/** picker.go: pickerRows. */
const PICKER_ROWS = 12;

export type Tone =
  'accent' | 'rail' | 'dim' | 'bold' | 'ok' | 'track' | 'badge' | 'prompt';
export type Span = { text: string; tone?: Tone };
export type Line = Span[];

export type Key = 'up' | 'down' | 'home' | 'end' | 'enter' | 'ctrl-c';
export type Press = { at: number; key: Key };

export type TerminalFrame = {
  rows: Line[];
  /** Where the cursor is, or null while ytd hides it. */
  cursor: { row: number; col: number } | null;
  /** The last key pressed, for the overlay. */
  press: Press | null;
  fade: number;
};

const glyph = {
  open: '┌',
  close: '└',
  rail: '│',
  done: '◇',
  active: '◆',
  fail: '▲'
};
const spinner = ['◒', '◐', '◓', '◑'];

const s = (text: string, tone?: Tone): Span => ({ text, tone });
const width = (line: Line) =>
  line.reduce((n, span) => n + [...span.text].length, 0);

/** ansi.Truncate: cut to w cells, ending in the tail. */
function truncate(line: Line, w: number, tail = '…'): Line {
  if (width(line) <= w) return line;
  const out: Line = [];
  let room = w - tail.length;
  for (const span of line) {
    const chars = [...span.text];
    if (chars.length <= room) {
      out.push(span);
      room -= chars.length;
      continue;
    }
    out.push({ ...span, text: chars.slice(0, room).join('') + tail });
    return out;
  }
  return out;
}

/** The terminal soft-wraps a printed line at the last column. */
function wrap(line: Line, cols: number): Line[] {
  if (width(line) <= cols) return [line];
  const rows: Line[] = [[]];
  let used = 0;
  for (const span of line) {
    let chars = [...span.text];
    while (chars.length) {
      if (used === cols) {
        rows.push([]);
        used = 0;
      }
      const take = chars.slice(0, cols - used);
      rows[rows.length - 1]?.push({ ...span, text: take.join('') });
      used += take.length;
      chars = chars.slice(take.length);
    }
  }
  return rows;
}

/** ui.Compact: an aligned row as "1080p · H.264 · 2400 kbps". */
export const compact = (row: string) => row.trim().replace(/\s{2,}/g, ' · ');

/** ui.Clock: m:ss. */
export const clock = (seconds: number) => {
  const d = Math.round(seconds);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d / 60) % 60;
  const sec = String(d % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/** ui.Duration: 45s, 3m12s, 1h05m. */
const duration = (seconds: number) => {
  const d = Math.round(seconds);
  if (d < 60) return `${d}s`;
  if (d < 3600)
    return `${Math.floor(d / 60)}m${String(d % 60).padStart(2, '0')}s`;
  return `${Math.floor(d / 3600)}h${String(Math.floor(d / 60) % 60).padStart(2, '0')}m`;
};

/** The last report at or before `elapsed`, for a reporter firing every `every`. */
const reported = (elapsed: number, every: number) =>
  Math.floor(elapsed / every + 1e-9) * every;

/** A step's progress as reported: a fraction and its detail. */
type Reading = { frac: number; detail: string };

/**
 * A step's reading `elapsed` seconds in. Between reports it holds the last
 * one; `now` asks for a report at that instant, as the final one is.
 */
export type Reader = (elapsed: number, now?: boolean) => Reading;

/** Progress.Bytes, from bytes done at a given time since the step started. */
export const bytesReading =
  (total: number, done: (elapsed: number) => number) =>
  (at: number, now = false): Reading => {
    const el = now ? at : reported(at, BYTES_EVERY);
    if (el <= 0) return { frac: 0, detail: '' };
    const got = Math.min(done(el), total);
    const speed = got / Math.max(el, 0.001);
    const left =
      speed > 0 && total > got ? duration((total - got) / speed) : '-';
    return {
      frac: got / Math.max(total, 1),
      detail: `${formatSize(speed)}/s · ${left} left`
    };
  };

/** Progress.Media, from ffmpeg's out_time at a given time since the step started. */
export const mediaReading =
  (done: (elapsed: number) => number, total = DURATION) =>
  (at: number, now = false): Reading => {
    const el = now ? at : reported(at, MEDIA_EVERY);
    if (el <= 0) return { frac: 0, detail: '' };
    const got = Math.min(done(el), total);
    const speed = got / Math.max(el, 0.001);
    return {
      frac: got / Math.max(total, 0.001),
      detail: `${clock(got)} / ${clock(total)} · ${speed.toFixed(1)}x`
    };
  };

/** A picker's state after the keys pressed so far. */
function pickerAt(keys: Press[], t: number, n: number) {
  const size = Math.min(n, PICKER_ROWS);
  let cur = 0;
  let top = 0;
  for (const { at, key } of keys) {
    if (at > t) break;
    // picker.handleKey: up and down wrap around.
    if (key === 'enter') return { cur, top, size, chosen: true };
    if (key === 'up') cur = (cur - 1 + n) % n;
    if (key === 'down') cur = (cur + 1) % n;
    if (key === 'home') cur = 0;
    if (key === 'end') cur = n - 1;
    top = Math.min(Math.max(top, cur - size + 1), cur);
  }
  return { cur, top, size, chosen: false };
}

export class Trail {
  private lines: Line[] = [];
  /** The line being typed at the prompt, before Enter. */
  private typing: Line | null = null;
  private hidden = false;
  private started = false;
  private gapNext = false;
  private keys: Press[] = [];

  constructor(private readonly t: number) {}

  private println(...spans: Span[]) {
    this.lines.push(spans.filter(span => span.text));
  }

  private rail = () => s(glyph.rail, 'rail');

  private gap() {
    if (this.gapNext) this.println(this.rail());
    this.gapNext = false;
  }

  /** Lines drawn by a live block are cut to the width, as live.draw does. */
  private live(lines: Line[]) {
    for (const line of lines) this.lines.push(truncate(line, COLS - 1));
    this.hidden = true;
  }

  /* Shell ------------------------------------------------------------------ */

  /** The prompt, with `command` typed one key at a time from `from`. */
  prompt(command: string, from: number, perKey = 0.032) {
    const typed = Math.max(0, Math.floor((this.t - from) / perKey) + 1);
    this.typing = [
      s('$ ', 'prompt'),
      s(command.slice(0, this.t < from ? 0 : typed))
    ];
    return this.t >= from + command.length * perKey;
  }

  /** Enter at the prompt: the command stays, its output starts below. */
  enter(at: number) {
    if (this.t < at || !this.typing) return false;
    this.lines.push(this.typing);
    this.typing = null;
    this.keys.push({ at, key: 'enter' });
    return true;
  }

  print(text: string) {
    this.println(s(text));
  }

  press(at: number, key: Key) {
    if (this.t >= at) this.keys.push({ at, key });
  }

  /* ui.go ------------------------------------------------------------------ */

  intro(version: string) {
    this.started = true;
    this.println(
      s(glyph.open, 'rail'),
      s('  '),
      s(' ytd ', 'badge'),
      s('  '),
      s(`v${version}`, 'dim')
    );
    this.gapNext = true;
  }

  /** Task: a spinner from `since` until `until`, then the done line. */
  task(active: string, done: string, since: number, until: number) {
    this.gap();
    if (this.t < until) {
      const f = Math.floor((this.t - since) / FRAME);
      this.live([
        [
          s(spinner[f % spinner.length] ?? '', 'accent'),
          s(`  ${active}`),
          s('.'.repeat(Math.floor(f / 3) % 4), 'dim')
        ]
      ]);
      return false;
    }
    this.println(s(glyph.done, 'ok'), s(`  ${done}`));
    this.gapNext = true;
    return true;
  }

  info(title: string, author: string, seconds: number) {
    this.println(this.rail(), s('  '), s(title, 'bold'));
    this.println(
      this.rail(),
      s('  '),
      s(`${author} · ${clock(seconds)}`, 'dim')
    );
    this.gapNext = true;
  }

  picked(label: string, row: string) {
    this.gap();
    this.println(s(glyph.done, 'ok'), s(`  ${label}`));
    this.println(this.rail(), s('  '), s(compact(row), 'dim'));
    this.gapNext = true;
  }

  /**
   * Select: the picker under `label` until Enter, then the choice as a done
   * step. Returns the chosen row, or null while the picker is open.
   */
  select(
    label: string,
    note: string,
    header: string,
    rows: string[],
    keys: Press[]
  ) {
    const state = pickerAt(keys, this.t, rows.length);
    for (const key of keys) if (key.at <= this.t) this.keys.push(key);
    this.gap();
    if (state.chosen) {
      this.picked(label, rows[state.cur] ?? '');
      return state.cur;
    }
    this.println(
      s(glyph.active, 'accent'),
      s(`  ${label}`),
      s('  '),
      s('↑↓ · enter', 'dim')
    );
    if (note) this.println(this.rail(), s('  '), s(note, 'dim'));
    const { cur, top, size } = state;
    const lines: Line[] = [
      [this.rail(), s('    '), s(header.trimStart(), 'dim')]
    ];
    for (let i = top; i < top + size; i++) {
      const row = rows[i] ?? '';
      lines.push(
        i === cur
          ? [this.rail(), s('  '), s('●', 'accent'), s(` ${row}`)]
          : [this.rail(), s('  '), s(`○ ${row}`, 'dim')]
      );
    }
    const below = rows.length - top - size;
    if (below > 0)
      lines.push([this.rail(), s('    '), s(`… ${below} more`, 'dim')]);
    this.live(lines);
    return null;
  }

  private bar({ frac, detail }: Reading): Line {
    const n = Math.floor(Math.min(Math.max(frac, 0), 1) * BAR);
    return [
      this.rail(),
      s('  '),
      s('━'.repeat(n), 'accent'),
      s(n < BAR ? '╸' : '', 'accent'),
      s('━'.repeat(Math.max(0, BAR - n - 1)), 'track'),
      s(`  ${String(Math.round(frac * 100)).padStart(3)}%`),
      ...(detail ? [s('  '), s(detail, 'dim')] : [])
    ];
  }

  /**
   * StartProgress from `since`. Each tick draws the last reading; `end`
   * stops it as done or failed at its instant.
   */
  progress(
    label: string,
    since: number,
    read: Reader,
    end?:
      { at: number; done: string; detail: string } | { at: number; fail: true }
  ) {
    this.gap();
    if (!end || this.t < end.at) {
      const f = Math.floor((this.t - since) / FRAME);
      this.live([
        [s(spinner[f % spinner.length] ?? '', 'accent'), s(`  ${label}`)],
        this.bar(read(f * FRAME))
      ]);
      return false;
    }
    if ('fail' in end) {
      // Fail keeps the bar where it stopped.
      this.lines.push(
        [s(glyph.fail, 'accent'), s(`  ${label}`)],
        truncate(this.bar(read(end.at - since, true)), COLS - 1)
      );
      return true;
    }
    this.println(
      s(glyph.done, 'ok'),
      s(`  ${end.done} `),
      s(end.detail, 'dim')
    );
    this.gapNext = true;
    return true;
  }

  saved(path: string, size: number, took: number) {
    this.gap();
    this.println(
      s(glyph.close, 'rail'),
      s('  '),
      s('Saved ', 'ok'),
      s(path, 'bold')
    );
    this.println(
      s('   '),
      s(`${formatSize(size)} · ${took.toFixed(1)}s`, 'dim')
    );
  }

  cancelled() {
    if (!this.started) return;
    this.gap();
    this.println(s(glyph.close, 'rail'), s('  '), s('Cancelled', 'dim'));
  }

  /* Output ----------------------------------------------------------------- */

  /** The screen: wrapped, scrolled to the bottom, with the cursor and key. */
  frame(fade = 1): TerminalFrame {
    const all = [...this.lines, ...(this.typing ? [this.typing] : [])];
    const rows = all.flatMap(line => wrap(line, COLS));
    // With nothing being typed, the cursor waits at the start of a new line.
    const cursorRow = this.typing ? rows.length - 1 : rows.length;
    const cursorCol = this.typing ? width(rows[rows.length - 1] ?? []) : 0;
    const skip = Math.max(0, cursorRow + 1 - ROWS);
    const press = this.keys.filter(k => k.at <= this.t).at(-1) ?? null;
    return {
      rows: rows.slice(skip),
      cursor: this.hidden ? null : { row: cursorRow - skip, col: cursorCol },
      press,
      fade
    };
  }
}
