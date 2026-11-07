import { breathe, curves, easeInOut } from './curves';
import {
  avatarsAt,
  exitDone,
  type ItemSpec,
  LIST_W,
  LIST_X,
  LIST_Y,
  type Lift,
  type PeerSpec,
  type RowFrame,
  ringAt,
  rowsAt,
  SCREEN_W,
  type Scene,
  type ScreenFrame,
  SETTLE,
  seam,
  touch
} from './scene';

/**
 * Moments from Listas' list screen, scripted the way they happen in
 * the app: a tap at pointer up, a re-render where the state changes, and
 * each transition the component declares playing from there.
 */

/** A moment on one phone. */
const single = (scene: {
  duration: number;
  items: ItemSpec[];
  peers: PeerSpec[];
  frame: (t: number) => ScreenFrame;
}): Scene => ({
  duration: scene.duration,
  screens: [{ items: scene.items, peers: scene.peers }],
  frame: t => [scene.frame(t)]
});

const quiet = {
  ring: 0,
  ringCheck: 0,
  count: '0 de 4',
  clear: 0,
  avatars: {},
  typing: { open: 0, text: '', dots: {} },
  toast: null,
  finger: null,
  fade: 1
} satisfies Partial<ScreenFrame>;

/** Where a finger lands on a row: mid-row, over the text. */
const onRow = (row: RowFrame | undefined, x = LIST_X + 150) => ({
  x,
  y: LIST_Y + (row?.y ?? 0) + (row ? row.height / 2 : 0)
});

/** Whoever is holding the phone, logged in. */
const ME = 'Gabriel';

/** Some added with an account, some without: those carry no name. */
const grocery: ItemSpec[] = [
  { id: 'leite', text: 'Leite', by: 'Ana' },
  { id: 'pao', text: 'Pão de forma', by: null },
  { id: 'cafe', text: 'Café', by: ME },
  { id: 'ovos', text: 'Ovos', by: null, quantity: 12 }
];

/* -------------------------------------------------------------------------- */
/* Tick                                                                        */
/* -------------------------------------------------------------------------- */

export const tick = (): Scene => {
  const taps = { pao: 0.6, ovos: 1.9, leite: 3.2, cafe: 4.5 };
  const duration = 6.8;
  const rows = rowsAt(
    grocery,
    {
      pao: { taps: [taps.pao] },
      ovos: { taps: [taps.ovos] },
      leite: { taps: [taps.leite] },
      cafe: { taps: [taps.cafe] }
    },
    [
      { at: 0, order: ['leite', 'pao', 'cafe', 'ovos'] },
      // Open items first, done ones under them in the order they were done.
      { at: taps.pao + SETTLE, order: ['leite', 'cafe', 'ovos', 'pao'] },
      { at: taps.ovos + SETTLE, order: ['leite', 'cafe', 'pao', 'ovos'] },
      { at: taps.leite + SETTLE, order: ['cafe', 'pao', 'ovos', 'leite'] },
      { at: taps.cafe + SETTLE, order: ['pao', 'ovos', 'leite', 'cafe'] }
    ],
    ME
  );
  const tapTimes = Object.values(taps);
  const ring = ringAt(tapTimes.map((at, i) => ({ at, value: (i + 1) / 4 })));

  return single({
    duration,
    items: grocery,
    peers: [],
    frame: t => {
      const list = rows(t);
      const doneCount = tapTimes.filter(at => at <= t).length;
      const tapping = Object.entries(taps).find(
        ([, up]) => t >= up - 0.17 && t <= up + 0.12
      );
      const finger = tapping
        ? touch(t, tapping[1] - 0.09, tapping[1], () =>
            onRow(list.rows[tapping[0]])
          )
        : null;
      return {
        ...quiet,
        ...list,
        ring: ring(t),
        ringCheck: curves.ringCheck(t - taps.cafe),
        count: `${doneCount} de 4`,
        clear: curves.clear(t - taps.pao),
        finger,
        fade: seam(t, duration)
      };
    }
  });
};

/* -------------------------------------------------------------------------- */
/* Presence                                                                    */
/* -------------------------------------------------------------------------- */

const ana: PeerSpec = { id: 'ana', name: 'Ana', color: '#ff9500' };
const capivara: PeerSpec = {
  id: 'capivara',
  name: 'Capivara anônima',
  color: '#5856d6'
};

const joinNames = (names: string[]) =>
  names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;

/** TypingIndicator's line for whoever is typing, in the peers' order. */
const typingText = (typers: PeerSpec[]) =>
  typers.length > 2
    ? `${typers.length} pessoas estão digitando…`
    : `${joinNames(typers.map(p => p.name))} ${typers.length === 1 ? 'está' : 'estão'} digitando…`;

