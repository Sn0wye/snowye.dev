import { script, type Stroke } from '@/motion/keystrokes';

import {
  backups,
  copy,
  drill,
  metrics,
  permissions,
  type Question,
  quiz,
  serverless,
  support
} from './content';
import {
  charIn,
  charOut,
  clamp01,
  colorTransition,
  type Curve,
  curves,
  hex,
  keyframes,
  mixRgba,
  motionEaseOut,
  numberTransition,
  optionDelay,
  pulse,
  type Rgba,
  rgba,
  scoreEase,
  wash
} from './curves';

/**
 * CloudCertify moments, scripted as the app's state over time: what is
 * selected, checked, rated or open, and where the pointer is pressing.
 * Every transition the components declare then plays from the instant its
 * state changed, so any frame can be drawn without the ones before it.
 */

/** A 1024 × 800 browser viewport: Tailwind's `lg`, the desktop layout. */
export const VIEW_W = 1024;
export const VIEW_H = 800;
/** AppHeader: h-16 and its border. */
export const HEADER_H = 66;

/** ExamStrip's columns: h-[4.5rem], less py-2 and the 2 px baseline. */
export const STRIP_H = 54;

export type Point = { x: number; y: number };

/**
 * The pointer travels to an element (by data-a) or a viewport point;
 * `offset` shifts the landing on an element, to stop beside it.
 */
export type Move = {
  at: number;
  dur: number;
  to: string | Point;
  offset?: Point;
};

export type Press = { down: number; up: number };

/**
 * Scrolling, by who asks for it. `nearest` is scrollIntoView, `question` a
 * scroll back to a new question, and `wheel` a person scrolling until
 * something is in view. The attempt screens fit the window, so only a
 * page that outgrows it scrolls.
 */
export type ScrollIntent = {
  at: number;
  target: string;
  mode: 'nearest' | 'question' | 'wheel';
};

/**
 * Inline styles per element. `heightFraction` opens to the content's
 * height; `text` replaces the element's text.
 */
export type Style = Record<string, string | number>;

export type Rating = 'guess' | 'unsure' | 'confident';
export type OptionMode =
  'idle' | 'selected' | 'capped' | 'correct' | 'wrong' | 'dim';

/** ExamStrip's tones while an Exam runs. */
export type StripTone = 'empty' | 'answered' | 'revisit';
export type StripCell = { height: number; tone: StripTone };

export type PracticeView = {
  kind: 'practice';
  question: Question;
  index: number;
  total: number;
  outcomes: (boolean | null)[];
  /** The dashed column waiting for a Check, or -1 once it has one. */
  current: number;
  streak: number;
  phase: 'answering' | 'revealed';
  checking: boolean;
  modes: Record<string, OptionMode>;
  correct: boolean;
  canCheck: boolean;
};

export type ExamView = {
  kind: 'exam';
  question: Question;
  index: number;
  total: number;
  selected: string[];
  rating: Rating | null;
  cells: StripCell[];
};

export type ResultsView = {
  kind: 'results';
  title: string;
  outcomes: boolean[];
  correct: number;
  score: number;
  longestRun: number;
  passed: boolean;
  passingScore: number;
};

/** The example result's two findings, as the landing's buttons name them. */
export type Finding = 'misconception' | 'lucky';

export type HomeView = {
  kind: 'home';
  /** The exam code in the hero's chip. */
  code: string;
  /** The column the line under the strip reads: the hovered one, else the selected. */
  pointed: number;
  /** The finding in the spotlight, if any. */
  spot: Finding | null;
};

export type CCView = PracticeView | ExamView | ResultsView | HomeView;

export type CCFrame = {
  view: CCView;
  styles: Record<string, Style>;
  fade: number;
};

export type CCScene = {
  duration: number;
  url: string;
  strokes: Stroke[];
  pointer: { start: Point; moves: Move[]; presses: Press[] } | null;
  scrolls: ScrollIntent[];
  frame: (t: number) => CCFrame;
};

/* -------------------------------------------------------------------------- */
/* State over time                                                             */
/* -------------------------------------------------------------------------- */

/** Long before the moment starts: anything set here has settled. */
const BEFORE = -1e6;
const NEVER = Number.NEGATIVE_INFINITY;

class Timeline<S> {
  readonly times: number[] = [BEFORE];
  readonly states: S[];

  constructor(initial: S) {
    this.states = [initial];
  }

  set(at: number, patch: Partial<S>) {
    const prev = this.states[this.states.length - 1] as S;
    this.times.push(at);
    this.states.push({ ...prev, ...patch });
    return this;
  }

  indexAt(t: number) {
    let i = 0;
    for (let j = 1; j < this.times.length; j++) {
      if ((this.times[j] ?? 0) <= t) i = j;
      else break;
    }
    return i;
  }

  stateAt(t: number) {
    return this.states[this.indexAt(t)] as S;
  }

