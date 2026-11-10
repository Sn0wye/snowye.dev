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
  VIEW_H,
  VIEW_W
} from '@/motion/cloudcertify/moments';
import { type KeystrokeFrame, keystrokesAt } from '@/motion/keystrokes';

import { KeystrokeBar } from './keystrokes';

/* -------------------------------------------------------------------------- */
/* The app's look                                                              */
/* -------------------------------------------------------------------------- */

/** Tailwind's default stacks: the app sets no font of its own. */
const SANS =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const MONO =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/** lucide-react 0.486, the version the app ships. */
const ICONS = {
  check: ['M21.801 10A10 10 0 1 1 17 3.335', 'm9 11 3 3L22 4'],
  checkCircle: ['circle:12:12:10', 'm9 12 2 2 4-4'],
  x: ['circle:12:12:10', 'm15 9-6 6', 'm9 9 6 6'],
  alert: [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4',
    'M12 17h.01'
  ],
  help: [
    'circle:12:12:10',
    'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3',
    'M12 17h.01'
  ],
  list: [
    'M10 12h11',
    'M10 18h11',
    'M10 6h11',
    'M4 10h2',
    'M4 6h1v4',
    'M6 18H4c0-1 2-2 2-3s-1-1.5-2-1'
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
  style
}: {
  name: keyof typeof ICONS;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
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

function BackLink() {
  return (
    <span className="mb-6 inline-flex items-center gap-2 font-bold text-black text-sm">
      <Icon name="left" />
      {copy.back}
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
/* Question cards                                                              */
/* -------------------------------------------------------------------------- */

const difficultyFill = { easy: C.success, medium: C.warning, hard: C.danger };

function Badge({
  children,
  fill = 'white',
  ink = 'black'
}: {
  children: React.ReactNode;
  fill?: string;
  ink?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center justify-center gap-1 overflow-hidden break-words border-2 border-black px-3 py-1 text-center font-bold text-xs',
        HARD_2
      )}
      style={{ background: fill, color: ink }}
    >
      {children}
    </span>
  );
}

/** CardHeader: counter, meta, the question, and the progress bar. */
function QuestionHeader({
  question,
  index,
  total,
  meta
}: {
  question: Question;
  index: number;
  total: number;
  meta: string;
}) {
  return (
    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 border-black border-b-2 px-6 pb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Badge>{copy.counter(index + 1, total)}</Badge>
        <div className="flex flex-wrap gap-2">
          <Badge fill={C.primary} ink="white">
            {meta}
          </Badge>
          <Badge fill={difficultyFill[question.difficulty]}>
            {copy.difficulty[question.difficulty]}
          </Badge>
        </div>
      </div>
      <div data-a="title">
        <div className="font-black text-2xl text-black leading-none">
          {question.text}
        </div>
      </div>
      {question.selectCount > 1 && (
        <p className="mt-2 font-bold text-black/60 text-sm">
          {copy.selectAnswers(question.selectCount)}
        </p>
      )}
      <div className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden border-2 border-black bg-white">
          <div data-a="bar" className="size-full flex-1 bg-[#2347d9]" />
        </div>
      </div>
    </div>
  );
}

/** practice-question-card.tsx's option colouring, per mode. */
const practiceBox: Record<OptionMode, string> = {
  idle: 'bg-white',
  selected: 'bg-white text-[#2347d9]',
  correct: 'bg-[#15a06e] text-black',
  wrong: 'bg-[#e23b48] text-black',
  dim: 'bg-white'
};

/** ui/kbd.tsx: a keycap like the outline Badge, shown wherever there is a fine pointer. */
function Kbd({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 shrink-0 items-center justify-center border-2 border-black bg-white px-1.5 font-black text-black text-xs leading-none',
        HARD_2,
        className
      )}
      style={{ fontFamily: SANS }}
    >
      {children}
    </kbd>
  );
}

/** shortcut-legend.tsx: the card's shortcuts in its footer, md and up. */
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

function Option({
  id,
  text,
  box,
  ink,
  icon,
  hand,
  shortcut
}: {
  id: string;
  text: string;
  box: string;
  ink: string;
  icon: 'check' | 'x' | null;
  /** cursor-pointer while it can be picked; disabled options show none. */
  hand: boolean;
  /** Its digit, for the first nine. */
  shortcut: number;
}) {
  return (
    <div
      data-a={id}
      data-hand={hand || undefined}
      className="flex items-start gap-3 border-2 border-black p-4"
    >
      <div
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-black',
          box
        )}
      >
        {icon && (
          <span key={icon} data-a={`${id}-icon`} className="flex">
            <Icon name={icon === 'check' ? 'check' : 'x'} />
          </span>
        )}
      </div>
      <span className={cn('font-medium', ink)}>{text}</span>
      {shortcut <= 9 && <Kbd className="mt-0.5 ml-auto">{shortcut}</Kbd>}
    </div>
  );
}