/** The avatar spring settles, and AnimatePresence lets go, at its duration. */
const AVATAR_EXIT = 0.35;

export const presence = (): Scene => {
  const duration = 6.6;
  const join = { ana: 0.4, capivara: 1.1 };
  const leave = { ana: 4.8, capivara: 5.6 };
  const sent = 3.6;
  const items: ItemSpec[] = [
    ...grocery.slice(0, 3),
    { id: 'pilhas', text: 'Pilhas AA', by: null }
  ];
  const rows = rowsAt(
    items,
    {
      pilhas: { enter: sent },
      cafe: { here: [{ from: 1.6, to: 3, color: ana.color }] },
      // Leaving takes her colour with her.
      leite: { here: [{ from: 3, to: leave.ana, color: ana.color }] }
    },
    [
      { at: 0, order: ['leite', 'pao', 'cafe'] },
      { at: sent, order: ['leite', 'pao', 'cafe', 'pilhas'] }
    ],
    ME
  );
  const avatars = avatarsAt([ana, capivara], join, leave, [
    { at: 0, order: [] },
    { at: join.ana, order: ['ana'] },
    { at: join.capivara, order: ['ana', 'capivara'] },
    { at: leave.ana + AVATAR_EXIT, order: ['capivara'] },
    { at: leave.capivara + AVATAR_EXIT, order: [] }
  ]);
  const typing = [
    { peer: capivara, from: 2.3, to: sent },
    // Stops two and a half seconds after her last keystroke.
    { peer: ana, from: 3.2, to: 4.4 }
  ];
  const peerOrder = [ana, capivara];
  const typersAt = (t: number) =>
    peerOrder
      .map(peer => typing.find(s => s.peer === peer && t >= s.from && t < s.to))
      .filter(s => s !== undefined);

  return single({
    duration,
    items,
    peers: peerOrder,
    frame: t => {
      // Closing, the indicator keeps the last line it showed.
      const lastEnd = Math.max(...typing.map(s => s.to));
      const shown = typersAt(t < lastEnd ? t : lastEnd - 1e-6);
      const firstStart = Math.min(...typing.map(s => s.from));
      const open =
        t < lastEnd
          ? curves.typing(t - firstStart)
          : 1 - curves.typing(t - lastEnd);
      return {
        ...quiet,
        ...rows(t),
        count: `0 de ${t < sent ? 3 : 4}`,
        avatars: avatars(t),
        typing: {
          open,
          text: shown.length ? typingText(shown.map(s => s.peer)) : '',
          dots: Object.fromEntries(
            shown.map((s, i) => [s.peer.id, breathe(t - s.from, i * 0.16)])
          )
        },
        fade: seam(t, duration)
      };
    }
  });
};

/* -------------------------------------------------------------------------- */
/* Swipe to delete                                                             */
/* -------------------------------------------------------------------------- */

/** ItemRow: dragConstraints left -88, dragElastic 0.12 past it. */
const REVEAL = 88;
const constrain = (offset: number) =>
  offset > 0
    ? 0
    : offset < -REVEAL
      ? -REVEAL + (offset + REVEAL) * 0.12
      : offset;
/** dragDirectionLock: nothing moves until the pointer has gone 10 px one way. */
const LOCK = 10;

/** A finger dragging from `down` to `to` px by `moved`, let go at `up`. */
const drag = (down: number, moved: number, up: number, to: number) => {
  const offset = (t: number) =>
    to * easeInOut(Math.min(1, Math.max(0, (t - down) / (moved - down))));
  return {
    offset,
    x: (t: number) => {
      const o = offset(Math.min(t, up));
      return Math.abs(o) < LOCK ? 0 : constrain(o);
    }
  };
};

/** The toast after a delete, and Desfazer pressed and let go. */
const toastAt = (
  t: number,
  shown: number,
  undo: { down: number; up: number }
): ScreenFrame['toast'] => {
  if (t < shown || t >= undo.up + 0.45) return null;
  // .press:active while the finger is down.
  const press =
    t < undo.down
      ? 1
      : t <= undo.up
        ? 1 - 0.03 * curves.pressCss(t - undo.down)
        : 0.97 + 0.03 * curves.pressCss(t - undo.up);
  if (t < undo.up) {
    const s = curves.toast(t - shown);
    return {
      opacity: Math.min(1, s),
      y: -16 * (1 - s),
      scale: 0.96 + 0.04 * s,
      press
    };
  }
  const s = curves.toast(t - undo.up);
  return {
    opacity: Math.max(0, 1 - s),
    y: -12 * s,
    scale: 1 - 0.02 * s,
    press
  };
};