  /** When `key` last changed by `t`; -Infinity if it never has. */
  changedAt(t: number, key: (s: S) => unknown) {
    let at = NEVER;
    const i = this.indexAt(t);
    for (let j = 1; j <= i; j++) {
      const a = this.states[j - 1] as S;
      const b = this.states[j] as S;
      if (key(a) !== key(b)) at = this.times[j] ?? at;
    }
    return at;
  }

  /** A transition; `pick` chooses its curve from the state it heads to. */
  number(
    select: (s: S) => number | undefined,
    curve: Curve,
    pick?: (s: S) => Curve
  ) {
    return numberTransition(
      this.times,
      this.states.map(select),
      curve,
      pick && (i => pick(this.states[i] as S))
    );
  }

  color(select: (s: S) => Rgba | undefined, curve: Curve) {
    return colorTransition(this.times, this.states.map(select), curve);
  }

  /** One view per state, reusing the last one when nothing in it changed. */
  views<V>(toView: (s: S) => V) {
    let last = '';
    let view: V | undefined;
    return this.states.map(s => {
      const next = toView(s);
      const key = JSON.stringify(next);
      if (key !== last || view === undefined) {
        view = next;
        last = key;
      }
      return view;
    });
  }
}

/** A fade over the loop's seam, in and out, so the restart is not a cut. */
const seam = (t: number, duration: number, over = 0.35) =>
  Math.max(0, Math.min(1, t / over, (duration - t) / over));

/* -------------------------------------------------------------------------- */
/* Shared styling                                                              */
/* -------------------------------------------------------------------------- */

const WHITE = hex('#ffffff');
const PRIMARY = hex('#2347d9');
const SUCCESS = hex('#15a06e');
const DANGER = hex('#e23b48');
const SECONDARY = hex('#ffb020');
const EMPTY = hex('#000000', 0.2);
/** `hover:bg-secondary/25` on an option. */
const HOVER = wash('#ffb020', 0.25);

/**
 * The box-shadow stack Tailwind composes: focus ring offset, focus ring
 * (`ring-4 ring-black/40 ring-offset-2`), then the hard offset shadow.
 * Each part fades and shrinks with its own progress, as `shadow-none` and a
 * lost focus interpolate.
 */
const shadowOf = (offset: number, alpha: number, ring = 0) =>
  [
    `0 0 0 ${2 * ring}px rgb(255 255 255 / ${ring})`,
    `0 0 0 ${6 * ring}px rgb(0 0 0 / ${0.4 * ring})`,
    `${offset}px ${offset}px 0 0 rgb(0 0 0 / ${alpha})`
  ].join(', ');

/** AttemptQuestion's heading: in from the side of travel. */
const enter = (since: number, direction: number): Style => {
  if (since === NEVER) return { opacity: 1, transform: 'none' };
  const p = curves.question(since);
  return {
    opacity: clamp01(p),
    transform: `translateX(${direction * 32 * (1 - p)}px)`
  };
};

/** An option mounting: up 10 px and in, on its own delay. */
const rise = (since: number, i: number) =>
  since === NEVER ? 1 : curves.optionIn(since - optionDelay(i));

const shake = keyframes([0, -8, 6, -4, 2, 0], 0.35, motionEaseOut);
const nod = keyframes([1, 1.04, 1], 0.35, motionEaseOut);

const press = (pressed: boolean) => (pressed ? 1 : 0);

/** A dock button's :active, 4 px down and its shadow gone. */
const dockButton = (p: number): Style => ({
  translate: `${4 * p}px ${4 * p}px`,
  boxShadow: shadowOf(4 * (1 - p), 1 - p)
});

/** Network for a Check on a fast connection. */
const CHECK_RTT = 0.32;
/** A click: mouse down, then up a beat later; the click lands on up. */
const CLICK = 0.09;

/** How many right answers in a row end at each Question. */
export const runLengths = (outcomes: (boolean | null)[]) => {
  const runs: number[] = [];
  for (const [i, outcome] of outcomes.entries())
    runs.push(outcome ? (runs[i - 1] ?? 0) + 1 : 0);
  return runs;
};

/** DrillColumns: a right answer a step taller than the last, a miss low. */
const columnHeight = (outcome: boolean, run: number) =>
  outcome ? 20 + 16 * Math.min(run, 5) : 14;

/* -------------------------------------------------------------------------- */
/* Practice: PracticeQuestionCard in a Drill                                   */
/* -------------------------------------------------------------------------- */

type PracticeState = {
  q: number;
  selected: string[];
  phase: 'answering' | 'revealed';
  checking: boolean;
  outcomes: (boolean | null)[];
  hover: string | null;
  pressed: string | null;
  focus: string | null;
};

const modeOf = (s: PracticeState, q: Question, id: string): OptionMode => {
  const answer = q.answers.find(a => a.id === id);
  if (s.phase === 'revealed')
    return answer?.correct
      ? 'correct'
      : s.selected.includes(id)
        ? 'wrong'
        : 'dim';
  if (s.selected.includes(id)) return 'selected';
  return q.selectCount > 1 && s.selected.length >= q.selectCount
    ? 'capped'
    : 'idle';
};