function PracticeCard({ view }: { view: PracticeView }) {
  const { question, phase } = view;
  const revealed = phase === 'revealed';
  return (
    <div
      data-a="card"
      className="flex w-full flex-col gap-6 border-4 border-black bg-white py-6 text-black shadow-[8px_8px_0px_0px_#000]"
    >
      <QuestionHeader
        question={question}
        index={view.index}
        total={view.total}
        meta={view.drillTitle}
      />
      <div className="px-6 py-6">
        <div key={question.id} data-a="answers" className="space-y-3">
          {question.answers.map((answer, i) => {
            const mode = view.modes[answer.id] ?? 'idle';
            return (
              <Option
                key={answer.id}
                id={answer.id}
                shortcut={i + 1}
                text={answer.text}
                box={practiceBox[mode]}
                hand={
                  !revealed &&
                  !view.checking &&
                  (mode === 'selected' ||
                    !view.canCheck ||
                    question.selectCount === 1)
                }
                ink={mode === 'selected' ? 'text-white' : 'text-black'}
                icon={
                  mode === 'selected' || mode === 'correct'
                    ? 'check'
                    : mode === 'wrong'
                      ? 'x'
                      : null
                }
              />
            );
          })}
        </div>
        {revealed && (
          <div
            data-a="explain"
            className="overflow-hidden"
            style={{ height: 0 }}
          >
            <div className="mt-6 border-2 border-black bg-[#f5f3ec]">
              <div
                className="flex items-center gap-2 border-black border-b-2 px-4 py-2"
                style={{ background: view.correct ? C.success : C.danger }}
              >
                <span data-a="explain-icon" className="flex">
                  <Icon
                    name={view.correct ? 'check' : 'x'}
                    className="text-black"
                  />
                </span>
                <p className="font-black text-black text-sm">
                  {view.correct ? copy.correct : copy.notQuite}
                </p>
              </div>
              <p className="px-4 py-3 text-black/80 text-sm">
                {question.explanation}
              </p>
            </div>
          </div>
        )}
        {revealed && (
          <div className="mt-4 flex justify-end">
            <span data-hand className={cn(button('outline', 'sm'), HARD_4)}>
              <Icon name="alert" className="mr-2" />
              {copy.report}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end border-black border-t-2 px-6 pt-6">
        <ShortcutLegend
          className="mr-auto pr-4"
          items={
            revealed
              ? [{ keys: [enterKey], label: copy.shortcuts.continue }]
              : [
                  {
                    keys: [selectKey(question.answers.length)],
                    label: copy.shortcuts.select
                  },
                  { keys: [enterKey], label: copy.shortcuts.check }
                ]
          }
        />
        <span
          data-a="check"
          // Disabled buttons take no pointer events: the card shows through.
          data-hand={revealed || view.canCheck || undefined}
          className={cn(
            button('default', 'md'),
            !revealed && !view.canCheck && 'opacity-50'
          )}
        >
          {revealed ? (
            <span data-a="continue-label" className="inline-flex items-center">
              {copy.continue}
              <Icon name="right" className="ml-2" />
            </span>
          ) : (
            <>
              {view.checking && (
                <span data-a="spinner" className="flex">
                  <Icon name="loader" />
                </span>
              )}
              {view.checking ? copy.checking : copy.check}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

function PracticePage({ view }: { view: PracticeView }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <BackLink />
        {view.banner && (
          <div
            className={cn(
              'mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-2 border-black bg-white px-4 py-3',
              HARD_4
            )}
          >
            <Icon name="sparkles" className="text-black" />
            <span className="font-black text-black text-sm uppercase tracking-wide">
              {copy.drillLabel}
            </span>
            <span className="font-bold text-black/70 text-sm">
              {view.banner}
            </span>
          </div>
        )}
        <PracticeCard view={view} />
      </main>
      <Footer />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Exam                                                                        */
/* -------------------------------------------------------------------------- */

const RATING = {
  guess: { icon: 'help', fill: C.danger },
  unsure: { icon: 'alert', fill: C.warning },
  confident: { icon: 'checkCircle', fill: C.success }
} as const;

function ConfidenceRating({ view }: { view: ExamView }) {
  return (
    <div
      data-a="rating"
      className="space-y-2 border-2 border-black bg-white p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-black">{copy.confidence.label}</span>
        <div className="flex flex-wrap gap-2">
          {(['guess', 'unsure', 'confident'] as const).map(option => {
            const selected = view.rating === option;
            const { icon, fill } = RATING[option];
            return (
              <span
                key={option}
                data-a={`conf-${option}`}
                data-hand
                className="flex items-center gap-1.5 border-2 border-black px-3 py-1.5 font-bold text-black text-sm"
              >
                <span
                  key={String(selected)}
                  data-a={`conf-${option}-icon`}
                  className="flex"
                >
                  <Icon
                    name={icon}
                    style={selected ? undefined : { color: fill }}
                  />
                </span>
                {copy.confidence.options[option]}
              </span>
            );
          })}
        </div>
      </div>
      <p className="flex min-h-5 items-center gap-1.5 font-bold text-black/70 text-sm">
        {(view.rating === 'guess' || view.rating === 'unsure') && (
          <>
            <Icon name="alert" style={{ color: C.warning }} />
            {copy.confidence.revisitHint}
          </>
        )}
      </p>
    </div>
  );
}

function ExamPage({ view }: { view: ExamView }) {
  const { question } = view;
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12">
        <BackLink />
        <div className="relative flex items-start justify-center gap-6">
          <aside
            data-sticky={96}
            className="relative z-40 w-10 shrink-0 self-start"
          >
            <span
              data-a="nav-open"
              data-hand
              className={button('outline', 'icon')}
            >
              <Icon name="list" />
            </span>
          </aside>
          <div className="min-w-0 max-w-4xl flex-1 space-y-6">
            <div
              data-a="card"
              className="flex w-full flex-col gap-6 border-4 border-black bg-white py-6 text-black shadow-[8px_8px_0px_0px_#000]"
            >
              <QuestionHeader
                question={question}
                index={view.index}
                total={view.total}
                meta={view.quizTitle}
              />
              <div className="px-6 py-6">
                <div key={question.id} data-a="answers" className="space-y-3">
                  {question.answers.map((answer, i) => {
                    const selected = view.selected.includes(answer.id);
                    return (
                      <Option
                        key={answer.id}
                        id={answer.id}
                        shortcut={i + 1}
                        text={answer.text}
                        box={selected ? 'bg-black text-white' : 'bg-white'}
                        ink={selected ? 'text-white' : 'text-black'}
                        icon={selected ? 'check' : null}
                        hand
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-black border-t-2 px-6 pt-6">
                <span
                  data-a="prev"
                  data-hand
                  className={button('outline', 'md')}
                >
                  <Icon name="left" className="mr-2" />
                  {copy.previous}
                </span>
                <ShortcutLegend
                  className="justify-center px-4"
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
                <span
                  data-a="next"
                  data-hand
                  className={button('default', 'md')}
                >
                  {copy.next}
                  <Icon name="right" className="ml-2" />
                </span>
              </div>
            </div>
            {view.selected.length > 0 && <ConfidenceRating view={view} />}
            <div className="flex justify-end">
              <span data-hand className={cn(button('default', 'md'), HARD_4)}>
                {copy.finishQuiz}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** The native <dialog>: no transition, a backdrop and a panel from the left. */
function Navigator({ view }: { view: ExamView }) {
  const answered = view.answered.filter(Boolean).length;
  const review = view.review.filter(Boolean).length;
  return (
    <>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-y-0 left-0 w-72">
        <div className="flex h-full flex-col overflow-hidden border-black border-r-4 bg-white text-black shadow-[8px_0_0_0_#000]">
          <div className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3 border-black border-b-2 pb-4">
              <div>
                <h2 className="font-black text-black">
                  {copy.navigator.title}
                </h2>
                <p className="font-bold text-black/60 text-sm">
                  {copy.navigator.answeredCount(answered, view.total)}
                </p>
                {review > 0 && (
                  <p className="mt-1 flex items-center gap-1.5 font-bold text-black/70 text-sm">
                    <Icon name="alert" style={{ color: C.warning }} />
                    {copy.navigator.reviewCount(review)}
                  </p>
                )}
              </div>
              <span data-hand className={cn(button('outline', 'icon'), HARD_4)}>
                <Icon name="close" />
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {view.answered.map((isAnswered, i) => {
                const current = i === view.index;
                return (
                  <span
                    key={i}
                    data-a={`nav-${i}`}
                    data-hand
                    className={cn(
                      'relative flex size-9 items-center justify-center border-2 border-black font-bold text-sm',
                      current
                        ? 'translate-x-px translate-y-px bg-black text-white'
                        : HARD_2,
                      !current &&
                        (isAnswered
                          ? 'bg-[#2347d9] text-white'
                          : 'bg-white text-black')
                    )}
                  >
                    {i + 1}
                    {view.review[i] && (
                      <span className="absolute -top-1 -right-1 size-3 border-2 border-black bg-[#ffb020]" />
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
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
        const css = el.style as unknown as Record<string, string>;
        if (css[key] !== String(value)) css[key] = String(value);
      }
    }

    // The page scrolls under a sticky header and a sticky navigator.
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
      // whatever is on top under the tip, a modal shutting out the page.
      const vp = viewport.current?.getBoundingClientRect();
      const top = viewport.current?.querySelector('[data-modal]') ?? root;
      let overTarget = false;
      if (vp?.width) {
        const k = vp.width / VIEW_W;
        const px = vp.left + x * k;
        const py = vp.top + y * k;
        for (const el of top.querySelectorAll('[data-hand]')) {
          const r = el.getBoundingClientRect();
          if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
            overTarget = true;
            break;
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
              {view.kind === 'home' && <HomePage view={view} />}
            </div>
            {view.kind === 'exam' && view.navOpen && (
              <div data-modal className="absolute inset-0 z-[60]">
                <Navigator view={view} />
              </div>
            )}
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
