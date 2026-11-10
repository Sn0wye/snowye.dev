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
  explanationSettle,
  hex,
  keyframes,
  motionEaseInOut,
  motionEaseOut,
  numberTransition,
  type Rgba,
  rgba,
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

export type Point = { x: number; y: number };

/** The pointer travels to an element (by data-a) or a viewport point. */
export type Move = {
  at: number;
  dur: number;
  to: string | Point;
};

export type Press = { down: number; up: number };

/**
 * Scrolling, by who asks for it. `nearest` is the app's scrollIntoView on
 * the explanation, `question` its scroll back to a new question, and
 * `wheel` a person scrolling until something is in view.
 */
export type ScrollIntent = {
  at: number;
  target: string;
  mode: 'nearest' | 'question' | 'wheel';
};

/** Inline styles per element; `heightFraction` opens to the content's height. */
export type Style = Record<string, string | number>;

export type Rating = 'guess' | 'unsure' | 'confident';
export type OptionMode = 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';

export type PracticeView = {
  kind: 'practice';
  question: Question;
  index: number;
  total: number;
  drillTitle: string;
  banner: string | null;
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
  quizTitle: string;
  selected: string[];
  rating: Rating | null;
  answered: boolean[];
  review: boolean[];
  navOpen: boolean;
};

export type HomeView = { kind: 'home'; chip: string };