const isRight = (q: Question, selected: string[]) =>
  selected.length === q.selectCount &&
  q.answers.every(a => Boolean(a.correct) === selected.includes(a.id));

/** Right answers in a row, ending at the latest Check. */
const streakOf = (s: PracticeState, index: number) => {
  let streak = 0;
  for (
    let i = s.phase === 'revealed' ? index : index - 1;
    i >= 0 && s.outcomes[i];
    i--
  )
    streak++;
  return streak;
};

function practiceScene({
  questions,
  first,
  history,
  duration,
  build
}: {
  questions: Question[];
  /** Zero-based drill index of the first question. */
  first: number;
  /** What the Questions before it came out as. */
  history: boolean[];
  duration: number;
  build: (
    tl: Timeline<PracticeState>,
    reveal: (at: number) => void
  ) => {
    strokes?: Stroke[];
    pointer?: CCScene['pointer'];
  };
}): CCScene {
  const tl = new Timeline<PracticeState>({
    q: 0,
    selected: [],
    phase: 'answering',
    checking: false,
    outcomes: Array.from({ length: drill.total }, (_, i) => history[i] ?? null),
    hover: null,
    pressed: null,
    focus: null
  });
  const questionOf = (s: PracticeState) => questions[s.q] as Question;
  const indexOf = (s: PracticeState) => first + s.q;
  // The verdict comes back with the Check and lands in the strip at once.
  const reveal = (at: number) => {
    const s = tl.stateAt(at);
    const outcomes = [...s.outcomes];
    outcomes[indexOf(s)] = isRight(questionOf(s), s.selected);
    tl.set(at, { checking: false, phase: 'revealed', outcomes });
  };
  const { strokes = [], pointer = null } = build(tl, reveal);

  const views = tl.views<PracticeView>(s => {
    const q = questionOf(s);
    const index = indexOf(s);
    return {
      kind: 'practice',
      question: q,
      index,
      total: drill.total,
      outcomes: s.outcomes,
      current: s.phase === 'revealed' ? -1 : index,
      streak: streakOf(s, index),
      phase: s.phase,
      checking: s.checking,
      modes: Object.fromEntries(q.answers.map(a => [a.id, modeOf(s, q, a.id)])),
      correct: isRight(q, s.selected),
      canCheck: s.selected.length === q.selectCount
    };
  });

  // Every answer's transitions, built once from the state they ask for.
  const options = questions.flatMap((q, qi) =>
    q.answers.map((a, i) => {
      const on = (s: PracticeState) => s.q === qi;
      const mode = (s: PracticeState) => modeOf(s, q, a.id);
      const shadow = (s: PracticeState) => {
        const m = mode(s);
        if (m === 'correct') return 6;
        return (m === 'idle' && s.pressed !== a.id) || m === 'capped' ? 4 : 0;
      };
      return {
        id: a.id,
        i,
        qi,
        background: tl.color(s => {
          if (!on(s)) return undefined;
          const m = mode(s);
          if (m === 'selected') return PRIMARY;
          if (m === 'correct') return SUCCESS;
          if (m === 'wrong') return DANGER;
          return m === 'idle' && !s.checking && s.hover === a.id
            ? HOVER
            : WHITE;
        }, curves.press),
        translate: tl.number(s => {
          if (!on(s)) return undefined;
          const m = mode(s);
          if (m === 'correct') return -2;
          return m === 'selected' || (m === 'idle' && s.pressed === a.id)
            ? 4
            : 0;
        }, curves.press),
        shadowX: tl.number(s => (on(s) ? shadow(s) : undefined), curves.press),
        shadowA: tl.number(
          s => (on(s) ? (shadow(s) > 0 ? 1 : 0) : undefined),
          curves.press
        ),
        ring: tl.number(
          s => (on(s) ? press(s.focus === a.id) : undefined),
          curves.press
        ),
        // Motion owns opacity: a spring on the option's delay while answering,
        // the reveal's tween once checked.
        fade: tl.number(
          s => {
            if (!on(s)) return undefined;
            const m = mode(s);
            return m === 'dim' || m === 'capped' ? 0.4 : 1;
          },
          curves.reveal,
          s =>
            s.phase === 'revealed'
              ? curves.reveal
              : t => curves.optionIn(t - optionDelay(i))
        )
      };
    })
  );
  const primaryBg = tl.color(
    s => (s.phase === 'revealed' ? WHITE : PRIMARY),
    curves.press
  );
  const primaryOpacity = tl.number(s => {
    const q = questionOf(s);
    return s.phase === 'revealed' ||
      s.checking ||
      s.selected.length === q.selectCount
      ? 1
      : 0.4;
  }, curves.press);
  const primaryPress = tl.number(
    s => press(s.pressed === 'primary'),
    curves.press
  );
  const dockBg = tl.color(s => {
    if (s.phase !== 'revealed') return WHITE;
    return isRight(questionOf(s), s.selected) ? SUCCESS : DANGER;
  }, curves.all);
  const streakOpacity = tl.number(
    s => (streakOf(s, indexOf(s)) === 0 ? 0.3 : 1),
    curves.all
  );

  return {
    duration,
    url: 'cloudcertify.snowye.dev/quiz/1/drill/1/session',
    strokes,
    pointer,
    scrolls: [],
    frame: t => {
      const i = tl.indexAt(t);
      const s = tl.states[i] as PracticeState;
      const view = views[i] as PracticeView;
      const mountedAt = tl.changedAt(t, st => st.q);
      const revealedAt = tl.changedAt(t, st => `${st.q}:${st.phase}`);
      const checkingAt = tl.changedAt(t, st => st.checking);
      const runs = runLengths(view.outcomes);
      const styles: Record<string, Style> = {
        question: enter(t - mountedAt, 1),
        primary: {
          background: rgba(primaryBg(t) ?? PRIMARY),
          opacity: primaryOpacity(t) ?? 1,
          ...dockButton(primaryPress(t) ?? 0)
        },
        dock: { background: rgba(dockBg(t) ?? WHITE) },
        spinner: { transform: `rotate(${((t - checkingAt) % 1) * 360}deg)` },
        streak: { opacity: streakOpacity(t) ?? 1 }
      };

      // A new number remounts and springs in, unless it fell back to zero.
      const streakAt = tl.changedAt(t, st => streakOf(st, indexOf(st)));
      if (view.streak > 0 && streakAt !== NEVER) {
        const p = curves.streak(t - streakAt);
        styles['streak-num'] = {
          transform: `translateY(${10 * (1 - p)}px) scale(${1.6 - 0.6 * p})`
        };
      } else styles['streak-num'] = { transform: 'none' };

      view.outcomes.forEach((outcome, c) => {
        if (outcome === null) {
          if (c === view.current) {
            const since = tl.changedAt(t, st =>
              st.phase === 'revealed' ? -1 : indexOf(st)
            );
            styles[`col-${c}`] = {
              opacity: pulse(since === NEVER ? t : t - since)
            };
          }
          return;
        }
        const target = columnHeight(outcome, runs[c] ?? 0);
        const at = tl.changedAt(t, st => st.outcomes[c]);
        const h =
          at === NEVER ? target : 25 + (target - 25) * curves.column(t - at);
        styles[`col-${c}`] = { height: `${h}%` };
      });

      for (const o of options) {
        if (o.qi !== s.q) continue;
        const mode = view.modes[o.id];
        const up = rise(t - mountedAt, o.i);
        const revealed = s.phase === 'revealed';
        const x = revealed && mode === 'wrong' ? shake(t - revealedAt) : 0;
        const scale = revealed && mode === 'correct' ? nod(t - revealedAt) : 1;
        const tr = o.translate(t) ?? 0;
        styles[o.id] = {
          background: rgba(o.background(t) ?? WHITE),
          translate: `${tr}px ${tr}px`,
          boxShadow: shadowOf(
            o.shadowX(t) ?? 0,
            o.shadowA(t) ?? 0,
            o.ring(t) ?? 0
          ),
          opacity: clamp01(up) * (o.fade(t) ?? 1),
          transform: `translateX(${x}px) translateY(${10 * (1 - up)}px) scale(${scale})`
        };
      }

      if (s.phase === 'revealed') {
        const p = curves.dock(t - revealedAt);
        styles.explain = {
          heightFraction: Math.max(0, p),
          opacity: clamp01(p)
        };
      }

      return { view, styles, fade: seam(t, duration) };
    }
  };
}

