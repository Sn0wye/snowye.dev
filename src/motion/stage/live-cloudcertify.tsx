'use client';

import { cubicBezier } from 'motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { flushSync } from 'react-dom';

import { cn } from '@/lib/cn';
import { copy, type Question } from '@/motion/cloudcertify/content';
import { clamp01, type Curve } from '@/motion/cloudcertify/curves';
import {
  type CCFrame,
  type CCScene,
  type CCView,
  type CloudCertifyKind,
  cloudcertifyScenes,
  type ExamView,
  HEADER_H,
  type HomeView,
  type OptionMode,
  type Point,
  type PracticeView,
  type ResultsView,
  runLengths,
  type StripCell,
  VIEW_H,
  VIEW_W
} from '@/motion/cloudcertify/moments';
import { type KeystrokeFrame, keystrokesAt } from '@/motion/keystrokes';
import { archivo } from '@/styles/archivo';

import { KeystrokeBar } from './keystrokes';

/* -------------------------------------------------------------------------- */
/* The app's look                                                              */
/* -------------------------------------------------------------------------- */

/** Archivo on the body, as the app's root layout sets it. */
const SANS = archivo.style.fontFamily;
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/** lucide-react 0.486, the version the app ships. */
const ICONS = {
  tick: ['M20 6 9 17l-5-5'],
  flame: [
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'
  ],
  volume: [
    'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
    'M16 9a5 5 0 0 1 0 6',
    'M19.364 18.364a9 9 0 0 0 0-12.728'
  ],
  check: ['M21.801 10A10 10 0 1 1 17 3.335', 'm9 11 3 3L22 4'],
  alert: [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4',
    'M12 17h.01'
  ],
  loader: ['M21 12a9 9 0 1 1-6.219-8.56'],
  sparkles: [
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    'M20 3v4',
    'M22 5h-4',
    'M4 17v2',
    'M5 18H3'
  ],
  right: ['M5 12h14', 'm12 5 7 7-7 7'],
  left: ['m12 19-7-7 7-7', 'M19 12H5'],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  enter: ['M9 10 4 15 9 20', 'M20 4v7a4 4 0 0 1-4 4H4'],
  languages: [
    'm5 8 6 6',
    'm4 14 6-6 2-3',
    'M2 5h12',
    'M7 2h1',
    'm22 22-5-10-5 10',
    'M14 18h6'
  ],
  coffee: [
    'M10 2v2',
    'M14 2v2',
    'M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1',
    'M6 2v2'
  ]
} as const;

function Icon({
  name,
  className,
  style,
  strokeWidth = 2,
  fill = 'none'
}: {
  name: keyof typeof ICONS;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('size-4 shrink-0', className)}
      style={style}
    >
      {ICONS[name].map(d => {
        if (d.startsWith('circle:')) {
          const [, cx, cy, r] = d.split(':');
          return <circle key={d} cx={cx} cy={cy} r={r} />;
        }
        return <path key={d} d={d} />;
      })}
    </svg>
  );
}

const C = {
  primary: '#2347d9',
  success: '#15a06e',
  danger: '#e23b48',
  warning: '#ffb020',
  secondary: '#ffb020',
  page: '#f5f3ec'
};

/** Button, as button-variants.ts lays it out; the shadow comes from the frame. */
const button = (
  variant: 'default' | 'outline',
  size: 'md' | 'sm' | 'lg' | 'icon'
) =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-2 border-2 border-black text-center font-bold text-sm',
    variant === 'default' ? 'bg-[#2347d9] text-white' : 'bg-white text-black',
    size === 'md' && 'min-h-10 px-5 py-2',
    size === 'sm' && 'min-h-9 gap-1.5 px-4 py-1.5',
    size === 'lg' && 'min-h-12 px-8 py-2 text-base',
    size === 'icon' && 'size-10'
  );
const HARD_4 = 'shadow-[4px_4px_0px_0px_#000]';
const HARD_2 = 'shadow-[2px_2px_0px_0px_#000]';

/* -------------------------------------------------------------------------- */
/* Chrome: AppHeader, PageBackLink, Footer                                     */
/* -------------------------------------------------------------------------- */

function Logo({ size }: { size: 'header' | 'footer' }) {
  const header = size === 'header';
  return (
    <span
      className={cn(
        'flex items-center gap-2 font-black text-black',
        header ? 'text-xl' : 'text-lg'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center border-2 border-black bg-[#2347d9]',
          HARD_2,
          header ? 'size-10' : 'size-8'
        )}
      >
        <Icon
          name="cloud"
          className={cn('text-white', header ? 'size-5' : 'size-4')}
        />
      </span>
      <span>CloudCertify</span>
    </span>
  );
}

function LanguageSwitcher() {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-black bg-white p-1',
        HARD_2
      )}
    >
      <Icon name="languages" className="ml-1 text-black" />
      <span className="border-2 border-black bg-[#2347d9] px-2 py-0.5 font-black text-white text-xs">
        EN
      </span>
      <span className="border-2 border-transparent px-2 py-0.5 font-black text-black text-xs">
        PT
      </span>
    </span>
  );
}

