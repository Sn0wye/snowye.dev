import { type Script, script, type Stroke } from '@/motion/keystrokes';

import { bytesReading, mediaReading, type TerminalFrame, Trail } from './trail';
import {
  audioFor,
  audioHeader,
  audioRow,
  AUTHOR,
  DURATION,
  formatSize,
  savedPath,
  TITLE,
  URL,
  VERSION,
  videoFor,
  videoHeader,
  videoRow
} from './video';

/**
 * `ytd down` sessions, scripted the way they run: the same calls in the
 * same order as cmd/down.go, the keys a person presses, and the time each
 * step takes on a fast connection. The first one types `ytd down ` and
 * pastes the link; the others start with their command already typed.
 */

export type TerminalScene = {
  duration: number;
  /** What the person presses, for the terminal and the keystroke overlay. */
  strokes: Stroke[];
  frame: (t: number) => TerminalFrame;
};

/** A fade over the loop's seam, in and out, so the restart is not a cut. */
const seam = (t: number, duration: number, over = 0.35) =>
  Math.max(0, Math.min(1, t / over, (duration - t) / over));

/** Bytes over time from parallel connections: a quick ramp, then steady. */
const transfer = (total: number, seconds: number, ramp = 0.35) => {
  const shape = (el: number) => el - ramp * (1 - Math.exp(-el / ramp));
  const rate = total / shape(seconds);
  return (el: number) => rate * shape(el);
};

const hiddenNote = (container: string) =>
  container === 'mp4'
    ? 'VP9 streams do not fit in mp4 without re-encoding; use --format webm or mkv to see them'
    : '';

/** `ytd down `, ⌘V, Enter. Returns when Enter goes down. */
function command(keys: Script) {
  keys.type('ytd down ').wait(0.3).paste(URL).wait(0.45);
  const enter = keys.now;
  keys.press('Enter');
  return enter;
}

/**
 * The steps every session starts with: the command, its intro and the
 * video. With `flags`, the command is on the prompt already.
 */
function opening(u: Trail, enter: number, found: number, flags?: string) {
  const already = flags === undefined ? '' : `ytd down ${URL}${flags}`;
  if (!u.prompt(0, enter, already)) return false;
  u.intro(VERSION);
  if (!u.task('Fetching video info', 'Video found', enter, found)) return false;
  u.info(TITLE, AUTHOR, DURATION);
  return true;
}

/* -------------------------------------------------------------------------- */
/* A whole download                                                            */
/* -------------------------------------------------------------------------- */

export const down = (): TerminalScene => {
  const keys = script(0.5);
  const enter = command(keys);
  const found = enter + 1;
  // Look around the list, come back to the top one.
  keys
    .at(found + 0.65)
    .press('ArrowDown', [], 0.35)
    .press('ArrowDown', [], 0.55)
    .press('ArrowUp', [], 0.35)
    .press('ArrowUp', [], 0.55);
  const videoPicked = keys.now;
  keys.press('Enter', [], 0.7);
  const audioPicked = keys.now;
  keys.press('Enter');

  const video = videoFor('mp4');
  const audio = audioFor('mp4');
  const total = (video[0]?.size ?? 0) + (audio[0]?.size ?? 0);
  const seconds = 2.6;
  const downloaded = audioPicked + seconds;
  const muxed = downloaded + 0.55;
  const duration = muxed + 2.6;

  return {
    duration,
    strokes: keys.strokes,
    frame: t => {
      const u = new Trail(t, keys.strokes);
      const fade = seam(t, duration);
      if (!opening(u, enter, found)) return u.frame(fade);
      const v = u.select(
        'Video quality',
        hiddenNote('mp4'),
        videoHeader,
        video.map(videoRow),
        found
      );
      if (v === null) return u.frame(fade);
      const a = u.select(
        'Audio quality',
        '',
        audioHeader,
        audio.map(audioRow),
        videoPicked
      );
      if (a === null) return u.frame(fade);
      const finished = u.progress(
        'Downloading',
        audioPicked,
        bytesReading(total, transfer(total, seconds)),
        {
          at: downloaded,
          done: 'Downloaded',
          detail: `${formatSize(total)} in ${seconds.toFixed(1)}s`
        }
      );
      if (!finished) return u.frame(fade);
      if (!u.task('Muxing into mp4', 'Muxed into mp4', downloaded, muxed))
        return u.frame(fade);
      // The container costs a little less than the two streams' own framing.
      u.saved(savedPath('mp4'), total * 0.998, muxed - enter);
      u.prompt(muxed, Infinity);
      return u.frame(fade);
    }
  };
};

/* -------------------------------------------------------------------------- */
/* The quality picker                                                          */
/* -------------------------------------------------------------------------- */