/**
 * A wrong pick, checked. It shakes, the right answer stands up off the page,
 * the dock floods red with the answer and why, and the strip drops a short
 * red column. Continue sits where Check was.
 */
const check = (): CCScene =>
  practiceScene({
    questions: [backups, serverless],
    first: 4,
    history: [true, true, false, true],
    duration: 10,
    build: (tl, reveal) => {
      const moves: Move[] = [];
      const presses: Press[] = [];
      const snowball = 'backups-2';

      moves.push({ at: 0.55, dur: 0.75, to: snowball });
      tl.set(1.24, { hover: snowball });
      const pick = 1.58;
      presses.push({ down: pick, up: pick + CLICK });
      tl.set(pick, { pressed: snowball });
      tl.set(pick + CLICK, { pressed: null, selected: [snowball] });

      moves.push({ at: 2.25, dur: 0.75, to: 'primary' });
      tl.set(2.42, { hover: null });
      const checkAt = 3.35;
      presses.push({ down: checkAt, up: checkAt + CLICK });
      tl.set(checkAt, { pressed: 'primary' });
      tl.set(checkAt + CLICK, { pressed: null, checking: true });
      reveal(checkAt + CLICK + CHECK_RTT);

      // The button never moved: Continue is under the pointer already.
      const continueAt = 7.6;
      presses.push({ down: continueAt, up: continueAt + CLICK });
      tl.set(continueAt, { pressed: 'primary' });
      tl.set(continueAt + CLICK, {
        pressed: null,
        q: 1,
        selected: [],
        phase: 'answering'
      });

      return { pointer: { start: { x: 900, y: 230 }, moves, presses } };
    }
  });

