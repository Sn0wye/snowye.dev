import { checkPop, type Curve, curves, flipping, snapBack } from './curves';

/**
 * The list screen as the app lays it out at 390 px, in CSS pixels, and the
 * machinery the three moments share: rows that tick, move, leave and come
 * back, each a pure function of time.
 */

export const SCREEN_W = 390;
export const SCREEN_H = 660;
/** main's px-4. */
export const LIST_X = 16;
export const LIST_W = SCREEN_W - LIST_X * 2;
/** TopBar (48) + title (mt-1, 34 px at 1.1) + meta row (mt-2, 22) + mt-5. */
export const META_Y = 105;
export const LIST_Y = META_Y + 22 + 20;
/** ItemRow: min-h-14 plus border-b, for a row with no byline. */
const ROW_BARE = 56 + 1;
/** py-3.5 around 17 px text and a 13 px byline, both at 1.35, plus border-b. */
const ROW_WITH_BYLINE = 14 + 22.95 + 2 + 17.55 + 14 + 1;
export const rowHeight = (byline: string | null) =>
  byline ? ROW_WITH_BYLINE : ROW_BARE;
/** PresenceStack's right edge: main's padding, then the button's p-1. */
export const AVATARS_RIGHT = SCREEN_W - LIST_X - 4;

export type ItemSpec = {
  id: string;
  text: string;
  /** created_by_name: the username of whoever added it, null without an account. */
  by: string | null;
  /** Defaults to 1, which shows only a faint "+". */
  quantity?: number;
};

/** ListView SETTLE_MS: a ticked row holds its place while the check lands. */
export const SETTLE = 0.65;

export type PeerSpec = { id: string; name: string; color: string };

export type RowFrame = {
  mounted: boolean;
  /** Place in the DOM; later rows paint over earlier ones as they pass. */
  index: number;
  y: number;
  /** The li's height, for a row collapsing on its way out. */
  height: number;
  border: boolean;
  opacity: number;
  /** ItemRow's enter: translateY from 6 px. */
  shift: number;
  /** Drag offset. */
  x: number;
  press: number;
  done: boolean;
  /** The grip, while the row is open and has not sunk yet. */
  grip: boolean;
  /** Picked up by its grip: drawn over the others, with whileDrag's shadow. */
  lifted: boolean;
  shadow: number;
  /** "por <name>" once done, the creator before; null for anyone without an account. */
  byline: string | null;
  /** checkbox fill and border, 0 → 1 */
  box: number;
  pop: number;
  check: number;
  strike: number;
  /** text colour toward --text-2 */
  dim: number;
  backdrop: number;
  trash: number;
  here: { color: string; opacity: number } | null;
};

export type ScreenFrame = {
  rows: Record<string, RowFrame>;
  /** The list's drawn height, and the height it takes in the flow. */
  listHeight: number;
  listFlow: number;
  ring: number;
  ringCheck: number;
  count: string;
  clear: number;
  avatars: Record<
    string,
    { mounted: boolean; x: number; opacity: number; scale: number }
  >;
  typing: { open: number; text: string; dots: Record<string, number> };
  toast: { opacity: number; y: number; scale: number; press: number } | null;
  finger: { x: number; y: number; opacity: number } | null;
  /** The loop's own fade, not the app's. */
  fade: number;
};

/** One phone: what is on its list, who else it shows, and whose it is. */
export type ScreenSpec = {
  items: ItemSpec[];
  peers: PeerSpec[];
  /** Named over the phone when a moment shows more than one. */
  owner?: PeerSpec;
};

export type Scene = {
  duration: number;
  screens: ScreenSpec[];
  /** One frame per screen. */
  frame: (t: number) => ScreenFrame[];
};

/** What is in the DOM, in order, from `at` on. */
export type Commit = { at: number; order: string[] };

/**
 * Motion's layout animation. At each commit, whatever moved is drawn where
 * it was and eases to its new place along `curve`; a commit that lands
 * mid-flight starts from wherever things were drawn then.
 */