/** Sticky: the painter keeps it at the top of the viewport as the page scrolls. */
function AppHeader({ home }: { home?: boolean }) {
  return (
    <header
      data-sticky={0}
      className="relative z-50 w-full border-black border-b-2 bg-white"
    >
      <div
        className={cn(
          'mx-auto flex h-16 w-full items-center justify-between gap-3 px-8',
          home && 'grid grid-cols-[1fr_auto_1fr]'
        )}
      >
        <Logo size="header" />
        {home && (
          <nav className="flex items-center justify-center gap-6">
            {copy.home.links.map(link => (
              <span key={link} className="font-bold text-black text-sm">
                {link}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center justify-end gap-3">
          {home ? (
            <>
              <LanguageSwitcher />
              <span className={cn(button('default', 'sm'), HARD_4)}>
                {copy.home.dashboard}
              </span>
            </>
          ) : (
            // Signed in: the profile menu, its avatar the name's initial.
            <span className={cn(button('outline', 'icon'), HARD_4)}>
              <span className="flex size-8 items-center justify-center border-2 border-black bg-[#2347d9] font-black text-sm text-white">
                G
              </span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <span className="mb-6 inline-flex items-center gap-2 font-bold text-black text-sm">
      <Icon name="left" />
      {label}
    </span>
  );
}

function Footer() {
  return (
    <footer className="w-full border-black border-t-2 bg-white">
      <div className="mx-auto flex h-24 w-full flex-row items-center justify-between gap-4 px-8">
        <Logo size="footer" />
        <div className="flex flex-row items-center gap-6">
          <span
            className={cn(
              'inline-flex items-center gap-2 border-2 border-black bg-[#FFDD00] px-4 py-2 font-black text-black text-sm',
              HARD_2
            )}
          >
            <Icon name="coffee" />
            {copy.footer.coffee}
          </span>
          <p className="text-left font-medium text-black/70 text-sm">
            {copy.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* An attempt: AttemptFrame, AttemptQuestion and the dock                      */
/* -------------------------------------------------------------------------- */

const difficultyFill = { easy: C.success, medium: C.warning, hard: C.danger };

/** DifficultyBadge: the outline Badge, filled by difficulty. */
function DifficultyBadge({ question }: { question: Question }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center justify-center gap-1 overflow-hidden break-words border-2 border-black px-3 py-1 text-center font-bold text-black text-xs',
        HARD_2
      )}
      style={{ background: difficultyFill[question.difficulty] }}
    >
      {copy.difficulty[question.difficulty]}
    </span>
  );
}

/** ui/kbd.tsx: a keycap like the outline Badge, shown wherever there is a fine pointer. */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 shrink-0 items-center justify-center border-2 border-black bg-white px-1.5 font-black text-black text-xs leading-none',
        HARD_2
      )}
      style={{ fontFamily: 'inherit' }}
    >
      {children}
    </kbd>
  );
}

/** shortcut-legend.tsx: the screen's shortcuts, md and up with a fine pointer. */
function ShortcutLegend({
  items,
  className
}: {
  items: { keys: React.ReactNode[]; label: string }[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 font-bold text-black/60 text-xs',
        className
      )}
    >
      {items.map(item => (
        <li key={item.label} className="flex items-center gap-1.5">
          {item.keys.map((key, i) => (
            <Kbd key={i}>{key}</Kbd>
          ))}
          <span className="ml-0.5">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

const enterKey = <Icon name="enter" className="size-3" />;
const selectKey = (count: number) => `1–${Math.min(count, 9)}`;

/** The full-screen frame: a way out, the strip, the Question; the dock is drawn over it. */
function AttemptFrame({
  strip,
  aside,
  children
}: {
  strip: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[800px] flex-col">
      <header className="relative z-10 px-4 pt-2 pb-3">
        <div className="mx-auto flex max-w-4xl items-end gap-5">
          <span
            data-hand
            className="-ml-2 flex size-11 shrink-0 items-center justify-center"
          >
            <Icon name="close" className="size-6" strokeWidth={3} />
          </span>
          {strip}
          {aside}
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-10">
        {children}
      </main>
    </div>
  );
}

/** The dock, pinned to the bottom of the window so the primary action never moves. */
function Dock({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-a="dock"
      className="absolute inset-x-0 bottom-0 z-20 border-black border-t-4 bg-white px-4 pt-4 pb-4"
    >
      <div className="mx-auto flex max-w-4xl flex-row items-end gap-8">
        {children}
      </div>
    </div>
  );
}

const DOCK_BUTTON =
  'flex h-14 shrink-0 items-center justify-center border-2 border-black font-black text-lg';

/** AttemptQuestion: the counter line, the Question, and two columns of options. */
function AttemptQuestion({
  index,
  total,
  question,
  actions,
  option
}: {
  index: number;
  total: number;
  question: Question;
  actions?: React.ReactNode;
  option: (
    answer: Question['answers'][number],
    i: number
  ) => { ink: string; mark: 'check' | 'x' | null; hand: boolean };
}) {
  return (
    <>
      <div key={question.id} data-a="question">
        <div className="flex items-center gap-3">
          <p className="font-bold text-black/60 text-sm">
            {copy.counter(index + 1, total)}
          </p>
          <DifficultyBadge question={question} />
          <span className="flex-1" />
          {actions}
          {/* SoundToggle: sound on. */}
          <span
            data-hand
            className="-my-3 -mr-2 flex size-11 items-center justify-center text-black"
          >
            <Icon name="volume" className="size-5" strokeWidth={2.5} />
          </span>
        </div>
        <h1
          className="mt-3 max-w-[34ch] font-extrabold text-4xl leading-[1.15]"
          style={{ fontStretch: '88%' }}
        >
          {question.text}
        </h1>
        {question.selectCount > 1 && (
          <p className="mt-3 font-bold">
            {copy.selectAnswers(question.selectCount)}
          </p>
        )}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4">
        {question.answers.map((answer, i) => {
          const { ink, mark, hand } = option(answer, i);
          return (
            <div
              key={answer.id}
              data-a={answer.id}
              data-hand={hand || undefined}
              className={cn(
                'flex min-h-16 items-center gap-3 border-2 border-black p-4 text-left font-semibold text-lg leading-snug',
                ink
              )}
            >
              {/* One box, three jobs: the shortcut key, the pick, then the verdict. */}
              <span className="flex size-7 shrink-0 items-center justify-center border-2 border-black bg-white font-black text-black text-sm">
                {mark ? (
                  <Icon
                    name={mark === 'check' ? 'tick' : 'close'}
                    strokeWidth={4}
                  />
                ) : (
                  i < 9 && <span>{i + 1}</span>
                )}
              </span>
              {answer.text}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Drill                                                                       */
/* -------------------------------------------------------------------------- */

/** drill-columns.tsx: one column per Question, a streak a staircase. */
function DrillColumns({
  outcomes,
  current,
  className
}: {
  outcomes: (boolean | null)[];
  current: number;
  className?: string;
}) {
  const runs = runLengths(outcomes);
  return (
    <div className={cn('flex items-end border-black border-b-2', className)}>
      {outcomes.map((outcome, i) => {
        // Neighbouring right answers share a border, so a streak is one shape.
        const joined = outcome === true && outcomes[i - 1] === true;
        const gap = i === 0 ? '' : joined ? '-ml-[2px]' : 'ml-[3px]';
        if (outcome === null)
          return i === current ? (
            <div
              key={`${i}-current`}
              data-a={`col-${i}`}
              className={cn(
                'h-1/4 flex-1 border-2 border-black border-dashed border-b-0',
                gap
              )}
            />
          ) : (
            <div
              key={`${i}-empty`}
              className={cn('h-[3px] flex-1 bg-black/20', gap)}
            />
          );
        return (
          <div
            key={`${i}-${outcome}`}
            data-a={`col-${i}`}
            className={cn(
              'min-h-[6px] flex-1 border-2 border-black border-b-0',
              gap
            )}
            style={{
              background: outcome ? C.success : C.danger,
              height: `${outcome ? 20 + 16 * Math.min(runs[i] ?? 0, 5) : 14}%`
            }}
          />
        );
      })}
    </div>
  );
}

const optionInk: Record<OptionMode, string> = {
  idle: 'text-black',
  selected: 'text-white',
  capped: 'text-black',
  correct: 'text-black',
  wrong: 'text-black',
  dim: 'text-black'
};

function PracticePage({ view }: { view: PracticeView }) {
  const revealed = view.phase === 'revealed';
  return (
    <AttemptFrame
      strip={
        <DrillColumns
          outcomes={view.outcomes}
          current={view.current}
          className="h-14 flex-1"
        />
      }
      aside={
        <p
          data-a="streak"
          className="flex min-w-11 items-center justify-end gap-1 pb-0.5"
        >
          <Icon
            name="flame"
            className="size-5"
            strokeWidth={3}
            fill={view.streak >= 3 ? C.secondary : 'none'}
          />
          <span
            key={view.streak}
            data-a="streak-num"
            className="inline-block font-black text-xl tabular-nums"
          >
            {view.streak}
          </span>
        </p>
      }
    >
      <AttemptQuestion
        index={view.index}
        total={view.total}
        question={view.question}
        option={answer => {
          const mode = view.modes[answer.id] ?? 'idle';
          return {
            ink: optionInk[mode],
            mark:
              mode === 'correct' || mode === 'selected'
                ? 'check'
                : mode === 'wrong'
                  ? 'x'
                  : null,
            hand:
              !revealed &&
              !view.checking &&
              mode !== 'capped' &&
              (mode !== 'idle' ||
                !view.canCheck ||
                view.question.selectCount === 1)
          };
        }}
      />
    </AttemptFrame>
  );
}

function PracticeDock({ view }: { view: PracticeView }) {
  const revealed = view.phase === 'revealed';
  const { question } = view;
  const answer = question.answers
    .filter(a => a.correct)
    .map(a => a.text)
    .join(', ');
  return (
    <Dock>
      <div className="min-w-0 flex-1">
        {revealed ? (
          <div
            data-a="explain"
            className="overflow-hidden"
            style={{ height: 0 }}
          >
            <div>
              <p
                className="font-black text-3xl"
                style={{ fontStretch: '112%' }}
              >
                {!view.correct
                  ? copy.notQuite
                  : view.streak >= 2
                    ? copy.correctStreak(view.streak)
                    : copy.correct}
              </p>
              {!view.correct && (
                <p className="mt-1 font-bold">{copy.answerIs(answer)}</p>
              )}
              <p className="mt-1 max-w-[70ch] font-medium text-[0.9375rem] leading-snug">
                {question.explanation}
              </p>
              <div className="mt-2">
                <span data-hand className={cn(button('outline', 'sm'), HARD_4)}>
                  <Icon name="alert" className="mr-2" />
                  {copy.report}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <ShortcutLegend
            items={[
              {
                keys: [selectKey(question.answers.length)],
                label: copy.shortcuts.select
              },
              { keys: [enterKey], label: copy.shortcuts.check }
            ]}
          />
        )}
      </div>
      {/* One button for Check and Continue: focus and the pointer stay where they were. */}
      <span
        data-a="primary"
        // A disabled button takes no pointer: the dock shows through.
        data-hand={revealed || view.canCheck || view.checking || undefined}
        className={cn(
          DOCK_BUTTON,
          'min-w-52 gap-2 px-10',
          revealed ? 'text-black' : 'text-white'
        )}
      >
        {view.checking && (
          <span data-a="spinner" className="flex">
            <Icon name="loader" className="size-5" />
          </span>
        )}
        {view.checking ? copy.checking : revealed ? copy.continue : copy.check}
      </span>
    </Dock>
  );
}

/* -------------------------------------------------------------------------- */
/* Exam                                                                        */
/* -------------------------------------------------------------------------- */

const STRIP_TONE: Record<StripCell['tone'], string> = {
  empty: 'rgb(0 0 0 / 0.2)',
  answered: C.primary,
  revisit: C.secondary
};

/**
 * exam-strip.tsx as the Navigator: one column per Question, height its
 * Confidence. The column under the pointer and its number are the browser's
 * part, drawn from where the pointer is.
 */
function ExamStrip({
  cells,
  current
}: {
  cells: StripCell[];
  current: number;
}) {
  return (
    <div
      data-strip
      data-hand
      className="relative h-[4.5rem] flex-1 cursor-pointer select-none py-2"
    >
      <div className="flex h-full items-end gap-px border-black border-b-2">
        {cells.map((cell, i) => (
          <div
            key={i}
            data-a={`col-${i}`}
            data-col
            className="flex-1"
            style={{
              height: cell.tone === 'empty' ? 3 : `${cell.height}%`,
              background: STRIP_TONE[cell.tone]
            }}
          />
        ))}
      </div>
      <div
        data-a="marker"
        className="absolute bottom-0 h-1.5 -translate-x-1/2 bg-black"
        style={{
          width: `max(6px, ${100 / cells.length}%)`,
          left: `${((current + 0.5) / cells.length) * 100}%`
        }}
      />
      <span
        data-strip-label
        className="pointer-events-none absolute top-full z-10 -translate-x-1/2 bg-black px-2 py-0.5 font-black text-sm text-white tabular-nums"
        style={{ display: 'none' }}
      />
    </div>
  );
}

function ExamPage({ view }: { view: ExamView }) {
  const { question } = view;
  return (
    <AttemptFrame strip={<ExamStrip cells={view.cells} current={view.index} />}>
      <AttemptQuestion
        index={view.index}
        total={view.total}
        question={question}
        actions={
          <span
            data-hand
            className="flex h-11 items-center font-black text-sm underline decoration-2 underline-offset-4"
          >
            {copy.finish}
          </span>
        }
        option={answer => {
          const selected = view.selected.includes(answer.id);
          return {
            ink: selected ? 'text-white' : 'text-black',
            mark: selected ? 'check' : null,
            hand: true
          };
        }}
      />
      <ShortcutLegend
        className="mt-8"
        items={[
          {
            keys: [selectKey(question.answers.length)],
            label: copy.shortcuts.select
          },
          { keys: [enterKey], label: copy.shortcuts.next },
          {
            keys: [
              <Icon key="left" name="left" className="size-3" />,
              <Icon key="right" name="right" className="size-3" />
            ],
            label: copy.shortcuts.navigate
          }
        ]}
      />
    </AttemptFrame>
  );
}

const RATINGS = ['guess', 'unsure', 'confident'] as const;

function ExamDock({ view }: { view: ExamView }) {
  const answered = view.selected.length > 0;
  return (
    <Dock>
      <div className="min-w-0 flex-1 space-y-2">
        {/* ConfidenceRating: always in place, inert until there is an answer. */}
        <div data-a="rating">
          <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3">
            <span className="font-bold text-black text-sm">
              {copy.confidence.label}
            </span>
            <p className="font-medium text-black/70 text-sm">
              {(view.rating === 'guess' || view.rating === 'unsure') &&
                copy.confidence.revisitHint}
            </p>
          </div>
          <div className="grid max-w-md grid-cols-3 gap-2">
            {RATINGS.map(option => (
              <span
                key={option}
                data-a={`conf-${option}`}
                data-hand={answered || undefined}
                className={cn(
                  'flex h-11 items-center justify-center border-2 border-black font-bold text-[0.9375rem]',
                  view.rating === 'confident' && option === 'confident'
                    ? 'text-white'
                    : 'text-black'
                )}
              >
                {copy.confidence.options[option]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <span
          data-a="prev"
          data-hand
          className={cn(DOCK_BUTTON, 'w-14 bg-white')}
        >
          <Icon name="left" className="size-6" strokeWidth={3} />
        </span>
        <span
          data-a="next"
          data-hand
          className={cn(DOCK_BUTTON, 'min-w-52 bg-[#2347d9] px-10 text-white')}
        >
          {copy.next}
        </span>
      </div>
    </Dock>
  );
}

/* -------------------------------------------------------------------------- */
/* Results                                                                     */
/* -------------------------------------------------------------------------- */

function ResultsPage({ view }: { view: ResultsView }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <BackLink label={copy.results.backToCertification} />
        <h1 className="font-black text-lg">
          {copy.results.practiceTitle}
          <span className="font-medium text-black/60">, {view.title}</span>
        </h1>
        <DrillColumns
          outcomes={view.outcomes}
          current={-1}
          className="mt-6 h-48 border-b-4"
        />
        <div className="mt-8">
          <p
            className="font-black text-[9rem] leading-none tabular-nums"
            style={{ fontStretch: '125%' }}
          >
            <span data-a="score">0</span>%
          </p>
        </div>
        <p
          className="mt-4 inline-block border-2 border-black px-3 py-1 font-black"
          style={{ background: view.passed ? C.success : C.danger }}
        >
          {copy.results.passingScore(view.passed, `${view.passingScore}%`)}
        </p>
        <p
          className="mt-4 max-w-[30ch] font-extrabold text-3xl leading-tight"
          style={{ fontStretch: '88%' }}
        >
          {copy.results.scoreLine(view.correct, view.outcomes.length)}.
          {view.longestRun > 1 &&
            ` ${copy.results.longestRun(view.longestRun)}`}
        </p>
        <p className="mt-3 max-w-[46ch] font-medium text-black/70 text-lg">
          {copy.results.missedReturn}
        </p>
        <div className="mt-8 flex flex-row gap-4">
          {/* Focused on arrival, so Enter starts the next one. */}
          <span
            className={cn(button('default', 'lg'), HARD_4)}
            style={{
              boxShadow:
                '0 0 0 2px #fff, 0 0 0 6px rgb(0 0 0 / 0.4), 4px 4px 0 0 #000'
            }}
          >
            {copy.results.nextDrill}
          </span>
          <span className={cn(button('outline', 'lg'), HARD_4)}>
            {copy.results.backToCertification}
          </span>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Home                                                                        */
/* -------------------------------------------------------------------------- */

const DOTGRID: React.CSSProperties = {
  backgroundImage:
    'radial-gradient(circle, color-mix(in srgb, #000 12%, transparent) 1.5px, transparent 1.5px)',
  backgroundSize: '22px 22px'
};

function FloatSticker({
  i,
  className,
  fill,
  rotate,
  children
}: {
  i: number;
  className: string;
  fill: string;
  rotate: number;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('absolute z-20', className)}>
      <div data-a={`float-${i}`}>
        <div
          className={cn(
            'border-2 border-black px-3 py-1.5 font-black text-sm',
            HARD_4,
            fill
          )}
          style={{ rotate: `${rotate}deg` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function HomePage({ view }: { view: HomeView }) {
  const answers = [
    { text: 'Amazon EC2', ok: false },
    { text: 'AWS Fargate', ok: true },
    { text: 'Amazon EKS', ok: false }
  ];
  return (
    <>
      <AppHeader home />
      <section
        className="relative w-full overflow-hidden border-black border-b-2 bg-white"
        style={DOTGRID}
      >
        <div className="pointer-events-none absolute -top-40 -right-40 size-[28rem] bg-[#2347d9]/20 blur-3xl" />
        <div className="relative mx-auto w-full px-6 py-28">
          <div className="grid grid-cols-[1.05fr_0.95fr] items-center gap-12">
            <div className="max-w-2xl">
              <span
                className="inline-flex items-center gap-2 border-2 border-black bg-[#ffb020] px-3 py-1 font-black text-black text-xs uppercase tracking-wide"
                style={{ boxShadow: '3px 3px 0 0 #000' }}
              >
                <Icon name="sparkles" className="size-3.5" />
                {copy.home.badge}
              </span>
              <h1 className="mt-6 font-black text-7xl text-black leading-[0.92] tracking-tight">
                {copy.home.lead}
                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    className="inline-block border-2 border-black bg-[#2347d9] px-3 py-1 text-white"
                    style={{ rotate: '-1deg', boxShadow: '5px 5px 0 0 #000' }}
                  >
                    <span className="relative flex flex-wrap whitespace-pre-wrap text-white">
                      <span className="relative flex flex-wrap whitespace-pre-wrap">
                        <span className="inline-flex overflow-hidden">
                          {Array.from(view.chip).map((char, i) => (
                            <span
                              key={`${view.chip}-${i}`}
                              data-a={`chip-${i}`}
                              className="inline-block"
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </span>
                  <span>{copy.home.cert}</span>
                </span>
                <span className="mt-3 block">{copy.home.tail}</span>
              </h1>
              <p className="mt-6 max-w-md font-medium text-black/70 text-lg">
                {copy.home.subtitle}
              </p>
              <div className="mt-8 flex flex-row gap-3">
                <span className={cn(button('default', 'lg'), HARD_4)}>
                  {copy.home.primary}
                  <Icon name="right" className="ml-2" />
                </span>
                <span className={cn(button('outline', 'lg'), HARD_4)}>
                  {copy.home.secondary}
                </span>
              </div>
            </div>

            <div className="relative mx-auto h-[440px] w-full max-w-md">
              <div
                className="absolute inset-x-8 top-12 h-72 border-2 border-black bg-[#ffb020] shadow-[8px_8px_0px_0px_#000]"
                style={{ rotate: '-6deg' }}
              />
              <div
                className="absolute inset-x-0 top-2 border-2 border-black bg-white p-5 shadow-[12px_12px_0px_0px_#000]"
                style={{ rotate: '-2deg' }}
              >
                <div className="flex items-center justify-between">
                  <span className="border-2 border-black bg-[#2347d9] px-2 py-0.5 font-black text-[11px] text-white uppercase">
                    AWS · SAA
                  </span>
                  <span
                    className="font-bold text-black/50 text-xs tabular-nums"
                    style={{ fontFamily: MONO }}
                  >
                    Q 07 / 65
                  </span>
                </div>
                <p className="mt-4 font-bold text-black text-sm leading-snug">
                  {copy.home.mockQuestion}
                </p>
                <div className="mt-4 space-y-2">
                  {answers.map(a => (
                    <div
                      key={a.text}
                      className={cn(
                        'flex items-center gap-2 border-2 border-black px-3 py-2 font-bold text-xs',
                        a.ok
                          ? 'bg-[#2347d9] text-white'
                          : 'bg-white text-black shadow-[3px_3px_0px_0px_#000]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center border-2 border-black',
                          a.ok ? 'bg-black text-white' : 'bg-white'
                        )}
                      >
                        {a.ok && <Icon name="check" className="size-3" />}
                      </span>
                      {a.text}
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-2.5 w-full overflow-hidden border-2 border-black bg-white">
                  <div
                    className="h-full bg-[#15a06e]"
                    style={{ width: '62%' }}
                  />
                </div>
              </div>
              <FloatSticker
                i={0}
                className="top-4 -left-3"
                fill="bg-[#2347d9] text-white"
                rotate={-12}
              >
                AWS
              </FloatSticker>
              <FloatSticker
                i={1}
                className="top-28 -right-2"
                fill="bg-white text-black"
                rotate={6}
              >
                Azure
              </FloatSticker>
              <FloatSticker
                i={2}
                className="bottom-6 -left-1"
                fill="bg-[#15a06e] text-black"
                rotate={3}
              >
                GCP
              </FloatSticker>
              <div
                className="absolute -top-3 -right-4 z-20 flex size-20 items-center justify-center border-2 border-black bg-[#ffb020] text-center font-black text-[11px] uppercase leading-tight shadow-[4px_4px_0px_0px_#000]"
                style={{ rotate: '12deg' }}
              >
                {copy.home.free[0]}
                <br />
                {copy.home.free[1]}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* The browser                                                                 */
/* -------------------------------------------------------------------------- */

const CHROME_H = 40;
const KEYS_BAND = 64;

/** Chrome's smooth scroll for scrollIntoView and scrollBy: the browser's curve, not the app's. */
const smoothScroll = cubicBezier(0.42, 0, 0.58, 1);
/** A trackpad flick: quick, then a long coast. */
const flick = cubicBezier(0.12, 0.7, 0.2, 1);
/** A hand moving a mouse: away quickly, slowing onto the target. */
const reach = cubicBezier(0.45, 0.05, 0.2, 1);
const rippleEase = cubicBezier(0.23, 1, 0.32, 1);

type Leg = { at: number; from: number; to: number; dur: number; ease: Curve };

const scrollOf = (legs: Leg[], t: number) => {
  let s = 0;
  for (const leg of legs) {
    if (leg.at > t) break;
    s =
      leg.from +
      (leg.to - leg.from) * leg.ease(clamp01((t - leg.at) / leg.dur));
  }
  return s;
};

/** Where an element sits in the page, ignoring transforms. */
const layoutTop = (el: HTMLElement, root: HTMLElement) => {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
};

/** Mouse pointers as macOS draws them, tip at the origin. */
function Pointer({ hand }: { hand: boolean }) {
  return hand ? (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      className="absolute top-0 left-0"
      style={{ marginLeft: -9.3, marginTop: -2.2 }}
    >
      <path
        d="M7 3.6a1.6 1.6 0 0 1 3.2 0v6.6a1.6 1.6 0 0 1 3.2 0v.6a1.6 1.6 0 0 1 3.2 0v.8a1.6 1.6 0 0 1 3.2 0V16c0 3.3-2.7 6-6 6h-1.8c-1.9 0-3.3-.7-4.6-2.1l-3.3-3.6a1.6 1.6 0 0 1 2.3-2.2L7 15.6Z"
        fill="#fff"
        stroke="#000"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      <path
        d="M10.2 10.4v3.4M13.4 11v2.8M16.6 11.8v2.2"
        stroke="#000"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="absolute top-0 left-0"
      style={{ marginLeft: -5, marginTop: -3 }}
    >
      <path
        d="M5 3v16.6l4.3-4 2.9 6.4 2.7-1.2-2.8-6.2H18Z"
        fill="#000"
        stroke="#fff"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * CloudCertify in a 1024 × 800 browser window, its own markup and
 * Tailwind classes with every transition driven from the scene's clock.
 * Scrolling, the sticky header and the pointer are the browser's part,
 * worked out once from the page's real layout and then replayed.
 */
export function LiveCloudCertify({
  kind,
  onDraw
}: {
  kind: CloudCertifyKind;
  onDraw: (draw: (t: number) => void) => void;
}) {
  const scene = useMemo<CCScene>(() => cloudcertifyScenes[kind](), [kind]);
  const [view, setView] = useState<CCView>(() => scene.frame(0).view);
  const box = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const ripple = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const committed = useRef<CCView>(view);
  const pending = useRef<number | null>(null);
  const canSync = useRef(true);
  const legs = useRef<Leg[]>([]);
  const points = useRef<Point[]>([]);
  const ready = useRef(false);
  const lastT = useRef(0);
  const drawKeys = useRef<(frame: KeystrokeFrame, t: number) => void>(() => {});
  const hasKeys = scene.strokes.length > 0;

  const paint = (frame: CCFrame, t: number, live: boolean) => {
    const root = page.current;
    if (!root) return;
    for (const [id, style] of Object.entries(frame.styles)) {
      const el = els.current.get(id);
      if (!el) continue;
      for (const [key, value] of Object.entries(style)) {
        if (key === 'heightFraction') {
          const child = el.firstElementChild as HTMLElement | null;
          if (!child) continue;
          const full =
            child.offsetHeight +
            Number.parseFloat(getComputedStyle(child).marginTop || '0');
          el.style.height = `${full * Number(value)}px`;
          continue;
        }
        if (key === 'text') {
          if (el.textContent !== String(value)) el.textContent = String(value);
          continue;
        }
        const css = el.style as unknown as Record<string, string>;
        if (css[key] !== String(value)) css[key] = String(value);
      }
    }

    // The page scrolls under a sticky header.
    const max = Math.max(0, root.offsetHeight - VIEW_H);
    const s = Math.min(max, Math.max(0, scrollOf(legs.current, t)));
    root.style.transform = `translateY(${-s}px)`;
    for (const el of root.querySelectorAll<HTMLElement>('[data-sticky]')) {
      const top = layoutTop(el, root);
      const parent = el.parentElement as HTMLElement;
      const room =
        layoutTop(parent, root) + parent.offsetHeight - (top + el.offsetHeight);
      const off = Math.min(
        Math.max(0, room),
        Math.max(0, s + Number(el.dataset.sticky) - top)
      );
      el.style.transform = off ? `translateY(${off}px)` : '';
    }
    if (content.current) content.current.style.opacity = String(frame.fade);
    if (!live) return;

    const pointer = scene.pointer;
    const c = cursor.current;
    if (pointer && c && ready.current) {
      let at = pointer.start;
      let moving: { from: Point; to: Point; p: number } | null = null;
      pointer.moves.forEach((move, j) => {
        if (moving || t < move.at) return;
        const to = points.current[j] ?? at;
        if (t < move.at + move.dur) {
          moving = {
            from: at,
            to,
            p: reach(clamp01((t - move.at) / move.dur))
          };
          return;
        }
        at = to;
      });
      let x = at.x;
      let y = at.y;
      if (moving) {
        const { from, to, p } = moving as { from: Point; to: Point; p: number };
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const bow =
          Math.sin(Math.PI * p) * Math.min(36, Math.hypot(dx, dy) * 0.07);
        const len = Math.hypot(dx, dy) || 1;
        x = from.x + dx * p - (dy / len) * bow;
        y = from.y + dy * p + (dx / len) * bow;
      }
      c.style.transform = `translate(${x}px, ${y}px)`;
      // The hand over anything with cursor-pointer, as the browser decides it:
      // the page and the dock pinned over it.
      const vp = viewport.current?.getBoundingClientRect();
      let overTarget = false;
      if (vp?.width && content.current) {
        const k = vp.width / VIEW_W;
        const px = vp.left + x * k;
        const py = vp.top + y * k;
        const under = (el: Element) => {
          const r = el.getBoundingClientRect();
          return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
        };
        for (const el of content.current.querySelectorAll('[data-hand]')) {
          if (under(el)) {
            overTarget = true;
            break;
          }
        }
        // ExamStrip on a mouse: the column under the pointer, outlined, and its number.
        const strip =
          content.current.querySelector<HTMLElement>('[data-strip]');
        if (strip) {
          const cols = strip.querySelectorAll<HTMLElement>('[data-col]');
          const r = strip.getBoundingClientRect();
          const pointed = under(strip)
            ? Math.min(
                cols.length - 1,
                Math.max(0, Math.floor(((px - r.left) / r.width) * cols.length))
              )
            : -1;
          cols.forEach((col, i) => {
            const outline = i === pointed ? '2px solid #000' : '';
            if (col.style.outline !== outline) col.style.outline = outline;
          });
          const label = strip.querySelector<HTMLElement>('[data-strip-label]');
          if (label) {
            label.style.display = pointed < 0 ? 'none' : '';
            if (pointed >= 0) {
              label.style.left = `${((pointed + 0.5) / cols.length) * 100}%`;
              label.textContent = String(pointed + 1);
            }
          }
        }
      }
      if (arrow.current) arrow.current.style.display = overTarget ? 'none' : '';
      if (finger.current)
        finger.current.style.display = overTarget ? '' : 'none';
      const r = ripple.current;
      const press = pointer.presses.find(p => t >= p.down && t < p.down + 0.45);
      if (r) {
        if (press) {
          const p = (t - press.down) / 0.45;
          r.style.display = '';
          r.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.5 + 0.9 * rippleEase(p)})`;
          r.style.opacity = String(0.4 * (1 - p));
        } else r.style.display = 'none';
      }
    }
    if (hasKeys) drawKeys.current(keystrokesAt(scene.strokes, t), t);
  };

  const render = (t: number, live = true) => {
    if (live) lastT.current = t;
    const frame = scene.frame(t);
    if (frame.view !== committed.current) {
      committed.current = frame.view;
      if (canSync.current) flushSync(() => setView(frame.view));
      else {
        pending.current = t;
        setView(frame.view);
        return;
      }
    }
    paint(frame, t, live);
  };
  const renderRef = useRef(render);
  renderRef.current = render;

  // After each commit: index the elements the frame styles, then paint.
  useLayoutEffect(() => {
    const map = new Map<string, HTMLElement>();
    for (const el of viewport.current?.querySelectorAll<HTMLElement>(
      '[data-a]'
    ) ?? [])
      map.set(el.dataset.a as string, el);
    els.current = map;
    if (pending.current !== null) {
      const t = pending.current;
      pending.current = null;
      paint(scene.frame(t), t, true);
    }
  });

  // Scroll targets and pointer landings come from the page's own layout:
  // render each instant they are needed, measure, and keep the numbers.
  useEffect(() => {
    let frame = 0;
    const prepare = () => {
      const vp = viewport.current;
      const root = page.current;
      if (!vp || !root || vp.getBoundingClientRect().width === 0) {
        frame = requestAnimationFrame(prepare);
        return;
      }
      legs.current = [];
      points.current = [];
      const moves = scene.pointer?.moves ?? [];
      const jobs = [
        ...scene.scrolls.map(intent => ({
          time: intent.at + 0.0005,
          intent,
          move: -1
        })),
        ...moves.map((m, j) => ({ time: m.at + m.dur, intent: null, move: j }))
      ].sort((a, b) => a.time - b.time);
      let last: Point = scene.pointer?.start ?? { x: 0, y: 0 };

      for (const job of jobs) {
        renderRef.current(job.time, false);
        if (job.intent) {
          const el = els.current.get(job.intent.target);
          if (!el) continue;
          const top = layoutTop(el, root);
          const bottom = top + el.offsetHeight;
          const max = Math.max(0, root.offsetHeight - VIEW_H);
          const from = Math.min(max, scrollOf(legs.current, job.time));
          let to = from;
          if (job.intent.mode === 'nearest') {
            if (bottom - top > VIEW_H || top < from) to = top;
            else if (bottom > from + VIEW_H) to = bottom - VIEW_H;
          } else if (job.intent.mode === 'question') {
            if (top - from < HEADER_H) to = top - HEADER_H - 16;
          } else {
            const margin = 32;
            if (bottom + margin > from + VIEW_H) to = bottom + margin - VIEW_H;
            else if (top - margin < from + HEADER_H)
              to = top - margin - HEADER_H;
          }
          to = Math.min(max, Math.max(0, to));
          if (Math.abs(to - from) < 0.5) continue;
          const wheel = job.intent.mode === 'wheel';
          legs.current.push({
            at: job.intent.at,
            from,
            to,
            dur: wheel ? 0.8 : 0.28 + Math.min(0.4, Math.abs(to - from) / 1500),
            ease: wheel ? flick : smoothScroll
          });
          legs.current.sort((a, b) => a.at - b.at);
        } else {
          const move = moves[job.move];
          if (!move) continue;
          if (typeof move.to !== 'string') {
            last = move.to;
          } else {
            const el = els.current.get(move.to);
            if (el) {
              const r = el.getBoundingClientRect();
              const v = vp.getBoundingClientRect();
              const k = v.width / VIEW_W;
              const w = r.width / k;
              last = {
                x: (r.left - v.left) / k + Math.min(w * 0.5, 150),
                y: (r.top - v.top + r.height * 0.55) / k
              };
            }
          }
          points.current[job.move] = last;
        }
      }
      ready.current = true;
      renderRef.current(lastT.current);
    };
    frame = requestAnimationFrame(prepare);
    return () => cancelAnimationFrame(frame);
  }, [scene]);

  // The window, scaled to the tile or the stage.
  useLayoutEffect(() => {
    const el = box.current;
    const w = win.current;
    if (!el || !w) return;
    const fit = () => {
      const keys = Math.min(1, Math.max(0.6, el.clientWidth / 900));
      const band = hasKeys ? KEYS_BAND * keys : 0;
      const k = Math.min(
        (el.clientWidth / VIEW_W) * 0.94,
        ((el.clientHeight - band) / (VIEW_H + CHROME_H)) * 0.94
      );
      el.style.setProperty('--keys-scale', String(keys));
      w.style.top = `calc(50% - ${band / 2}px)`;
      w.style.transform = `translate(-50%, -50%) scale(${k})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasKeys]);

  useEffect(() => {
    canSync.current = false;
    onDraw(t => renderRef.current(t));
    canSync.current = true;
  }, [onDraw]);

  const registerKeys = useCallback(
    (draw: (frame: KeystrokeFrame, t: number) => void) => {
      drawKeys.current = draw;
    },
    []
  );

  return (
    <div ref={box} className="relative size-full overflow-hidden bg-[#0a090d]">
      <div
        ref={win}
        className="absolute top-1/2 left-1/2 origin-center overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.09]"
        style={{ width: VIEW_W }}
      >
        <div
          className="flex items-center gap-2 border-black/10 border-b px-4"
          style={{ height: CHROME_H, background: '#e9e7e1' }}
        >
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="flex flex-1 justify-center pr-14">
            <span
              className="flex h-6 min-w-80 items-center justify-center rounded-md bg-white/80 px-3 text-[12px] text-black/55"
              style={{ fontFamily: SANS }}
            >
              {scene.url}
            </span>
          </span>
        </div>
        <div
          ref={viewport}
          className="relative overflow-hidden"
          style={{
            width: VIEW_W,
            height: VIEW_H,
            background: C.page,
            fontFamily: SANS,
            fontSize: 16,
            lineHeight: 1.5,
            color: '#000',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          <div ref={content} className="absolute inset-0">
            <div
              ref={page}
              className="absolute inset-x-0 top-0 flex flex-col"
              style={{ minHeight: VIEW_H, background: C.page }}
            >
              {view.kind === 'practice' && <PracticePage view={view} />}
              {view.kind === 'exam' && <ExamPage view={view} />}
              {view.kind === 'results' && <ResultsPage view={view} />}
              {view.kind === 'home' && <HomePage view={view} />}
            </div>
            {view.kind === 'practice' && <PracticeDock view={view} />}
            {view.kind === 'exam' && <ExamDock view={view} />}
            {scene.pointer && (
              <>
                <div
                  ref={ripple}
                  aria-hidden
                  className="pointer-events-none absolute top-0 left-0 z-[80] size-9 rounded-full"
                  style={{ display: 'none', background: 'rgb(0 0 0 / 0.5)' }}
                />
                <div
                  ref={cursor}
                  aria-hidden
                  className="pointer-events-none absolute top-0 left-0 z-[90]"
                  style={{
                    transform: `translate(${scene.pointer.start.x}px, ${scene.pointer.start.y}px)`,
                    filter: 'drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.35))'
                  }}
                >
                  <div ref={arrow}>
                    <Pointer hand={false} />
                  </div>
                  <div ref={finger} style={{ display: 'none' }}>
                    <Pointer hand />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {hasKeys && <KeystrokeBar register={registerKeys} />}
    </div>
  );
}