/**
 * A run kept going from the keyboard: digits pick and carry focus, the
 * options left over fade once two are picked, and Enter checks. The third
 * right answer in a row climbs the staircase and lights the flame; Enter
 * again moves on.
 */
const keyboard = (): CCScene =>
  practiceScene({
    questions: [serverless, metrics],
    first: 3,
    history: [false, true, true],
    duration: 8,
    build: (tl, reveal) => {
      const keys = script(0.75);
      const pick = (digit: number) => {
        const at = keys.now;
        keys.press(String(digit));
        const id = `serverless-${digit - 1}`;
        const s = tl.stateAt(at);
        tl.set(at, { selected: [...s.selected, id], focus: id });
        keys.wait(0.7);
      };
      pick(2);
      pick(3);
      keys.wait(0.1);
      const checkAt = keys.now;
      keys.press('Enter');
      tl.set(checkAt, { checking: true });
      reveal(checkAt + CHECK_RTT);
      keys.at(5.5);
      const continueAt = keys.now;
      keys.press('Enter');
      // The focused option belonged to the last question; focus goes with it.
      tl.set(continueAt, {
        q: 1,
        selected: [],
        phase: 'answering',
        focus: null
      });

      return { strokes: keys.strokes };
    }
  });

/* -------------------------------------------------------------------------- */
/* Exam: QuestionCard, ConfidenceRating and the strip                          */
/* -------------------------------------------------------------------------- */

type ExamState = {
  q: number;
  answers: Record<number, string[]>;
  ratings: Record<number, Rating>;
  hover: string | null;
  pressed: string | null;
};

const RATINGS: Rating[] = ['guess', 'unsure', 'confident'];
const needsReview = (r: Rating | null | undefined) =>
  r === 'guess' || r === 'unsure';

/** exam-strip.tsx: Confidence sets the height; an unrated answer stays low. */
const confidenceHeight = (r: Rating | null | undefined) =>
  r === 'confident' ? 100 : r === 'unsure' ? 70 : r === 'guess' ? 45 : 25;

/**
 * Questions 1–23 are behind the visitor: c confident, u unsure, g guess,
 * a answered without a rating.
 */
const EARLIER = 'ccuccgcacccuccgccucccac';
const earlier = (i: number): Rating | null => {
  const c = EARLIER[i];
  return c === 'c'
    ? 'confident'
    : c === 'u'
      ? 'unsure'
      : c === 'g'
        ? 'guess'
        : null;
};

const STRIP_FILL: Record<StripTone, Rgba> = {
  empty: EMPTY,
  answered: PRIMARY,
  revisit: SECONDARY
};