export function layoutTrack(
  commits: Commit[],
  place: (order: string[], t: number) => Record<string, number>,
  curve: Curve
) {
  const deltas: Record<string, number>[] = [];
  const drawn = (k: number, t: number) => {
    const commit = commits[k];
    if (!commit) return {};
    const natural = place(commit.order, t);
    const delta = deltas[k] ?? {};
    const left = 1 - curve(t - commit.at);
    const out: Record<string, number> = {};
    for (const key of Object.keys(natural))
      out[key] = (natural[key] ?? 0) + (delta[key] ?? 0) * left;
    return out;
  };
  commits.forEach((commit, k) => {
    const delta: Record<string, number> = {};
    deltas[k] = delta;
    if (k === 0) return;
    // An instant before, so a height that changes with the commit counts.
    const before = drawn(k - 1, commit.at - 1e-6);
    const after = place(commit.order, commit.at);
    for (const key of Object.keys(after))
      if (key in before) delta[key] = (before[key] ?? 0) - (after[key] ?? 0);
  });
  return (t: number) => {
    let k = 0;
    while (k + 1 < commits.length && (commits[k + 1]?.at ?? 0) <= t) k++;
    return { drawn: drawn(k, t), order: commits[k]?.order ?? [] };
  };
}

/** Everything that happens to one row. */
export type RowScript = {
  /** Mounted (and animating in) at; absent rows are there from the start. */
  enter?: number;
  /** Removed from the list at; the exit plays from here. */
  exit?: number;
  /** Taps that flip done, at pointer up. */
  taps?: number[];
  /** Drag offset over time. */
  x?: (t: number) => number;
  here?: { from: number; to: number; color: string }[];
  /** Drags by the grip, up or down. */
  lifts?: Lift[];
};

/** A finger on the grip from `down` to `up`, `offset(t)` px from where it started. */
export type Lift = { down: number; up: number; offset: (t: number) => number };

/** The pan gesture starts once the pointer has moved 3 px. */
const PAN = 3;
const panned = (offset: number) => (Math.abs(offset) < PAN ? 0 : offset);
/** How long a let-go row stays over the others. */
const LANDING = 0.8;

/**
 * Motion's checkReorder, run over the drag: moving down, the dragged row
 * swaps with the next one once its bottom passes that row's middle; moving
 * up, once its top passes the previous row's middle. Each swap re-renders
 * the list in the new order.
 */
function reorders(
  start: string[],
  id: string,
  lift: Lift,
  place: (order: string[], t: number) => Record<string, number>
) {
  const commits: Commit[] = [];
  let order = start;
  const top0 = place(order, lift.down)[id] ?? 0;
  const dt = 0.001;
  for (let t = lift.down + dt; t <= lift.up; t += dt) {
    const slots = place(order, t);
    const middle = (other: string | undefined) => {
      if (!other) return null;
      const i = order.indexOf(other);
      const next = order[i + 1];
      const end = next ? (slots[next] ?? 0) : (slots.__height ?? 0);
      return ((slots[other] ?? 0) + end) / 2;
    };
    const i = order.indexOf(id);
    const own = order[i + 1]
      ? (slots[order[i + 1] ?? ''] ?? 0)
      : (slots.__height ?? 0);
    const height = own - (slots[id] ?? 0);
    const top = top0 + panned(lift.offset(t));
    const velocity = lift.offset(t) - lift.offset(t - dt);
    const up = velocity < 0 ? middle(order[i - 1]) : null;
    const down = velocity > 0 ? middle(order[i + 1]) : null;
    const to =
      up !== null && top < up
        ? i - 1
        : down !== null && top + height > down
          ? i + 1
          : i;
    if (to === i) continue;
    order = [...order];
    order.splice(i, 1);
    order.splice(to, 0, id);
    commits.push({ at: t, order });
  }
  return { commits, top0 };
}

const EXIT_FOR = 0.22;

/** The li's height on its way out; border-box keeps the border's pixel. */
const exitHeight = (full: number, since: number) =>
  Math.max(1, full * (1 - curves.exitHeight(since)));

/** whileTap: 0.985 while down, back to 1 on release, 120 ms each way. */
const pressScale = (t: number, taps: number[]) => {
  for (const up of taps) {
    const down = up - 0.09;
    if (t < down || t > up + 0.12) continue;
    const pressed = 1 - 0.015 * curves.press(Math.min(t, up) - down);
    if (t <= up) return pressed;
    return pressed + (1 - pressed) * curves.press(t - up);
  }
  return 1;
};

const lastAtOrBefore = (times: number[], t: number) => {
  let last: number | null = null;
  let count = 0;
  for (const time of times) {
    if (time > t) break;
    last = time;
    count++;
  }
  return { last, count };
};

