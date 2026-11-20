import { between, type Stroke, typedText } from '@/motion/keystrokes';

import { DURATION, formatSize } from './video';

/**
 * ytd's pkg/ui, ported to a pure function of time. A moment replays the
 * same calls cmd/down.go and cmd/playlist.go make (Intro, Task, Info,
 * Describe, Select, MultiSelect, StartProgress, Saved, Finish, Fail) on a fresh Trail for every frame, and each call draws what
 * the terminal shows at that instant: a live block at its last tick, a
 * picker after the keys pressed so far, a finished step once it is done.
 * What the person types comes from the moment's keystroke script, so the
 * prompt and the pickers move with the keys on the overlay.
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

export type TerminalFrame = {
  rows: Line[];
  /** Where the cursor is, or null while ytd hides it. */
  cursor: { row: number; col: number } | null;
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
/**
 * Cells a character takes in a terminal: two for East Asian wide ones
 * (Hangul, CJK, fullwidth forms, most emoji), one otherwise.
 */
export const cellWidth = (ch: string) => {
  const c = ch.codePointAt(0) ?? 0;
  return (c >= 0x1100 && c <= 0x115f) ||
    (c >= 0x2e80 && c <= 0xa4cf) ||
    (c >= 0xac00 && c <= 0xd7a3) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0xfe30 && c <= 0xfe4f) ||
    (c >= 0xff00 && c <= 0xff60) ||
    (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0x1f300 && c <= 0x1f64f) ||
    (c >= 0x1f900 && c <= 0x1f9ff) ||
    (c >= 0x20000 && c <= 0x3fffd)
    ? 2
    : 1;
};

const textWidth = (text: string) =>
  [...text].reduce((n, ch) => n + cellWidth(ch), 0);
const width = (line: Line) =>
  line.reduce((n, span) => n + textWidth(span.text), 0);

/** ansi.Truncate: cut to w cells, ending in the tail. */
function truncate(line: Line, w: number, tail = '…'): Line {
  if (width(line) <= w) return line;
  const out: Line = [];
  let room = w - textWidth(tail);
  for (const span of line) {
    const fits = textWidth(span.text);
    if (fits <= room) {
      out.push(span);
      room -= fits;
      continue;
    }
    let kept = '';
    for (const ch of span.text) {
      if (cellWidth(ch) > room) break;
      kept += ch;
      room -= cellWidth(ch);
    }
    out.push({ ...span, text: kept + tail });
    return out;
  }
  return out;
}

/**
 * The terminal soft-wraps a printed line at the last column; a wide
 * character that would straddle it moves to the next row.
 */