const revisit = (): CCScene => {
  const examQuestions: Record<number, Question> = {
    23: permissions,
    24: support
  };
  const tl = new Timeline<ExamState>({
    q: 23,
    answers: {},
    ratings: {},
    hover: null,
    pressed: null
  });
  const moves: Move[] = [];
  const presses: Press[] = [];
  const click = (at: number, id: string, then: Partial<ExamState>) => {
    presses.push({ down: at, up: at + CLICK });
    tl.set(at, { pressed: id });
    tl.set(at + CLICK, { pressed: null, ...then });
    return at + CLICK;
  };

  const role = 'permissions-2';
  moves.push({ at: 0.5, dur: 0.75, to: role });
  tl.set(1.19, { hover: role });
  click(1.5, role, { answers: { 23: [role] } });

  moves.push({ at: 2.0, dur: 0.75, to: 'conf-guess' });
  tl.set(2.1, { hover: null });
  click(3.05, 'conf-guess', { ratings: { 23: 'guess' } });

  moves.push({ at: 3.75, dur: 0.6, to: 'next' });
  click(4.65, 'next', { q: 24 });

  // Back along the strip: the column is the Question under the pointer.
  moves.push({ at: 5.5, dur: 0.95, to: 'col-23' });
  click(6.95, 'strip', { q: 23 });

  const duration = 10;
  const questionOf = (s: ExamState) => examQuestions[s.q] as Question;
  const cellOf = (s: ExamState, i: number): StripCell => {
    const answered = i < 23 || (s.answers[i]?.length ?? 0) > 0;
    const rating = i < 23 ? earlier(i) : s.ratings[i];
    return answered
      ? {
          height: confidenceHeight(rating),
          tone: needsReview(rating) ? 'revisit' : 'answered'
        }
      : { height: 0, tone: 'empty' };
  };

  const views = tl.views<ExamView>(s => ({
    kind: 'exam',
    question: questionOf(s),
    index: s.q,
    total: quiz.total,
    selected: s.answers[s.q] ?? [],
    rating: s.ratings[s.q] ?? null,
    cells: Array.from({ length: quiz.total }, (_, i) => cellOf(s, i))
  }));

  const options = Object.entries(examQuestions).flatMap(([qi, q]) =>
    q.answers.map((a, i) => {
      const on = (s: ExamState) => s.q === Number(qi);
      const selected = (s: ExamState) => (s.answers[s.q] ?? []).includes(a.id);
      const lowered = (s: ExamState) => selected(s) || s.pressed === a.id;
      return {
        id: a.id,
        i,
        qi: Number(qi),
        background: tl.color(s => {
          if (!on(s)) return undefined;
          if (selected(s)) return PRIMARY;
          return s.hover === a.id ? HOVER : WHITE;
        }, curves.press),
        lowered: tl.number(
          s => (on(s) ? press(lowered(s)) : undefined),
          curves.press
        )
      };
    })
  );
  const ratings = RATINGS.map(r => {
    const id = `conf-${r}`;
    const chosen = (s: ExamState) => s.ratings[s.q] === r;
    return {
      id,
      background: tl.color(
        s => (chosen(s) ? (r === 'confident' ? PRIMARY : SECONDARY) : WHITE),
        curves.option
      ),
      lowered: tl.number(
        s => press(chosen(s) || s.pressed === id),
        curves.option
      )
    };
  });
  const ratingOpacity = tl.number(
    s => ((s.answers[s.q]?.length ?? 0) > 0 ? 1 : 0.3),
    curves.all
  );
  const buttons = ['prev', 'next'].map(id => ({
    id,
    press: tl.number(s => press(s.pressed === id), curves.press)
  }));
  // Only the Questions this moment touches change; the rest stand as drawn.
  const columns = Object.keys(examQuestions)
    .map(Number)
    .map(i => ({
      i,
      height: tl.number(s => {
        const cell = cellOf(s, i);
        return cell.tone === 'empty' ? 3 : (cell.height / 100) * STRIP_H;
      }, curves.strip),
      fill: tl.color(s => STRIP_FILL[cellOf(s, i).tone], curves.strip)
    }));
  const left = (i: number) => ((i + 0.5) / quiz.total) * 100;

  return {
    duration,
    url: 'cloudcertify.snowye.dev/quiz/1/session',
    strokes: [],
    pointer: { start: { x: 900, y: 230 }, moves, presses },
    scrolls: [],
    frame: t => {
      const i = tl.indexAt(t);
      const s = tl.states[i] as ExamState;
      const view = views[i] as ExamView;
      const mountedAt = tl.changedAt(t, st => st.q);
      const from = mountedAt === NEVER ? s.q : tl.stateAt(mountedAt - 1e-6).q;
      // Travel follows the index: back to an earlier question comes in from the left.
      const direction = s.q >= from ? 1 : -1;
      const p = mountedAt === NEVER ? 1 : curves.marker(t - mountedAt);
      const styles: Record<string, Style> = {
        question: enter(t - mountedAt, direction),
        marker: { left: `${left(from) + (left(s.q) - left(from)) * p}%` },
        rating: { opacity: ratingOpacity(t) ?? 1 }
      };
      for (const b of buttons) styles[b.id] = dockButton(b.press(t) ?? 0);
      for (const c of columns)
        styles[`col-${c.i}`] = {
          height: `${c.height(t) ?? 3}px`,
          background: rgba(c.fill(t) ?? EMPTY)
        };
      for (const o of options) {
        if (o.qi !== s.q) continue;
        const up = rise(t - mountedAt, o.i);
        const l = o.lowered(t) ?? 0;
        styles[o.id] = {
          background: rgba(o.background(t) ?? WHITE),
          translate: `${4 * l}px ${4 * l}px`,
          boxShadow: shadowOf(4 * (1 - l), 1 - l),
          opacity: clamp01(up),
          transform: `translateY(${10 * (1 - up)}px)`
        };
      }
      for (const r of ratings) {
        const l = r.lowered(t) ?? 0;
        styles[r.id] = {
          background: rgba(r.background(t) ?? WHITE),
          translate: `${2 * l}px ${2 * l}px`,
          boxShadow: shadowOf(3 * (1 - l), 1 - l)
        };
      }
      return { view, styles, fade: seam(t, duration) };
    }
  };
};

/* -------------------------------------------------------------------------- */
/* Results: the Drill's columns replayed, then the score                       */
/* -------------------------------------------------------------------------- */

/** The results screen mounts as the last Continue lands. */
const RESULTS_AT = 0.45;