/**
 * `commits` lists DOM order over time, exiting rows included until their
 * exit is done; the heights come from the scripts. `me` is the username of
 * whoever is tapping, which a done row shows as "por <me>".
 */
export function rowsAt(
  items: ItemSpec[],
  scripts: Record<string, RowScript>,
  orders: Commit[],
  me: string | null
) {
  const byId = new Map(items.map(item => [item.id, item]));
  const doneAt = (id: string, t: number) =>
    lastAtOrBefore(scripts[id]?.taps ?? [], t).count % 2 === 1;
  const bylineAt = (id: string, t: number) => {
    const item = byId.get(id);
    if (!item) return null;
    return doneAt(id, t) ? me && `por ${me}` : item.by;
  };
  const commits: Commit[] = [...orders];
  const orderAt = (t: number) =>
    commits
      .filter(c => c.at <= t)
      .sort((a, b) => a.at - b.at)
      .at(-1)?.order ?? [];
  const heightAt = (id: string, t: number, last: boolean) => {
    if (!byId.has(id)) return 0;
    const full = rowHeight(bylineAt(id, t)) - (last ? 1 : 0);
    const exit = scripts[id]?.exit;
    return exit !== undefined && t >= exit ? exitHeight(full, t - exit) : full;
  };
  const place = (order: string[], t: number) => {
    const out: Record<string, number> = {};
    let y = 0;
    order.forEach((id, i) => {
      out[id] = y;
      y += heightAt(id, t, i === order.length - 1);
    });
    out.__height = y;
    return out;
  };
  // Drags, in time order, each reordering from wherever the last one left.
  const lifted: {
    id: string;
    lift: Lift;
    top0: number;
    land: Curve;
    slot: number;
  }[] = [];
  const lifts = Object.entries(scripts)
    .flatMap(([id, s]) => (s.lifts ?? []).map(lift => ({ id, lift })))
    .sort((a, b) => a.lift.down - b.lift.down);
  for (const { id, lift } of lifts) {
    const { commits: swaps, top0 } = reorders(
      orderAt(lift.down),
      id,
      lift,
      place
    );
    commits.push(...swaps);
    const slot = place(orderAt(lift.up), lift.up)[id] ?? 0;
    const released = top0 + panned(lift.offset(lift.up));
    lifted.push({ id, lift, top0, land: snapBack(released - slot), slot });
  }
  // A tap re-renders the row with its new byline, and a row that grows or
  // shrinks moves the ones under it: a commit in the same order.
  for (const s of Object.values(scripts))
    for (const at of s.taps ?? []) commits.push({ at, order: orderAt(at) });
  commits.sort((a, b) => a.at - b.at);
  /** Where a row under the finger, or settling after it, is drawn. */
  const liftAt = (id: string, t: number, order: string[]) => {
    const l = lifted.find(
      l => l.id === id && t >= l.lift.down && t < l.lift.up + LANDING
    );
    if (!l) return null;
    const raised = (time: number) => curves.lift(time - l.lift.down);
    if (t <= l.lift.up)
      return { y: l.top0 + panned(l.lift.offset(t)), shadow: raised(t) };
    return {
      y: (place(order, t)[id] ?? 0) + l.land(t - l.lift.up),
      shadow: raised(l.lift.up) * (1 - curves.lift(t - l.lift.up))
    };
  };
  const positions = layoutTrack(commits, place, curves.row);
  const height = layoutTrack(commits, place, curves.layout);
  const colour = Object.fromEntries(
    items.map(item => [
      item.id,
      flipping(scripts[item.id]?.taps ?? [], curves.boxColour)
    ])
  );
  const checks = Object.fromEntries(
    items.map(item => [
      item.id,
      flipping(scripts[item.id]?.taps ?? [], curves.check)
    ])
  );
  const strikes = Object.fromEntries(
    items.map(item => [
      item.id,
      flipping(scripts[item.id]?.taps ?? [], curves.strike)
    ])
  );
  const dims = Object.fromEntries(
    items.map(item => [
      item.id,
      flipping(scripts[item.id]?.taps ?? [], curves.dim)
    ])
  );

  return (t: number) => {
    const { drawn, order } = positions(t);
    const flow = place(order, t).__height ?? 0;
    const rows: Record<string, RowFrame> = {};
    for (const item of items) {
      const script = scripts[item.id] ?? {};
      const index = order.indexOf(item.id);
      const taps = script.taps ?? [];
      const { last: tapped, count } = lastAtOrBefore(taps, t);
      const done = count % 2 === 1;
      const enter = script.enter;
      const exit = script.exit;
      const x = script.x?.(t) ?? 0;
      const here = script.here?.find(h => t >= h.from && t < h.to + 0.25);
      const lift = liftAt(item.id, t, order);
      rows[item.id] = {
        mounted: index !== -1,
        index: lift ? order.length : index,
        y: lift?.y ?? drawn[item.id] ?? 0,
        grip: !done || (tapped !== null && t < tapped + SETTLE),
        lifted: lift !== null,
        shadow: lift?.shadow ?? 0,
        height: heightAt(item.id, t, index === order.length - 1),
        border: index !== order.length - 1,
        opacity:
          (enter !== undefined ? curves.enterOpacity(t - enter) : 1) *
          (exit !== undefined && t >= exit
            ? 1 - curves.exitOpacity(t - exit)
            : 1),
        shift: enter !== undefined ? 6 * (1 - curves.enterShift(t - enter)) : 0,
        x,
        press: pressScale(t, taps),
        done,
        byline: bylineAt(item.id, t),
        box: colour[item.id]?.(t) ?? 0,
        // The pop is an animation on the done state only.
        pop: done && tapped !== null ? checkPop(t - tapped) : 1,
        check: checks[item.id]?.(t) ?? 0,
        strike: strikes[item.id]?.(t) ?? 0,
        dim: dims[item.id]?.(t) ?? 0,
        // useTransform(x, [-88, -16], [1, 0]) and (x, [-88, -44], [1, 0.6]).
        backdrop: Math.min(1, Math.max(0, (x + 16) / -72)),
        trash: 0.6 + 0.4 * Math.min(1, Math.max(0, (x + 44) / -44)),
        here: here
          ? {
              color: here.color,
              opacity:
                t < here.to
                  ? curves.here(t - here.from)
                  : 1 - curves.here(t - here.to)
            }
          : null
      };
    }
    return {
      rows,
      listHeight: height(t).drawn.__height ?? 0,
      listFlow: flow
    };
  };
}