/** Where Desfazer sits in the toast, centred at the top. */
const TOAST_W = 228;
const onUndo = () => ({ x: SCREEN_W / 2 + TOAST_W / 2 - 8 - 45, y: 12 + 22 });

export const swipe = (): Scene => {
  const duration = 5;
  const first = { down: 0.5, moved: 0.85, up: 1 };
  const second = { down: 1.7, moved: 2.1, up: 2.12 };
  const short = drag(first.down, first.moved, first.up, -56);
  const long = drag(second.down, second.moved, second.up, -150);
  // Past three quarters of the reveal, the row leaves; onDelete runs after.
  const gone = second.up + 0.18;
  const removed = gone + 0.22;
  // The delete is queued, so the toast does not wait for the network.
  const toastIn = gone;
  const undo = { down: 3.82, up: 3.9 };

  const x = (t: number) => {
    if (t < first.up) return short.x(t);
    if (t < second.down) {
      const from = short.x(first.up);
      return from * (1 - curves.row(t - first.up));
    }
    if (t < second.up) return long.x(t);
    const from = long.x(second.up);
    return from + (-LIST_W - from) * curves.swipeAway(t - second.up);
  };

  const items: ItemSpec[] = [
    ...grocery,
    // Undo mounts the row anew, so it is a new row with the same item.
    { id: 'cafe-again', text: 'Café', by: ME }
  ];
  const rows = rowsAt(
    items,
    { cafe: { x, exit: gone }, 'cafe-again': { enter: undo.up } },
    [
      { at: 0, order: ['leite', 'pao', 'cafe', 'ovos'] },
      { at: removed, order: ['leite', 'pao', 'ovos'] },
      { at: undo.up, order: ['leite', 'pao', 'cafe-again', 'ovos'] }
    ],
    ME
  );

  return single({
    duration,
    items,
    peers: [],
    frame: t => {
      const list = rows(t);
      const cafe = list.rows.cafe;
      const start = onRow(cafe, LIST_X + 290);
      const fingerFor = (
        gesture: typeof first,
        path: ReturnType<typeof drag>
      ) =>
        touch(t, gesture.down, gesture.up, time => ({
          x: start.x + path.offset(time),
          y: start.y
        }));
      const finger =
        t < second.down - 0.1
          ? fingerFor(first, short)
          : t < undo.down - 0.1
            ? fingerFor(second, long)
            : touch(t, undo.down, undo.up, onUndo);

      const toast = toastAt(t, toastIn, undo);

      // The item leaves the count when it is deleted, not when its exit ends.
      const total = t >= gone && t < undo.up ? 3 : 4;
      return { ...quiet, ...list, count: `0 de ${total}`, toast, finger };
    }
  });
};

/* -------------------------------------------------------------------------- */
/* Reorder                                                                     */
/* -------------------------------------------------------------------------- */

/** A finger on the grip, moving `by` px between `down` and `moved`. */
const grab = (down: number, moved: number, up: number, by: number): Lift => ({
  down,
  up,
  offset: t =>
    by * easeInOut(Math.min(1, Math.max(0, (t - down) / (moved - down))))
});

/** The grip: the last thing in the row on touch, where the desktop × is hidden. */
const GRIP_X = LIST_X + LIST_W - 18;

/** The finger on a lift: on the grip, from where the row was when it went down. */
const onGrip = (
  rows: (t: number) => { rows: Record<string, RowFrame> },
  id: string,
  lift: Lift,
  t: number
) => {
  const start = onRow(rows(lift.down).rows[id]);
  return touch(t, lift.down, lift.up, time => ({
    x: GRIP_X,
    y: start.y + lift.offset(time)
  }));
};

export const reorder = (): Scene => {
  const duration = 5;
  // Ovos to the top past the three above it, and back down again.
  const reach = 205;
  const lifts = [grab(0.5, 1.5, 1.65, -reach), grab(2.8, 3.8, 3.95, reach)];
  const rows = rowsAt(
    grocery,
    { ovos: { lifts } },
    [{ at: 0, order: ['leite', 'pao', 'cafe', 'ovos'] }],
    ME
  );
  return single({
    duration,
    items: grocery,
    peers: [],
    frame: t => {
      const list = rows(t);
      const lift = lifts.find(l => t >= l.down - 0.1 && t <= l.up + 0.15);
      return {
        ...quiet,
        ...list,
        finger: lift ? onGrip(rows, 'ovos', lift, t) : null
      };
    }
  });
};