export const picker = (): TerminalScene => {
  const enter = 0.3;
  const found = 1.1;
  const keys = script(enter).press('Enter');
  // mkv takes every codec, so the list is long enough to scroll.
  const flags = ' --format mkv';
  keys
    .at(found + 0.7)
    .press('ArrowDown', [], 0.32)
    .press('ArrowDown', [], 0.32)
    .press('ArrowDown', [], 0.7)
    .press('ArrowUp', [], 0.32)
    .press('ArrowUp', [], 0.32)
    .press('ArrowUp', [], 0.8)
    // Up from the top wraps to the last row, scrolling the list; down from
    // there wraps back.
    .press('ArrowUp', [], 1.1)
    .press('ArrowDown', [], 0.6)
    .press('ArrowDown', [], 0.32)
    .press('ArrowDown', [], 0.6);
  const videoPicked = keys.now;
  keys
    .press('Enter', [], 0.7)
    .press('ArrowDown', [], 0.35)
    .press('ArrowUp', [], 0.5);
  const audioPicked = keys.now;
  keys.press('Enter');

  const video = videoFor('mkv');
  const audio = audioFor('mkv');
  const total = (video[2]?.size ?? 0) + (audio[0]?.size ?? 0);
  const duration = audioPicked + 1.6;

  return {
    duration,
    strokes: keys.strokes,
    frame: t => {
      const u = new Trail(t, keys.strokes);
      const fade = seam(t, duration);
      if (!opening(u, enter, found, flags)) return u.frame(fade);
      const v = u.select(
        'Video quality',
        hiddenNote('mkv'),
        videoHeader,
        video.map(videoRow),
        found
      );
      if (v === null) return u.frame(fade);
      const a = u.select(
        'Audio quality',
        '',
        audioHeader,
        audio.map(audioRow),
        videoPicked
      );
      if (a === null) return u.frame(fade);
      u.progress(
        'Downloading',
        audioPicked,
        bytesReading(total, transfer(total, 2.2))
      );
      return u.frame(fade);
    }
  };
};

/* -------------------------------------------------------------------------- */
/* Re-encoding to mp3                                                          */
/* -------------------------------------------------------------------------- */

export const reencode = (): TerminalScene => {
  const enter = 0.5;
  const found = 1.35;
  const keys = script(enter).press('Enter');
  const flags = ' --format mp3 --best';
  // ffmpeg re-encodes, so every audio stream qualifies; --best takes the top.
  const best = audioFor('mp3')[0];
  const size = best?.size ?? 0;
  const download = { since: found, seconds: 0.5 };
  const startup = 0.25;
  const speed = 108;
  const encode = {
    since: download.since + download.seconds,
    seconds: startup + DURATION / speed
  };
  const encoded = encode.since + encode.seconds;
  // libmp3lame -q:a 0 averages about 245 kbps.
  const mp3 = (245_000 * DURATION) / 8;
  const duration = encoded + 2.4;

  return {
    duration,
    strokes: keys.strokes,
    frame: t => {
      const u = new Trail(t, keys.strokes);
      const fade = seam(t, duration);
      if (!opening(u, enter, found, flags)) return u.frame(fade);
      if (best) u.picked('Audio quality', audioRow(best));
      if (
        !u.progress(
          'Downloading',
          download.since,
          bytesReading(size, transfer(size, download.seconds, 0.12)),
          {
            at: download.since + download.seconds,
            done: 'Downloaded',
            detail: `${formatSize(size)} in ${download.seconds.toFixed(1)}s`
          }
        )
      )
        return u.frame(fade);
      if (
        !u.progress(
          'Re-encoding with ffmpeg',
          encode.since,
          mediaReading(el => Math.max(0, el - startup) * speed),
          {
            at: encoded,
            done: 'Re-encoded',
            detail: `in ${encode.seconds.toFixed(1)}s`
          }
        )
      )
        return u.frame(fade);
      u.saved(savedPath('mp3'), mp3, encoded - enter);
      u.prompt(encoded, Infinity);
      return u.frame(fade);
    }
  };
};

/* -------------------------------------------------------------------------- */
/* Ctrl-C                                                                      */
/* -------------------------------------------------------------------------- */

export const cancel = (): TerminalScene => {
  const enter = 0.5;
  const found = 1.35;
  const interrupt = found + 2.7;
  const keys = script(enter).press('Enter').at(interrupt).press('c', ['ctrl']);
  // Two connections: about a fifth of the usual speed.
  const flags = ' --best -c 2';

  const video = videoFor('mp4')[0];
  const audio = audioFor('mp4')[0];
  const total = (video?.size ?? 0) + (audio?.size ?? 0);
  const bytes = transfer(total, 8.1);
  const duration = interrupt + 2.2;

  return {
    duration,
    strokes: keys.strokes,
    frame: t => {
      const u = new Trail(t, keys.strokes);
      const fade = seam(t, duration);
      if (!opening(u, enter, found, flags)) return u.frame(fade);
      if (video) u.picked('Video quality', videoRow(video));
      if (audio) u.picked('Audio quality', audioRow(audio));
      const stopped = u.progress(
        'Downloading',
        found,
        bytesReading(total, bytes),
        { at: interrupt, fail: true }
      );
      if (!stopped) return u.frame(fade);
      u.cancelled();
      u.prompt(interrupt, Infinity);
      return u.frame(fade);
    }
  };
};

export const ytdScenes = {
  'ytd-down': down,
  'quality-picker': picker,
  're-encode': reencode,
  'ctrl-c': cancel
} as const;

export type YtdKind = keyof typeof ytdScenes;