/** When an exit that starts at `at` is done and the row leaves the DOM. */
export const exitDone = (at: number) => at + EXIT_FOR;

/** PresenceStack: right-aligned, each after the first 4 px over the last. */
export function avatarsAt(
  peers: PeerSpec[],
  joins: Record<string, number>,
  leaves: Record<string, number>,
  commits: Commit[]
) {
  const place = (order: string[]) => {
    const out: Record<string, number> = {};
    order.forEach((id, i) => {
      out[id] = AVATARS_RIGHT - 22 - (order.length - 1 - i) * 18;
    });
    return out;
  };
  const track = layoutTrack(commits, place, curves.avatar);
  return (t: number) => {
    const { drawn, order } = track(t);
    return Object.fromEntries(
      peers.map(peer => {
        const join = joins[peer.id] ?? Number.POSITIVE_INFINITY;
        const leave = leaves[peer.id];
        const s =
          leave !== undefined && t >= leave
            ? 1 - curves.avatar(t - leave)
            : curves.avatar(t - join);
        return [
          peer.id,
          {
            mounted: order.includes(peer.id),
            x: drawn[peer.id] ?? 0,
            opacity: Math.min(1, Math.max(0, s)),
            scale: 0.6 + 0.4 * s
          }
        ];
      })
    );
  };
}

/** The ring's arc easing between counts, as its stroke-dashoffset transition does. */
export function ringAt(steps: { at: number; value: number }[]) {
  return (t: number) => {
    let value = 0;
    for (const step of steps) {
      if (step.at > t) break;
      value = value + (step.value - value) * curves.ring(t - step.at);
    }
    return value;
  };
}

/** A fade over the loop's seam, in and out, so the restart is not a cut. */
export const seam = (t: number, duration: number, over = 0.35) =>
  Math.min(1, t / over, (duration - t) / over);

/** A touch drawn the way the Simulator shows them. */
export const touch = (
  t: number,
  down: number,
  up: number,
  path: (t: number) => { x: number; y: number }
) => {
  if (t < down - 0.08 || t > up + 0.12) return null;
  const opacity =
    t < down ? (t - down + 0.08) / 0.08 : t > up ? 1 - (t - up) / 0.12 : 1;
  return { ...path(Math.min(Math.max(t, down), up)), opacity };
};
