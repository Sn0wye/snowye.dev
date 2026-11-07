'use client';

import {
  BedDouble,
  CarTaxiFront,
  ChevronDown,
  CircleDollarSign,
  CircleX,
  Film,
  Fuel,
  Plane,
  ShoppingCart,
  UtensilsCrossed,
  Wifi,
  Zap
} from 'lucide-react';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useAppLocale } from '@/i18n/use-t';
import {
  buildScene,
  CARD_PAD,
  CARD_W,
  CARD_X,
  CARD_Y,
  CATEGORY,
  type Category,
  CATEGORY_ROW_H,
  CHIP_H,
  DONUT_H,
  DONUT_Y,
  EXPENSE_ROW_H,
  type Heading,
  HEADING_ROW_H,
  INNER_R,
  INNER_W,
  LEGEND_Y,
  numericFrame,
  type NumericLayout,
  OUTER_R,
  PICKER_GAP,
  PICKER_H,
  PICKER_Y,
  type Scene,
  SCREEN_H,
  SCREEN_W,
  sectorPath,
  TINT,
  touchAt
} from '@/motion/splitty/charts';
import { APP_STRINGS, describe, formatDate } from '@/motion/splitty/strings';

/** Assets.xcassets, dark appearance. */
const BACKGROUND = '#09090b';
const CARD = '#18181b';
const BORDER = '#27272a';
const MUTED = '#27272a';
const FOREGROUND = '#f4f4f5';
const MUTED_FOREGROUND = '#a1a1aa';

const SYSTEM = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const SHEET_Y = 14;

const ICON: Record<Category, typeof Plane> = {
  plane: Plane,
  hotel: BedDouble,
  gas: Fuel,
  taxi: CarTaxiFront,
  groceries: ShoppingCart,
  dining: UtensilsCrossed,
  electricity: Zap,
  internet: Wifi,
  movies: Film,
  general: CircleDollarSign
};

/** Glyph widths in the font each figure is set in, from the real renderer. */
const makeMeasure = () => {
  const span = document.createElement('span');
  span.style.cssText =
    'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;font-variant-numeric:tabular-nums';
  document.body.appendChild(span);
  const cache = new Map<string, number>();
  const measure = (text: string, font: string) => {
    const key = `${font}|${text}`;
    const known = cache.get(key);
    if (known !== undefined) return known;
    span.style.font = `${font} ${SYSTEM}`;
    span.style.fontVariantNumeric = 'tabular-nums';
    span.textContent = text;
    const width = span.getBoundingClientRect().width;
    cache.set(key, width);
    return width;
  };
  return { measure, dispose: () => span.remove() };
};

/** A numeric text's glyphs, anchored at the parent's origin. */
function Numeric({ id, layout }: { id: string; layout: NumericLayout }) {
  return (
    <span data-num={id} className="absolute top-0 left-0">
      {layout.glyphs.map((g, i) => (
        <span
          key={i}
          className="absolute top-0 left-0 whitespace-pre opacity-0 will-change-transform"
        >
          {g.char}
        </span>
      ))}
    </span>
  );
}

/**
 * The Charts sheet: pickers, the donut card with its legend, the selection
 * chip and the top of Biggest expenses. Built once; every frame only writes
 * transforms, opacities and path data.
 */
