'use client';

import { ChevronLeft } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppLocale } from '@/i18n/use-t';
import {
  type AmountLayout,
  APP_SIZE,
  frameAt,
  haloAt,
  type Key,
  layout,
  nextOpacityAt
} from '@/motion/splitty/amount';
import { APP_STRINGS } from '@/motion/splitty/strings';

/**
 * The expense sheet at iPhone 18 Pro width, in points, measured off the
 * Simulator in dark appearance; scaled to fit the stage.
 */
const SCREEN_W = 402;
/** A strip of the black behind the sheet, as under the status bar. */
const SHEET_Y = 14;
/** Visual centre of the amount's digits. */
const AMOUNT_Y = SHEET_Y + 247;
const NEXT_Y = SHEET_Y + 424;
const NEXT_H = 52;
/** Keypad: under Next, past its 16 pt bottom padding. */
const PAD_Y = NEXT_Y + NEXT_H + 16;
const ROW_H = 68;
const ROW_GAP = 2;
const SCREEN_H = PAD_Y + ROW_H * 4 + ROW_GAP * 3 + 20;

/** ExpenseTheme, dark. */
const BACKGROUND = '#09090b';
const FOREGROUND = '#fefefe';
const BRAND = '#f2542d';

const ROUNDED = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const SYSTEM = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const KEYS: Key[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del']
];

/**
 * The expense sheet's amount and keypad, as the app lays them out: the
 * amount centred and re-centring as it grows, the pad underneath with its
 * press halos. Every glyph and halo is placed per frame from the timeline.
 */
export function LiveAmount({
  onDraw
}: {
  onDraw: (draw: (t: number) => void) => void;
}) {
  const s = APP_STRINGS[useAppLocale()];
  const box = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const symbol = useRef<HTMLSpanElement>(null);
  const glyphs = useRef<(HTMLSpanElement | null)[]>([]);
  const halos = useRef<Partial<Record<Key, HTMLSpanElement | null>>>({});
  const next = useRef<HTMLSpanElement>(null);
  const [plan, setPlan] = useState<AmountLayout | null>(null);

  // Fit the 402 pt screen into whatever the stage is.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const k =
        Math.min(el.clientWidth / SCREEN_W, el.clientHeight / SCREEN_H) * 0.94;
      if (screen.current) screen.current.style.transform = `scale(${k})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Widths from the real rendered font, so the row centres exactly.
  useEffect(() => {
    const measureIn = probe.current;
    if (!measureIn) return;
    const cache = new Map<string, number>();
    const measure = (c: string) => {
      const known = cache.get(c);
      if (known !== undefined) return known;
      const span = document.createElement('span');
      span.textContent = c;
      measureIn.appendChild(span);
      const width = span.getBoundingClientRect().width;
      span.remove();
      cache.set(c, width);
      return width;
    };
    // Unscaled widths: the probe sits inside the scaled screen.
    document.fonts.ready.then(() => {
      const k = screen.current?.getBoundingClientRect().width ?? SCREEN_W;
      const ratio = SCREEN_W / k;
      setPlan(layout(c => measure(c) * ratio, SCREEN_W, APP_SIZE * 0.12));
    });
  }, []);

  useEffect(() => {
    if (!plan) return;
    onDraw(t => {
      const frame = frameAt(plan, t);
      if (symbol.current)
        symbol.current.style.transform = `translateX(${frame.symbolX}px)`;
      frame.glyphs.forEach((g, i) => {
        const el = glyphs.current[i];
        if (!el) return;
        if (!g) {
          el.style.opacity = '0';
          return;
        }
        el.style.opacity = String(g.opacity);
        el.style.transform = `translate(${g.x}px, ${g.y}px) scale(${g.scale})`;
        el.style.filter = g.blur > 0.05 ? `blur(${g.blur}px)` : 'none';
      });
      if (next.current) next.current.style.opacity = String(nextOpacityAt(t));
      for (const row of KEYS) {
        for (const key of row) {
          const halo = halos.current[key];
          if (halo) halo.style.opacity = String(haloAt(key, t));
        }
      }
    });
  }, [plan, onDraw]);

  const amountFont = {
    font: `600 ${APP_SIZE}px ${ROUNDED}`,
    fontVariantNumeric: 'tabular-nums'
  } as const;

  return (
    <div
      ref={box}
      className="relative size-full overflow-hidden bg-black"
      style={{ color: FOREGROUND }}
    >
      <div
        ref={screen}
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          marginLeft: -SCREEN_W / 2,
          marginTop: -SCREEN_H / 2
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-[28px]"
          style={{ top: SHEET_Y, background: BACKGROUND }}
        />
        {/* Cancel: the toolbar's glass capsule. */}
        <span
          className="absolute flex items-center justify-center rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
          style={{
            left: 16,
            top: SHEET_Y + 17,
            // Fits "Cancel" at 84 pt; "Cancelar" grows it, as the capsule does.
            minWidth: 84,
            paddingInline: 16,
            height: 42,
            background: '#272729',
            font: `400 17px ${SYSTEM}`
          }}
        >
          {s.cancel}
        </span>
        <div
          ref={probe}
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 whitespace-pre"
          style={amountFont}
        />
        <div
          className="absolute inset-x-0"
          style={{
            top: AMOUNT_Y - APP_SIZE * 0.6,
            height: APP_SIZE * 1.2,
            ...amountFont
          }}
        >
          <span
            ref={symbol}
            className="absolute top-0 left-0 will-change-transform"
          >
            $
          </span>
          {plan?.instances.map((instance, i) => (
            <span
              key={`${instance.key}@${instance.insertAt}`}
              ref={el => {
                glyphs.current[i] = el;
              }}
              className="absolute top-0 left-0 origin-center whitespace-pre opacity-0 will-change-[transform,filter,opacity]"
            >
              {instance.char}
            </span>
          ))}
        </div>

        {/* PrimaryButton: coral capsule, white title3 bold. */}
        <span
          className="absolute flex items-center justify-center text-white"
          style={{
            left: 20,
            right: 20,
            top: NEXT_Y,
            height: NEXT_H,
            font: `700 20px ${SYSTEM}`
          }}
        >
          <span
            ref={next}
            className="absolute inset-0 rounded-full"
            style={{ background: BRAND, opacity: 0.35 }}
          />
          <span className="relative">{s.next}</span>
        </span>

        <div
          className="absolute inset-x-0 flex flex-col"
          style={{ top: PAD_Y, gap: ROW_GAP }}
        >
          {KEYS.map(row => (
            <div key={row.join('')} className="flex">
              {row.map(key => (
                <span
                  key={key}
                  className="relative flex flex-1 items-center justify-center"
                  style={{ height: ROW_H, font: `500 32px ${ROUNDED}` }}
                >
                  <span
                    ref={el => {
                      halos.current[key] = el;
                    }}
                    className="absolute size-[72px] rounded-full opacity-0"
                    style={{ background: FOREGROUND }}
                  />
                  {key === 'del' ? (
                    <ChevronLeft
                      className="relative size-8"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <span className="relative">{key}</span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