const results = (): CCScene => {
  const outcomes = drill.outcomes;
  const runs = runLengths(outcomes);
  const correct = outcomes.filter(Boolean).length;
  const score = Math.round((correct / outcomes.length) * 100);
  const view: ResultsView = {
    kind: 'results',
    title: drill.title,
    outcomes,
    correct,
    score,
    longestRun: Math.max(0, ...runs),
    passed: score >= drill.passingScore,
    passingScore: drill.passingScore
  };
  // The columns finish rising first; the number answers them.
  const afterColumns = 0.35 + outcomes.length * 0.05;
  const duration = 7;

  return {
    duration,
    url: 'cloudcertify.snowye.dev/quiz/1/drill/1/session',
    strokes: [],
    pointer: null,
    scrolls: [],
    frame: t => {
      const since = t - RESULTS_AT;
      const styles: Record<string, Style> = {};
      outcomes.forEach((outcome, i) => {
        const p = curves.column(since - (0.15 + i * 0.05));
        styles[`col-${i}`] = {
          height: `${columnHeight(outcome, runs[i] ?? 0) * p}%`
        };
      });
      const p = scoreEase(clamp01((since - afterColumns) / 0.9));
      styles.score = { text: String(Math.round(score * p)) };
      return { view, styles, fade: seam(t, duration) };
    }
  };
};

/* -------------------------------------------------------------------------- */
/* Home: the landing page                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The landing's example result: one finished 65-Question Exam, a letter per
 * Question. c confident, u unsure, g guess; upper case is a right answer.
 */
const EXAMPLE =
  'CCUCcCGCCuCCUgCCcCUCuGCgCCCcUCgCCUuCcGCCuCUgCgcCuGCCUCcCgCGCCUCcC';
export const EXAMPLE_SCORE = 742;
export const EXAMPLE_PASSING = 700;

export type ExampleCell = {
  rating: Rating;
  /** Percent of the strip, as tall as the visitor was sure. */
  height: number;
  right: boolean;
  /** The column's colour while the Exam ran: confident, or marked to revisit. */
  before: 'primary' | 'secondary';
  finding: Finding | null;
};

export const exampleCells: ExampleCell[] = Array.from(EXAMPLE, letter => {
  const r = letter.toLowerCase();
  const rating: Rating =
    r === 'c' ? 'confident' : r === 'u' ? 'unsure' : 'guess';
  return {
    rating,
    height: r === 'c' ? 100 : r === 'u' ? 70 : 45,
    right: letter !== r,
    before: r === 'c' ? 'primary' : 'secondary',
    finding: letter === 'c' ? 'misconception' : letter === 'G' ? 'lucky' : null
  };
});

const firstOf = (finding: Finding) =>
  exampleCells.findIndex(cell => cell.finding === finding);

/** RotatingText: rotationInterval 2200, staggerDuration 0.025 from the last. */
const ROTATE_EVERY = 2.2;
const STAGGER = 0.025;
/** Marquee: one loop of its doubled row, `speed` 28 s. */
const MARQUEE_LOOP = 28;

const exitTime = (text: string) => (text.length - 1) * STAGGER + charOut.settle;

/**
 * The hero names one exam at a time. Two turns through the codes; the
 * marquee under the hero does not line up with them, so the seam fades.
 */
const hero = (): CCScene => {
  const codes = copy.home.codes;
  const duration = 2 * codes.length * ROTATE_EVERY;
  const views = new Map<string, HomeView>();
  const viewOf = (code: string) => {
    let v = views.get(code);
    if (!v) {
      v = { kind: 'home', code, pointed: firstOf('misconception'), spot: null };
      views.set(code, v);
    }
    return v;
  };

  return {
    duration,
    url: 'cloudcertify.snowye.dev',
    strokes: [],
    pointer: null,
    scrolls: [],
    frame: t => {
      // At 0 the last code starts leaving, as it does every turn.
      const k = Math.floor(t / ROTATE_EVERY);
      const since = t - k * ROTATE_EVERY;
      const incoming = codes[k % codes.length] ?? '';
      const outgoing = codes[(k + codes.length - 1) % codes.length] ?? '';
      // AnimatePresence mode="wait": the new code mounts once the old one is out.
      const leaving = since < exitTime(outgoing);
      const code = leaving ? outgoing : incoming;
      const styles: Record<string, Style> = {};
      Array.from(code).forEach((_, i) => {
        const delay = (code.length - 1 - i) * STAGGER;
        const y = leaving
          ? charOut.at(since - delay)
          : charIn.at(since - exitTime(outgoing) - delay);
        styles[`chip-${i}`] = { transform: `translateY(${y}%)` };
      });
      const loop = (((t / MARQUEE_LOOP) % 1) + 1) % 1;
      styles.marquee = { transform: `translateX(${-50 * loop}%)` };
      return { view: viewOf(code), styles, fade: seam(t, duration) };
    }
  };
};

type SkylineState = {
  /** The column under a mouse, if it is on the strip. */
  hover: number | null;
  selected: number;
  spot: Finding | null;
  /** The finding button under the pointer. */
  card: Finding | null;
};

/** The strip's height at `lg`: h-64. */
const SKYLINE_H = 256;