function wrap(line: Line, cols: number): Line[] {
  if (width(line) <= cols) return [line];
  const rows: Line[] = [[]];
  let used = 0;
  for (const span of line) {
    let text = '';
    for (const ch of span.text) {
      const w = cellWidth(ch);
      if (used + w > cols) {
        if (text) rows[rows.length - 1]?.push({ ...span, text });
        rows.push([]);
        used = 0;
        text = '';
      }
      text += ch;
      used += w;
    }
    if (text) rows[rows.length - 1]?.push({ ...span, text });
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
export const duration = (seconds: number) => {
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

/** picker.move and isAbort: what a key does in either list, if anything. */
function action(stroke: Stroke) {
  if (stroke.mods?.includes('ctrl')) {
    if (stroke.key === 'p') return 'up';
    if (stroke.key === 'n') return 'down';
    if (stroke.key === 'c' || stroke.key === 'd') return 'abort';
    return null;
  }
  switch (stroke.key) {
    case 'ArrowUp':
    case 'k':
      return 'up';
    case 'ArrowDown':
    case 'j':
      return 'down';
    case 'PageUp':
      return 'pageUp';
    case 'PageDown':
      return 'pageDown';
    case 'Home':
    case 'g':
      return 'home';
    case 'End':
    case 'G':
      return 'end';
    case 'Enter':
      return 'enter';
    case ' ':
      return 'space';
    case 'Escape':
    case 'q':
      return 'abort';
  }
  return null;
}

type Action = NonNullable<ReturnType<typeof action>>;

/** picker.move: up and down wrap around; page keys stop at the ends. */
function move(act: Action, cur: number, n: number, page: number) {
  switch (act) {
    case 'up':
      return (cur - 1 + n) % n;
    case 'down':
      return (cur + 1) % n;
    case 'pageUp':
      return Math.max(cur - page, 0);
    case 'pageDown':
      return Math.min(cur + page, n - 1);
    case 'home':
      return 0;
    case 'end':
      return n - 1;
  }
  return null;
}

/** list.run: the window follows the cursor after each key. */
const follow = (top: number, cur: number, size: number) =>
  Math.min(Math.max(top, cur - size + 1), cur);

/** The quality picker's state after the keys pressed so far. */
function pickerAt(keys: Stroke[], n: number) {
  const size = Math.min(n, PICKER_ROWS);
  let cur = 0;
  let top = 0;
  for (const key of keys) {
    const act = action(key);
    if (!act) continue;
    // handleKey: enter or space picks the row under the cursor.
    if (act === 'enter' || act === 'space')
      return { cur, top, size, chosen: true };
    cur = move(act, cur, n, size) ?? cur;
    top = follow(top, cur, size);
  }
  return { cur, top, size, chosen: false };
}

/**
 * The playlist checklist's state after the keys pressed so far: every row
 * starts selected; enter confirms only with something selected.
 */
function checklistAt(keys: Stroke[], n: number) {
  const size = Math.min(n, PICKER_ROWS);
  const sel = Array.from({ length: n }, () => true);
  let cur = 0;
  let top = 0;
  for (const key of keys) {
    const act = action(key);
    if (act === 'enter' && sel.some(Boolean))
      return { cur, top, size, sel, chosen: true };
    const next = act ? move(act, cur, n, size) : null;
    if (next !== null) cur = next;
    else if (!key.mods?.length) {
      // multiKey: space or x toggles, a selects all (none when all are), i inverts.
      if (key.key === ' ' || key.key === 'x') sel[cur] = !sel[cur];
      if (key.key === 'a' || key.key === 'A') sel.fill(!sel.every(Boolean));
      if (key.key === 'i' || key.key === 'I')
        for (let i = 0; i < n; i++) sel[i] = !sel[i];
    }
    top = follow(top, cur, size);
  }
  return { cur, top, size, sel, chosen: false };
}

export class Trail {
  private lines: Line[] = [];
  /** The line being typed at the prompt, before Enter. */
  private typing: Line | null = null;
  private hidden = false;
  private started = false;
  private gapNext = false;

  /** `keys` is the moment's keystroke script; `t` the instant drawn. */
  constructor(
    private readonly t: number,
    private readonly keys: Stroke[] = []
  ) {}

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

  /**
   * A shell prompt shown from `since`, holding `already` and whatever has
   * been typed or pasted into it until Enter at `enter`. Returns whether Enter was hit:
   * the command stays and its output starts below.
   */
  prompt(since: number, enter: number, already = '') {
    const line = [
      s('$ ', 'prompt'),
      s(already + typedText(this.keys, since, Math.min(this.t, enter)))
    ];
    if (this.t < enter) {
      this.typing = line;
      return false;
    }
    this.lines.push(line);
    return true;
  }

  print(text: string) {
    this.println(s(text));
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
    this.describe(title, `${author} · ${clock(seconds)}`);
  }

  /** A bold title and a dim detail under the current step. */
  describe(title: string, detail: string) {
    this.println(this.rail(), s('  '), s(title, 'bold'));
    this.println(this.rail(), s('  '), s(detail, 'dim'));
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
    since: number
  ) {
    const state = pickerAt(between(this.keys, since, this.t), rows.length);
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

  /**
   * MultiSelect: the checklist under `label`, every row selected, until
   * Enter; then `done(n)` as a done step. Returns the kept indexes, or null
   * while the checklist is open.
   */
  multiSelect(
    label: string,
    header: string,
    rows: string[],
    done: (n: number) => string,
    since: number
  ) {
    const state = checklistAt(between(this.keys, since, this.t), rows.length);
    const kept = state.sel.flatMap((on, i) => (on ? [i] : []));
    this.gap();
    if (state.chosen) {
      this.picked(label, done(kept.length));
      return kept;
    }
    this.println(
      s(glyph.active, 'accent'),
      s(`  ${label}`),
      s('  '),
      s('↑↓ · space toggle · a all/none · i invert · enter', 'dim')
    );
    const { cur, top, size, sel } = state;
    const lines: Line[] = [
      [this.rail(), s('      '), s(header.trimStart(), 'dim')]
    ];
    for (let i = top; i < top + size; i++) {
      const row = rows[i] ?? '';
      const cursor = i === cur ? s('›', 'accent') : s(' ');
      lines.push(
        sel[i]
          ? [
              this.rail(),
              s('  '),
              cursor,
              s(' '),
              s('◼', 'accent'),
              s(` ${row}`)
            ]
          : [this.rail(), s('  '), cursor, s(' '), s(`◻ ${row}`, 'dim')]
      );
    }
    const status: string[] = [];
    const below = rows.length - top - size;
    if (below > 0) status.push(`… ${below} more`);
    status.push(`${kept.length} of ${rows.length} selected`);
    lines.push([this.rail(), s('      '), s(status.join(' · '), 'dim')]);
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

  /** Finish: the summary, green when nothing failed, and its dim details. */
  finish(ok: boolean, title: string, details: string[]) {
    this.gap();
    this.println(
      s(glyph.close, 'rail'),
      s('  '),
      s(title, ok ? 'ok' : 'accent')
    );
    for (const line of details) this.println(s('   '), s(line, 'dim'));
  }

  cancelled() {
    if (!this.started) return;
    this.gap();
    this.println(s(glyph.close, 'rail'), s('  '), s('Cancelled', 'dim'));
  }

  /* Output ----------------------------------------------------------------- */

  /** The screen: wrapped, scrolled to the bottom, with the cursor. */
  frame(fade = 1): TerminalFrame {
    const all = [...this.lines, ...(this.typing ? [this.typing] : [])];
    const rows = all.flatMap(line => wrap(line, COLS));
    // With nothing being typed, the cursor waits at the start of a new line.
    const cursorRow = this.typing ? rows.length - 1 : rows.length;
    const cursorCol = this.typing ? width(rows[rows.length - 1] ?? []) : 0;
    const skip = Math.max(0, cursorRow + 1 - ROWS);
    return {
      rows: rows.slice(skip),
      cursor: this.hidden ? null : { row: cursorRow - skip, col: cursorCol },
      fade
    };
  }
}