export type CCView = PracticeView | ExamView | HomeView;

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
    let at = Number.NEGATIVE_INFINITY;
    const i = this.indexAt(t);
    for (let j = 1; j <= i; j++) {
      const a = this.states[j - 1] as S;
      const b = this.states[j] as S;
      if (key(a) !== key(b)) at = this.times[j] ?? at;
    }
    return at;
  }

  number(select: (s: S) => number | undefined, curve: Curve) {
    return numberTransition(this.times, this.states.map(select), curve);
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
const CREAM = hex('#f5f3ec');
const PRIMARY = hex('#2347d9');
const SUCCESS = hex('#15a06e');
const DANGER = hex('#e23b48');
const WARNING = hex('#ffb020');
const SUCCESS_WASH = wash('#15a06e', 0.15);
const DANGER_WASH = wash('#e23b48', 0.15);

/**
 * The box-shadow stack Tailwind composes: focus ring offset, focus ring,
 * then the hard offset shadow. Each part fades and shrinks with its own
 * progress, as `shadow-none` and a lost focus interpolate.
 */
const shadowOf = (offset: number, shadow: number, ring = 0) =>
  [
    `0 0 0 ${2 * ring}px rgb(255 255 255 / ${ring})`,
    `0 0 0 ${6 * ring}px rgb(0 0 0 / ${0.4 * ring})`,
    `${offset * shadow}px ${offset * shadow}px 0 0 rgb(0 0 0 / ${shadow})`
  ].join(', ');

/** pop.tsx: scale 0.4 → 1 and opacity 0 → 1 on one spring. */
const pop = (since: number): Style =>
  since === Number.NEGATIVE_INFINITY
    ? { transform: 'none', opacity: 1 }
    : {
        transform: `scale(${0.4 + 0.6 * curves.pop(since)})`,
        opacity: clamp01(curves.pop(since))
      };

/** use-question-motion `enter`: in from the side of travel, through a blur. */
const enter = (since: number, direction: number, delay = 0): Style => {
  if (since === Number.NEGATIVE_INFINITY)
    return { opacity: 1, transform: 'none', filter: 'none' };
  const p = curves.question(since - delay);
  return {
    opacity: clamp01(p),
    transform: `translateX(${direction * 24 * (1 - p)}px)`,
    filter: `blur(${Math.max(0, 4 * (1 - p))}px)`
  };
};

const shake = keyframes([0, -6, 5, -3, 2, 0], 0.4, motionEaseOut);
const nod = keyframes([1, 1.015, 1], 0.4, motionEaseOut);

const press = (pressed: boolean) => (pressed ? 1 : 0);

/** A Button's :active, 4 px down and its shadow gone. */
const buttonStyle = (t: number, pressT: (t: number) => number | undefined) => {
  const p = pressT(t) ?? 0;
  return {
    translate: `${4 * p}px ${4 * p}px`,
    boxShadow: shadowOf(4, 1 - p)
  };
};

/** Network for a Check on a fast connection. */
const CHECK_RTT = 0.32;
/** A click: mouse down, then up a beat later; the click lands on up. */
const CLICK = 0.09;

/* -------------------------------------------------------------------------- */
/* Practice: PracticeQuestionCard in a Drill                                   */
/* -------------------------------------------------------------------------- */

type PracticeState = {
  q: number;
  selected: string[];
  phase: 'answering' | 'revealed';
  checking: boolean;
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
  return s.selected.includes(id) ? 'selected' : 'idle';
};

function practiceScene({
  questions,
  first,
  duration,
  build
}: {
  questions: Question[];
  /** Zero-based drill index of the first question. */
  first: number;
  duration: number;
  build: (tl: Timeline<PracticeState>) => {
    strokes?: Stroke[];
    pointer?: CCScene['pointer'];
    scrolls: ScrollIntent[];
  };
}): CCScene {
  const tl = new Timeline<PracticeState>({
    q: 0,
    selected: [],
    phase: 'answering',
    checking: false,
    hover: null,
    pressed: null,
    focus: null
  });
  const { strokes = [], pointer = null, scrolls } = build(tl);
  const questionOf = (s: PracticeState) => questions[s.q] as Question;

  const views = tl.views<PracticeView>(s => {
    const q = questionOf(s);
    const index = first + s.q;
    const picked = q.answers.filter(a => s.selected.includes(a.id));
    return {
      kind: 'practice',
      question: q,
      index,
      total: drill.total,
      drillTitle: drill.title,
      // Only before the first answer of the drill (drill-session.tsx).
      banner:
        index === 0 && s.phase === 'answering'
          ? copy.composition(drill.composition)
          : null,
      phase: s.phase,
      checking: s.checking,
      modes: Object.fromEntries(q.answers.map(a => [a.id, modeOf(s, q, a.id)])),
      correct:
        picked.length === q.selectCount &&
        picked.every(a => a.correct) &&
        s.selected.length === q.selectCount,
      canCheck: s.selected.length === q.selectCount
    };
  });

  // Every answer's CSS transitions, built once from the state they ask for.
  const options = questions.flatMap((q, qi) =>
    q.answers.map(a => {
      const on = (s: PracticeState) => s.q === qi;
      const mode = (s: PracticeState) => modeOf(s, q, a.id);
      return {
        id: a.id,
        qi,
        background: tl.color(s => {
          if (!on(s)) return undefined;
          const m = mode(s);
          if (m === 'selected') return PRIMARY;
          if (m === 'correct') return SUCCESS_WASH;
          if (m === 'wrong') return DANGER_WASH;
          return m === 'idle' && s.hover === a.id ? CREAM : WHITE;
        }, curves.option),
        translate: tl.number(s => {
          if (!on(s)) return undefined;
          const m = mode(s);
          return m === 'selected' || (m === 'idle' && s.pressed === a.id)
            ? 2
            : 0;
        }, curves.option),
        shadow: tl.number(s => {
          if (!on(s)) return undefined;
          return mode(s) === 'idle' && s.pressed !== a.id ? 1 : 0;
        }, curves.option),
        opacity: tl.number(
          s => (on(s) ? (mode(s) === 'dim' ? 0.55 : 1) : undefined),
          curves.option
        ),
        ring: tl.number(
          s => (on(s) ? press(s.focus === a.id) : undefined),
          curves.option
        ),
        icon: (s: PracticeState) => {
          if (!on(s)) return null;
          const m = mode(s);
          return m === 'selected' || m === 'correct' || m === 'wrong'
            ? m
            : null;
        }
      };
    })
  );
  const checkPress = tl.number(
    s => press(s.pressed === 'check'),
    curves.button
  );
  const progress = tl.number(
    s => ((first + s.q + 1) / drill.total) * 100,
    curves.all
  );

  return {
    duration,
    url: 'cloudcertify.snowye.dev/quiz/1/drill/1/session',
    strokes,
    pointer,
    scrolls,
    frame: t => {
      const i = tl.indexAt(t);
      const s = tl.states[i] as PracticeState;
      const view = views[i] as PracticeView;
      const mountedAt = tl.changedAt(t, st => st.q);
      const revealedAt = tl.changedAt(t, st => `${st.q}:${st.phase}`);
      const checkingAt = tl.changedAt(t, st => st.checking);
      const styles: Record<string, Style> = {
        title: enter(t - mountedAt, 1),
        answers: enter(t - mountedAt, 1, 0.05),
        check: buttonStyle(t, checkPress),
        bar: { transform: `translateX(-${100 - (progress(t) ?? 0)}%)` },
        spinner: { transform: `rotate(${((t - checkingAt) % 1) * 360}deg)` }
      };

      for (const o of options) {
        if (o.qi !== s.q) continue;
        const ring = o.ring(t) ?? 0;
        const x = view.modes[o.id] === 'wrong' ? shake(t - revealedAt) : 0;
        const scale =
          view.modes[o.id] === 'correct' && s.phase === 'revealed'
            ? nod(t - revealedAt)
            : 1;
        styles[o.id] = {
          background: rgba(o.background(t) ?? WHITE),
          translate: `${o.translate(t) ?? 0}px ${o.translate(t) ?? 0}px`,
          boxShadow: shadowOf(4, o.shadow(t) ?? 0, ring),
          opacity: o.opacity(t) ?? 1,
          transform: `translateX(${x}px) scale(${scale})`
        };
        styles[`${o.id}-icon`] = pop(t - tl.changedAt(t, o.icon));
      }

      if (s.phase === 'revealed') {
        const p = curves.question(t - revealedAt);
        styles.explain = { heightFraction: p, opacity: clamp01(p) };
        styles['explain-icon'] = pop(t - revealedAt);
        styles['continue-label'] = {
          transform: `translateY(${8 * (1 - p)}px)`,
          opacity: clamp01(p)
        };
      }

      return { view, styles, fade: seam(t, duration) };
    }
  };
}

/**
 * A wrong pick, checked: it shakes, the right answer nods, and the
 * explanation opens and scrolls itself into view. Then Continue.
 */
const check = (): CCScene =>
  practiceScene({
    questions: [backups, serverless],
    first: 0,
    duration: 10.4,
    build: tl => {
      const moves: Move[] = [];
      const presses: Press[] = [];
      const snowball = 'backups-2';

      moves.push({ at: 0.55, dur: 0.75, to: snowball });
      tl.set(1.24, { hover: snowball });
      const pick = 1.58;
      presses.push({ down: pick, up: pick + CLICK });
      tl.set(pick, { pressed: snowball });
      tl.set(pick + CLICK, { pressed: null, selected: [snowball] });

      // Check is below the fold on a laptop: scroll down to it first.
      const toCheck = 2.05;
      tl.set(2.1, { hover: null });
      moves.push({ at: 2.8, dur: 0.6, to: 'check' });
      const checkAt = 3.62;
      presses.push({ down: checkAt, up: checkAt + CLICK });
      tl.set(checkAt, { pressed: 'check' });
      tl.set(checkAt + CLICK, { pressed: null, checking: true });
      const revealAt = checkAt + CLICK + CHECK_RTT;
      tl.set(revealAt, { checking: false, phase: 'revealed' });

      // Continue is under the explanation now: scroll to it, then press it.
      const toContinue = 6.4;
      moves.push({ at: 7.05, dur: 0.55, to: 'check' });
      const continueAt = 7.85;
      presses.push({ down: continueAt, up: continueAt + CLICK });
      tl.set(continueAt, { pressed: 'check' });
      tl.set(continueAt + CLICK, {
        pressed: null,
        q: 1,
        selected: [],
        phase: 'answering'
      });

      return {
        pointer: { start: { x: 880, y: 300 }, moves, presses },
        scrolls: [
          {
            at: revealAt + explanationSettle,
            target: 'explain',
            mode: 'nearest'
          },
          { at: toCheck, target: 'check', mode: 'wheel' },
          { at: toContinue, target: 'check', mode: 'wheel' },
          { at: continueAt + CLICK, target: 'card', mode: 'question' }
        ]
      };
    }
  });

/**
 * The same drill from the keyboard: digits pick, Enter checks and
 * continues, and focus follows the last digit pressed.
 */
const keyboard = (): CCScene =>
  practiceScene({
    questions: [serverless, metrics],
    first: 1,
    duration: 8,
    build: tl => {
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
      const revealAt = checkAt + CHECK_RTT;
      tl.set(revealAt, { checking: false, phase: 'revealed' });
      keys.at(5.4);
      const continueAt = keys.now;
      keys.press('Enter');
      // The focused option belonged to the last question; focus goes with it.
      tl.set(continueAt, {
        q: 1,
        selected: [],
        phase: 'answering',
        focus: null
      });

      return {
        strokes: keys.strokes,
        scrolls: [
          {
            at: revealAt + explanationSettle,
            target: 'explain',
            mode: 'nearest'
          },
          { at: continueAt, target: 'card', mode: 'question' }
        ]
      };
    }
  });

/* -------------------------------------------------------------------------- */
/* Exam: QuestionCard, ConfidenceRating and the Navigator                      */
/* -------------------------------------------------------------------------- */

type ExamState = {
  q: number;
  answers: Record<number, string[]>;
  ratings: Record<number, Rating>;
  navOpen: boolean;
  hover: string | null;
  pressed: string | null;
};

const RATINGS: Rating[] = ['guess', 'unsure', 'confident'];
const RATING_FILL: Record<Rating, Rgba> = {
  guess: DANGER,
  unsure: WARNING,
  confident: SUCCESS
};
const needsReview = (r: Rating | undefined) => r === 'guess' || r === 'unsure';

/** Questions 1–6 are behind the visitor; they were unsure about 3. */
const EARLIER: Record<number, Rating> = { 2: 'unsure' };

const revisit = (): CCScene => {
  const examQuestions: Record<number, Question> = {
    6: permissions,
    7: support
  };
  const tl = new Timeline<ExamState>({
    q: 6,
    answers: {},
    ratings: {},
    navOpen: false,
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
  click(1.5, role, { answers: { 6: [role] } });
  tl.set(1.9, { hover: null });
  const wheel = 2.15;

  moves.push({ at: 2.75, dur: 0.6, to: 'conf-guess' });
  tl.set(3.29, { hover: 'conf-guess' });
  click(3.6, 'conf-guess', { ratings: { 6: 'guess' } });

  moves.push({ at: 4.4, dur: 0.55, to: 'next' });
  tl.set(4.45, { hover: null });
  const nextAt = click(5.2, 'next', { q: 7 });

  moves.push({ at: 6.0, dur: 0.7, to: 'nav-open' });
  click(6.95, 'nav-open', { navOpen: true });

  moves.push({ at: 7.55, dur: 0.65, to: 'nav-6' });
  const jumpAt = click(8.5, 'nav-6', { navOpen: false, q: 6 });

  const duration = 11;
  const questionOf = (s: ExamState) => examQuestions[s.q] as Question;

  const views = tl.views<ExamView>(s => {
    const answered = Array.from({ length: quiz.total }, (_, i) =>
      i < 6 ? true : (s.answers[i]?.length ?? 0) > 0
    );
    const review = Array.from({ length: quiz.total }, (_, i) =>
      needsReview(i < 6 ? EARLIER[i] : s.ratings[i])
    );
    return {
      kind: 'exam',
      question: questionOf(s),
      index: s.q,
      total: quiz.total,
      quizTitle: quiz.title,
      selected: s.answers[s.q] ?? [],
      rating: s.ratings[s.q] ?? null,
      answered,
      review,
      navOpen: s.navOpen
    };
  });

  const answered = (s: ExamState) => (s.answers[s.q]?.length ?? 0) > 0;
  const options = Object.entries(examQuestions).flatMap(([qi, q]) =>
    q.answers.map(a => {
      const on = (s: ExamState) => s.q === Number(qi);
      const selected = (s: ExamState) => (s.answers[s.q] ?? []).includes(a.id);
      return {
        id: a.id,
        qi: Number(qi),
        background: tl.color(s => {
          if (!on(s)) return undefined;
          if (selected(s)) return PRIMARY;
          return s.hover === a.id ? CREAM : WHITE;
        }, curves.option),
        translate: tl.number(
          s =>
            on(s) ? (selected(s) || s.pressed === a.id ? 2 : 0) : undefined,
          curves.option
        ),
        shadow: tl.number(
          s =>
            on(s) ? (selected(s) || s.pressed === a.id ? 0 : 1) : undefined,
          curves.option
        ),
        icon: (s: ExamState) => (on(s) && selected(s) ? s.q : null)
      };
    })
  );
  const ratings = RATINGS.map(r => {
    const id = `conf-${r}`;
    const on = answered;
    const chosen = (s: ExamState) => s.ratings[s.q] === r;
    return {
      id,
      background: tl.color(s => {
        if (!on(s)) return undefined;
        if (chosen(s)) return RATING_FILL[r];
        return s.hover === id ? CREAM : WHITE;
      }, curves.option),
      lowered: tl.number(
        s => (on(s) ? press(chosen(s) || s.pressed === id) : undefined),
        curves.option
      ),
      // Keyed on whether it is chosen: a flip remounts the icon and pops it.
      icon: (s: ExamState) => (on(s) ? `${s.q}:${chosen(s)}` : null)
    };
  });
  const buttons = ['prev', 'next', 'nav-open'].map(id => ({
    id,
    press: tl.number(s => press(s.pressed === id), curves.button)
  }));
  const squarePress = tl.number(
    s => (s.navOpen ? press(s.pressed === 'nav-6') : undefined),
    curves.all
  );
  const progress = tl.number(s => ((s.q + 1) / quiz.total) * 100, curves.all);

  return {
    duration,
    url: 'cloudcertify.snowye.dev/quiz/1/session',
    strokes: [],
    pointer: { start: { x: 900, y: 260 }, moves, presses },
    scrolls: [
      { at: wheel, target: 'rating', mode: 'wheel' },
      { at: nextAt, target: 'card', mode: 'question' },
      { at: jumpAt, target: 'card', mode: 'question' }
    ],
    frame: t => {
      const i = tl.indexAt(t);
      const s = tl.states[i] as ExamState;
      const view = views[i] as ExamView;
      const mountedAt = tl.changedAt(t, st => st.q);
      // Travel follows the index: back to an earlier question comes in from the left.
      const direction =
        mountedAt === Number.NEGATIVE_INFINITY ||
        s.q > tl.stateAt(mountedAt - 1e-6).q
          ? 1
          : -1;
      const styles: Record<string, Style> = {
        title: enter(t - mountedAt, direction),
        answers: enter(t - mountedAt, direction, 0.05),
        bar: { transform: `translateX(-${100 - (progress(t) ?? 0)}%)` }
      };
      for (const b of buttons) styles[b.id] = buttonStyle(t, b.press);
      for (const o of options) {
        if (o.qi !== s.q) continue;
        const lowered = o.translate(t) ?? 0;
        styles[o.id] = {
          background: rgba(o.background(t) ?? WHITE),
          translate: `${lowered}px ${lowered}px`,
          boxShadow: shadowOf(4, o.shadow(t) ?? 1)
        };
        styles[`${o.id}-icon`] = pop(t - tl.changedAt(t, o.icon));
      }
      if (view.selected.length > 0)
        for (const r of ratings) {
          const lowered = r.lowered(t) ?? 0;
          styles[r.id] = {
            background: rgba(r.background(t) ?? WHITE),
            translate: `${2 * lowered}px ${2 * lowered}px`,
            boxShadow: shadowOf(4, 1 - lowered)
          };
          styles[`${r.id}-icon`] = pop(t - tl.changedAt(t, r.icon));
        }
      if (s.navOpen) {
        const p = squarePress(t) ?? 0;
        styles['nav-6'] = {
          translate: `${2 * p}px ${2 * p}px`,
          boxShadow: shadowOf(2, 1 - p)
        };
      }
      return { view, styles, fade: seam(t, duration) };
    }
  };
};

/* -------------------------------------------------------------------------- */
/* Home: the hero's rotating provider chip                                     */
/* -------------------------------------------------------------------------- */

/** RotatingText: rotationInterval 2000, staggerDuration 0.025 from the last. */
const ROTATE_EVERY = 2;
const STAGGER = 0.025;
const FLOAT_PERIOD = 3.2;
const floatY = keyframes([0, -9, 0], FLOAT_PERIOD, motionEaseInOut);
/** FloatSticker delays: AWS, Azure, GCP. */
const FLOAT_DELAYS = [0, 0.6, 0.3];

const exitTime = (text: string) => (text.length - 1) * STAGGER + charOut.settle;

const hero = (): CCScene => {
  const chips = copy.home.chips;
  // Three rotations and the stickers' float line up every 48 s.
  const duration = 48;
  const views = new Map<string, HomeView>();
  const viewOf = (chip: string) => {
    let v = views.get(chip);
    if (!v) {
      v = { kind: 'home', chip };
      views.set(chip, v);
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
      // At 0 the previous chip starts leaving, exactly as at 48.
      const k = Math.floor(t / ROTATE_EVERY);
      const since = t - k * ROTATE_EVERY;
      const incoming = chips[k % chips.length] ?? '';
      const outgoing = chips[(k + chips.length - 1) % chips.length] ?? '';
      // AnimatePresence mode="wait": the new word mounts once the old one is out.
      const leaving = since < exitTime(outgoing);
      const chip = leaving ? outgoing : incoming;
      const styles: Record<string, Style> = {};
      Array.from(chip).forEach((_, i) => {
        const delay = (chip.length - 1 - i) * STAGGER;
        const y = leaving
          ? charOut.at(since - delay)
          : charIn.at(since - exitTime(outgoing) - delay);
        styles[`chip-${i}`] = { transform: `translateY(${y}%)` };
      });
      FLOAT_DELAYS.forEach((delay, i) => {
        const local =
          (((t - delay) % FLOAT_PERIOD) + FLOAT_PERIOD) % FLOAT_PERIOD;
        styles[`float-${i}`] = { transform: `translateY(${floatY(local)}px)` };
      });
      return { view: viewOf(chip), styles, fade: 1 };
    }
  };
};

export const cloudcertifyScenes = {
  check,
  'keyboard-drill': keyboard,
  revisit,
  'hero-chip': hero
} as const;

export type CloudCertifyKind = keyof typeof cloudcertifyScenes;