/* -------------------------------------------------------------------------- */
/* Someone else                                                                */
/* -------------------------------------------------------------------------- */

const gabriel: PeerSpec = { id: 'gabriel', name: ME, color: '#af52de' };

/** One way through the server, Ana to it or it to Gabriel. */
const HOP = 0.08;
/** presence.ts FOCUS_MS: how long touching an item marks you as on it. */
const FOCUS = 3;

/**
 * Ana moves Ovos to the top, then swipes Pão de forma away and takes it
 * back. Her drags never leave her phone: what reaches Gabriel is her touch,
 * sent on pointer down as presence, then the move, the delete and the undo,
 * each as the list's own event.
 */
export const elsewhere = (): Scene => {
  const duration = 6;
  const lift = grab(0.5, 1.4, 1.55, -205);
  const swipe = { down: 2.4, moved: 2.85, up: 2.87 };
  const path = drag(swipe.down, swipe.moved, swipe.up, -150);
  const gone = swipe.up + 0.18;
  const undo = { down: 4.2, up: 4.28 };
  // Seen on Gabriel's phone after her message goes through the server.
  const seen = (at: number) => at + 2 * HOP;

  const x = (t: number) => {
    if (t < swipe.up) return path.x(t);
    const from = path.x(swipe.up);
    return from + (-LIST_W - from) * curves.swipeAway(t - swipe.up);
  };
  const items: ItemSpec[] = [
    ...grocery,
    // Undo mounts the row anew, so it is a new row with the same item.
    { id: 'pao-again', text: 'Pão de forma', by: null }
  ];
  const moved = ['ovos', 'leite', 'pao', 'cafe'];
  const later = (removedAt: number, backAt: number) => [
    { at: exitDone(removedAt), order: ['ovos', 'leite', 'cafe'] },
    { at: backAt, order: ['ovos', 'leite', 'pao-again', 'cafe'] }
  ];
  const start = { at: 0, order: ['leite', 'pao', 'cafe', 'ovos'] };

  const hers = rowsAt(
    items,
    {
      ovos: { lifts: [lift] },
      pao: { x, exit: gone },
      'pao-again': { enter: undo.up }
    },
    [start, ...later(gone, undo.up)],
    'Ana'
  );
  const removed = seen(gone);
  const restored = seen(undo.up);
  // Her focus moves to whatever she touched last, for three seconds.
  const onPao = seen(swipe.down);
  const his = rowsAt(
    items,
    {
      ovos: { here: [{ from: seen(lift.down), to: onPao, color: ana.color }] },
      pao: {
        exit: removed,
        here: [{ from: onPao, to: removed + 1, color: ana.color }]
      },
      // Back with the same id, so her touch still marks it until it times out.
      'pao-again': {
        enter: restored,
        here: [{ from: restored, to: onPao + FOCUS, color: ana.color }]
      }
    },
    [start, { at: seen(lift.up), order: moved }, ...later(removed, restored)],
    ME
  );
  const present = (peer: PeerSpec) =>
    avatarsAt([peer], { [peer.id]: -1 }, {}, [{ at: 0, order: [peer.id] }]);
  const withGabriel = present(gabriel);
  const withAna = present(ana);
  const count = (t: number, from: number, to: number) =>
    `0 de ${t >= from && t < to ? 3 : 4}`;

  return {
    duration,
    screens: [
      { items, peers: [gabriel], owner: ana },
      { items, peers: [ana], owner: gabriel }
    ],
    frame: t => {
      const herList = hers(t);
      const at = onRow(herList.rows.pao, LIST_X + 290);
      const finger =
        t < swipe.down - 0.1
          ? onGrip(hers, 'ovos', lift, t)
          : t < undo.down - 0.1
            ? touch(t, swipe.down, swipe.up, time => ({
                x: at.x + path.offset(time),
                y: at.y
              }))
            : touch(t, undo.down, undo.up, onUndo);
      const fade = seam(t, duration);
      return [
        {
          ...quiet,
          ...herList,
          count: count(t, gone, undo.up),
          avatars: withGabriel(t),
          toast: toastAt(t, gone, undo),
          finger,
          fade
        },
        {
          ...quiet,
          ...his(t),
          count: count(t, removed, restored),
          avatars: withAna(t),
          fade
        }
      ];
    }
  };
};

export const listasScenes = {
  tick,
  presence,
  'swipe-to-delete': swipe,
  reorder,
  'someone-else': elsewhere
} as const;

export type ListasKind = keyof typeof listasScenes;