export function LiveCharts({
  onDraw
}: {
  onDraw: (draw: (t: number) => void) => void;
}) {
  const s = APP_STRINGS[useAppLocale()];
  const box = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      const k = Math.min(
        el.clientWidth / SCREEN_W,
        el.clientHeight / (SCREEN_H + SHEET_Y)
      );
      if (screen.current) screen.current.style.transform = `scale(${k})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    const { measure, dispose } = makeMeasure();
    document.fonts.ready.then(() => {
      if (alive) setScene(buildScene(measure));
      dispose();
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const root = screen.current;
    if (!scene || !root) return;
    const q = <T extends Element = HTMLElement>(sel: string) =>
      root.querySelector<T & HTMLElement>(sel);
    const qa = (sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];

    const numerics = new Map<string, NumericLayout>();
    numerics.set('total', scene.total);
    for (const r of scene.rows) {
      numerics.set(`p:${r.id}`, r.percent);
      numerics.set(`a:${r.id}`, r.amount);
    }
    for (const r of scene.expenseRows) numerics.set(`e:${r.id}`, r.amount);
    const glyphEls = [...numerics].map(
      ([id, layout]) =>
        [
          layout,
          [...(q(`[data-num="${id}"]`)?.children ?? [])] as HTMLElement[]
        ] as const
    );

    const lensThumb = q('[data-thumb="lens"]');
    const rangeThumb = q('[data-thumb="range"]');
    const lensLabels = qa('[data-seg="lens"]');
    const rangeLabels = qa('[data-seg="range"]');
    const dimmed = qa('[data-dim]');
    const card1 = q('[data-card1]');
    const card2 = q('[data-card2]');
    const slices = [...scene.sliceAngles].map(
      ([h, s]) => [s, q<SVGPathElement>(`[data-slice="${h}"]`)] as const
    );
    const rows = scene.rows.map(r => ({
      r,
      el: q(`[data-row="${r.id}"]`),
      chevron: q(`[data-chevron="${r.id}"]`),
      title: q(`[data-title="${r.id}"]`)
    }));
    const chips = scene.chips.map(c => ({
      c,
      el: q(`[data-chip="${c.heading}"]`)
    }));
    const exps = scene.expenseRows.map(r => ({
      r,
      el: q(`[data-exp="${r.id}"]`),
      rank: qa(`[data-rank="${r.id}"] > span`)
    }));
    const count = qa('[data-count] > span');
    const touches = qa('[data-touch]');
    const cx = INNER_W / 2;
    const cy = DONUT_H / 2;

    onDraw(t => {
      const segW = (SCREEN_W - 40 - 4) / 2;
      const segR = (SCREEN_W - 40 - 4) / 4;
      const lens = scene.lensThumb(t);
      const range = scene.rangeThumb(t);
      if (lensThumb) lensThumb.style.transform = `translateX(${lens * segW}px)`;
      if (rangeThumb)
        rangeThumb.style.transform = `translateX(${range * segR}px)`;
      lensLabels.forEach((el, i) => {
        el.style.fontWeight = String(
          500 + 100 * Math.max(0, 1 - Math.abs(lens - i))
        );
      });
      rangeLabels.forEach((el, i) => {
        el.style.fontWeight = String(
          500 + 100 * Math.max(0, 1 - Math.abs(range - i))
        );
      });

      const dim = String(scene.dim(t));
      for (const el of dimmed) el.style.opacity = dim;

      const cardH = scene.cardH(t);
      if (card1) card1.style.height = `${cardH}px`;
      if (card2) card2.style.transform = `translateY(${scene.secondY(t)}px)`;

      for (const [s, path] of slices) {
        if (!path) continue;
        path.setAttribute(
          'd',
          sectorPath(cx, cy, INNER_R, OUTER_R, s.a0(t), s.a1(t))
        );
        path.style.opacity = String(s.on(t));
      }

      for (const [layout, els] of glyphEls) {
        const frames = numericFrame(layout, t);
        frames.forEach((f, i) => {
          const el = els[i];
          if (!el) return;
          if (!f) {
            el.style.opacity = '0';
            return;
          }
          el.style.opacity = String(f.opacity);
          el.style.transform = `translate(${f.x}px, ${f.y}px) scale(${f.scale})`;
          el.style.filter = f.blur > 0.05 ? `blur(${f.blur}px)` : 'none';
        });
      }

      const c = scene.count(t);
      if (count[0] && count[1]) {
        count[0].textContent = c.before && s.expenseCount(Number(c.before));
        count[0].style.opacity = String(1 - c.p);
        count[1].textContent = c.now && s.expenseCount(Number(c.now));
        count[1].style.opacity = String(c.p);
      }

      for (const { r, el, chevron, title } of rows) {
        if (el) {
          el.style.transform = `translateY(${r.y(t)}px)`;
          el.style.opacity = String(r.opacity(t));
        }
        const open = r.open(t);
        if (chevron) chevron.style.transform = `rotate(${-90 + 90 * open}deg)`;
        if (title) title.style.fontWeight = String(400 + 200 * open);
      }

      for (const { c, el } of chips) {
        if (!el) continue;
        el.style.opacity = String(c.on(t));
        el.style.transform = `translateY(${CARD_Y + cardH + 16}px)`;
      }

      for (const { r, el, rank } of exps) {
        if (el) {
          el.style.transform = `translateY(${r.y(t)}px)`;
          el.style.opacity = String(r.opacity(t));
        }
        const k = scene.rankText(t, r);
        if (rank[0] && rank[1]) {
          rank[0].textContent = k.before;
          rank[0].style.opacity = String(1 - k.p);
          rank[1].textContent = k.now;
          rank[1].style.opacity = String(k.p);
        }
      }

      touchAt(scene, t).forEach((touch, i) => {
        const el = touches[i];
        if (!el) return;
        if (!touch) {
          el.style.opacity = '0';
          return;
        }
        el.style.opacity = String(touch.opacity);
        el.style.transform = `translate(${touch.x - 22}px, ${touch.y - 22}px) scale(${touch.scale})`;
      });
    });
  }, [scene, onDraw, s]);

  const text = (size: number, weight = 400) => ({
    font: `${weight} ${size}px ${SYSTEM}`
  });

  return (
    <div ref={box} className="relative size-full overflow-hidden bg-black">
      <div
        ref={screen}
        className="absolute top-0 left-1/2 origin-top"
        style={{
          width: SCREEN_W,
          height: SCREEN_H + SHEET_Y,
          marginLeft: -SCREEN_W / 2,
          color: FOREGROUND
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[28px]"
          style={{ top: SHEET_Y, background: BACKGROUND }}
        >
          {/* Drag indicator, title, Done. */}
          <span
            className="absolute rounded-full"
            style={{
              left: SCREEN_W / 2 - 18,
              top: 5,
              width: 36,
              height: 5,
              background: '#5a5a5e'
            }}
          />
          <span
            className="absolute inset-x-0 text-center"
            style={{ top: 22, ...text(17, 600) }}
          >
            {s.charts}
          </span>
          <span
            className="absolute flex items-center justify-center rounded-full shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
            style={{
              right: 16,
              top: 12,
              // Fits "Done" at 70 pt; "Concluído" grows it, as the capsule does.
              minWidth: 70,
              paddingInline: 14,
              height: 42,
              background: '#272729',
              ...text(17, 600)
            }}
          >
            {s.done}
          </span>

          {/* The two segmented pickers. */}
          {(
            [
              ['lens', s.lenses],
              ['range', s.ranges]
            ] as const
          ).map(([name, labels], row) => (
            <div
              key={name}
              className="absolute rounded-full"
              style={{
                left: 20,
                right: 20,
                top: PICKER_Y + row * (PICKER_H + PICKER_GAP),
                height: PICKER_H,
                background: 'rgb(118 118 128 / 0.24)'
              }}
            >
              <span
                data-thumb={name}
                className="absolute rounded-full shadow-[0_3px_8px_rgb(0_0_0/0.12)]"
                style={{
                  left: 2,
                  top: 2,
                  bottom: 2,
                  width: (SCREEN_W - 44) / labels.length,
                  background: '#5a5a5e'
                }}
              />
              <div className="absolute inset-0 flex">
                {labels.map(label => (
                  <span
                    key={label}
                    data-seg={name}
                    className="relative flex flex-1 items-center justify-center"
                    style={text(13, 500)}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* By category. */}
          <div
            data-card1
            data-dim
            className="absolute overflow-hidden rounded-[20px]"
            style={{
              left: CARD_X,
              top: CARD_Y,
              width: CARD_W,
              background: CARD,
              boxShadow: `inset 0 0 0 1px ${BORDER}`
            }}
          >
            <span
              className="absolute"
              style={{ left: CARD_PAD, top: CARD_PAD, ...text(17, 600) }}
            >
              {s.byCategory}
            </span>
            {scene && (
              <div
                className="absolute"
                style={{
                  left: CARD_PAD,
                  top: DONUT_Y,
                  width: INNER_W,
                  height: DONUT_H
                }}
              >
                <svg
                  width={INNER_W}
                  height={DONUT_H}
                  className="absolute inset-0 overflow-visible"
                  aria-hidden
                >
                  {[...scene.sliceAngles.keys()].map(h => (
                    <path key={h} data-slice={h} fill={TINT[h]} />
                  ))}
                </svg>
                <span
                  className="absolute"
                  style={{
                    left: INNER_W / 2,
                    top: DONUT_H / 2 - 22,
                    ...text(20, 700),
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  <Numeric id="total" layout={scene.total} />
                </span>
                <span
                  data-count
                  className="absolute inset-x-0 text-center"
                  style={{
                    top: DONUT_H / 2 + 5,
                    color: MUTED_FOREGROUND,
                    ...text(12)
                  }}
                >
                  <span className="absolute inset-x-0" />
                  <span className="absolute inset-x-0" />
                </span>
              </div>
            )}

            {scene && (
              <div
                className="absolute"
                style={{ left: CARD_PAD, top: LEGEND_Y, width: INNER_W }}
              >
                {scene.rows.map(r => {
                  const heading = r.heading;
                  const category = heading ? null : (r.id.slice(2) as Category);
                  const Icon = category ? ICON[category] : null;
                  const h = heading ? HEADING_ROW_H : CATEGORY_ROW_H;
                  const size = heading ? 15 : 13;
                  return (
                    <div
                      key={r.id}
                      data-row={r.id}
                      className="absolute inset-x-0 top-0 flex items-center gap-[10px] opacity-0"
                      style={{ height: h, ...text(size) }}
                    >
                      {heading ? (
                        <>
                          <span
                            className="size-[10px] shrink-0 rounded-full"
                            style={{ background: TINT[heading] }}
                          />
                          <span data-title={r.id}>{s.heading[heading]}</span>
                          <ChevronDown
                            data-chevron={r.id}
                            className="size-[11px] shrink-0"
                            strokeWidth={3}
                            style={{ color: MUTED_FOREGROUND }}
                          />
                        </>
                      ) : (
                        category &&
                        Icon && (
                          <>
                            <Icon
                              className="ml-5 size-[13px] w-[18px] shrink-0"
                              style={{
                                color: TINT[CATEGORY[category].heading]
                              }}
                            />
                            <span style={{ color: MUTED_FOREGROUND }}>
                              {s.category[category]}
                            </span>
                          </>
                        )
                      )}
                      <span
                        className="absolute top-0"
                        style={{
                          left: INNER_W - 90,
                          color: MUTED_FOREGROUND,
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        <Numeric id={`p:${r.id}`} layout={r.percent} />
                      </span>
                      <span
                        className="absolute top-0"
                        style={{
                          left: INNER_W,
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        <Numeric id={`a:${r.id}`} layout={r.amount} />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* The filter chip, under the card while a heading is selected. */}
          {scene?.chips.map(({ heading }) => (
            <span
              key={heading}
              data-chip={heading}
              className="absolute top-0 flex items-center gap-2 rounded-full pr-2 pl-3 opacity-0"
              style={{
                left: CARD_X,
                height: CHIP_H,
                background: MUTED,
                ...text(15, 500)
              }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: TINT[heading as Heading] }}
              />
              {s.heading[heading as Heading]}
              <CircleX
                className="size-[17px]"
                fill={MUTED_FOREGROUND}
                stroke={MUTED}
                strokeWidth={2}
              />
            </span>
          ))}

          {/* Biggest expenses, as far as it shows. */}
          {scene && (
            <div
              data-card2
              data-dim
              className="absolute top-0 overflow-hidden rounded-[20px]"
              style={{
                left: CARD_X,
                width: CARD_W,
                height: 320,
                background: CARD,
                boxShadow: `inset 0 0 0 1px ${BORDER}`
              }}
            >
              <span
                className="absolute"
                style={{ left: CARD_PAD, top: CARD_PAD, ...text(17, 600) }}
              >
                {s.biggestExpenses}
              </span>
              <div
                className="absolute"
                style={{
                  left: CARD_PAD,
                  top: CARD_PAD + 22 + 14,
                  width: INNER_W
                }}
              >
                {scene.expenseRows.map(r => {
                  const Icon = ICON[r.category];
                  const tint = TINT[CATEGORY[r.category].heading];
                  return (
                    <div
                      key={r.id}
                      data-exp={r.id}
                      className="absolute inset-x-0 top-0 flex items-center gap-3 opacity-0"
                      style={{ height: EXPENSE_ROW_H, ...text(15) }}
                    >
                      <span
                        data-rank={r.id}
                        className="relative h-4 w-4 shrink-0 text-center"
                        style={{ color: MUTED_FOREGROUND, ...text(12, 700) }}
                      >
                        <span className="absolute inset-0" />
                        <span className="absolute inset-0" />
                      </span>
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${tint}26`, color: tint }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex flex-col gap-[2px]">
                        <span>{describe(s, r.description)}</span>
                        <span style={{ color: MUTED_FOREGROUND, ...text(12) }}>
                          {formatDate(s, r.date)}
                        </span>
                      </span>
                      <span
                        className="absolute top-[9px]"
                        style={{
                          left: INNER_W,
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        <Numeric id={`e:${r.id}`} layout={r.amount} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Where the finger lands; not part of the app. */}
          {scene?.taps.map((tap, i) => (
            <Fragment key={`${tap.at}`}>
              <span
                data-touch={i}
                className="pointer-events-none absolute top-0 left-0 size-11 rounded-full opacity-0"
                style={{
                  background: 'rgb(255 255 255 / 0.22)',
                  boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.25)'
                }}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