/**
 * The landing's example result, from the load. The columns stand up left to
 * right in their mid-Exam colours and the verdict sweeps across; then the
 * visitor spotlights the misconceptions, reads one off the strip, and moves
 * on to the lucky guesses.
 */
const skyline = (): CCScene => {
  const misconception = firstOf('misconception');
  const lucky = firstOf('lucky');
  // A misconception halfway along the strip, to read off it.
  const read = exampleCells.findIndex(
    (cell, i) => i > 20 && cell.finding === 'misconception'
  );

  const tl = new Timeline<SkylineState>({
    hover: null,
    selected: misconception,
    spot: null,
    card: null
  });
  const moves: Move[] = [];
  const presses: Press[] = [];
  const click = (at: number, then: Partial<SkylineState>) => {
    presses.push({ down: at, up: at + CLICK });
    tl.set(at + CLICK, then);
  };
  // Below the column, past the marker, over the line that reads it.
  const readHeight = exampleCells[read]?.height ?? 100;
  const under = {
    x: 0,
    y: (readHeight / 100) * SKYLINE_H * 0.45 + 30
  };

  moves.push({ at: 3.3, dur: 0.8, to: 'find-misconception' });
  tl.set(4.0, { card: 'misconception' });
  click(4.5, { spot: 'misconception' });

  moves.push({ at: 5.5, dur: 0.8, to: `sky-col-${read}`, offset: under });
  tl.set(5.62, { card: null });
  // Straight up into the column, so the strip only ever sees this one.
  moves.push({ at: 6.6, dur: 0.45, to: `sky-col-${read}` });
  tl.set(6.74, { hover: read });
  click(7.25, { selected: read });

  moves.push({ at: 8.0, dur: 0.4, to: `sky-col-${read}`, offset: under });
  tl.set(8.26, { hover: null });

  moves.push({ at: 8.75, dur: 0.8, to: 'find-lucky' });
  tl.set(9.45, { card: 'lucky' });
  // A finding that does not hold the selected column moves the selection to its first.
  click(9.95, { spot: 'lucky', selected: lucky });
  click(11.75, { spot: null });

  const duration = 14;
  const pointedOf = (s: SkylineState) => s.hover ?? s.selected;
  const views = tl.views<HomeView>(s => ({
    kind: 'home',
    code: copy.home.codes[0] ?? '',
    pointed: pointedOf(s),
    spot: s.spot
  }));

  const columns = exampleCells.map((cell, i) => ({
    before: cell.before === 'primary' ? PRIMARY : SECONDARY,
    after: cell.right ? SUCCESS : DANGER,
    opacity: tl.number(
      s => (s.spot && cell.finding !== s.spot && i !== pointedOf(s) ? 0.15 : 1),
      curves.spotlight
    )
  }));
  const marker = tl.number(pointedOf, curves.press);
  const cards = (['misconception', 'lucky'] as const).map(finding => {
    const on = (s: SkylineState) => s.spot === finding;
    return {
      finding,
      background: tl.color(
        s =>
          on(s)
            ? finding === 'misconception'
              ? DANGER
              : SECONDARY
            : s.card === finding
              ? HOVER
              : WHITE,
        curves.press
      ),
      lowered: tl.number(s => press(on(s)), curves.press)
    };
  });
  const count = exampleCells.length;

  return {
    duration,
    url: 'cloudcertify.snowye.dev',
    strokes: [],
    pointer: { start: { x: 160, y: 790 }, moves, presses },
    // Reloaded where the visitor left it: the result fills the window.
    scrolls: [{ at: -1, target: 'result-foot', mode: 'wheel' }],
    frame: t => {
      const i = tl.indexAt(t);
      const view = views[i] as HomeView;
      const styles: Record<string, Style> = {};
      columns.forEach((c, j) => {
        const rise = curves.skylineRise(t - j * 0.012);
        const verdict = curves.skylineVerdict(t - (1.3 + j * 0.02));
        styles[`sky-col-${j}`] = {
          transform: `scaleY(${rise})`,
          background: rgba(mixRgba(c.before, c.after, verdict)),
          opacity: c.opacity(t) ?? 1
        };
      });
      const m = marker(t) ?? 0;
      styles['sky-marker'] = { left: `${((m + 0.5) / count) * 100}%` };
      for (const card of cards) {
        const l = card.lowered(t) ?? 0;
        styles[`find-${card.finding}`] = {
          background: rgba(card.background(t) ?? WHITE),
          translate: `${4 * l}px ${4 * l}px`,
          boxShadow: shadowOf(4 * (1 - l), 1 - l)
        };
      }
      return { view, styles, fade: seam(t, duration) };
    }
  };
};

export const cloudcertifyScenes = {
  check,
  'keyboard-drill': keyboard,
  revisit,
  results,
  'hero-chip': hero,
  skyline
} as const;

export type CloudCertifyKind = keyof typeof cloudcertifyScenes;
