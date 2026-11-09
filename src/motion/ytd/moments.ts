import {
  bytesReading,
  mediaReading,
  type Press,
  type TerminalFrame,
  Trail
} from './trail';
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
 * same order as cmd/down.go, with the keys a person presses and the time
 * each step takes on a fast connection.
 */

export type TerminalScene = {
  duration: number;
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

/** A key held down: one press, then the OS repeat after its delay. */
const held = (from: number, to: number, delay = 0.25, every = 0.05) => {
  const presses: Press[] = [{ at: from, key: 'down' }];
  for (let at = from + delay; at <= to; at += every)
    presses.push({ at, key: 'down' });
  return presses;
};

const hiddenNote = (container: string) =>
  container === 'mp4'
    ? 'VP9 streams do not fit in mp4 without re-encoding; use --format webm or mkv to see them'
    : '';

/** The steps every session starts with: the command, its intro and the video. */
function opening(u: Trail, flags: string, enter: number, found: number) {
  u.prompt(`ytd down ${URL}${flags}`, -Infinity);
  if (!u.enter(enter)) return false;
  u.intro(VERSION);
  if (!u.task('Fetching video info', 'Video found', enter, found)) return false;
  u.info(TITLE, AUTHOR, DURATION);
  return true;
}

/* -------------------------------------------------------------------------- */
/* A whole download                                                            */
/* -------------------------------------------------------------------------- */

export const down = (): TerminalScene => {
  const command = `ytd down ${URL}`;
  const typeFrom = 0.4;
  const enter = 2.35;
  const found = enter + 1;
  const video = videoFor('mp4');
  const audio = audioFor('mp4');
  const videoKeys: Press[] = [
    { at: 4, key: 'down' },
    { at: 4.35, key: 'down' },
    { at: 4.9, key: 'up' },
    { at: 5.25, key: 'up' },
    { at: 5.8, key: 'enter' }
  ];
  const audioKeys: Press[] = [{ at: 6.5, key: 'enter' }];
  const download = { since: 6.5, seconds: 2.6 };
  const total = (video[0]?.size ?? 0) + (audio[0]?.size ?? 0);
  const downloaded = download.since + download.seconds;
  const mux = { since: downloaded, until: downloaded + 0.55 };
  const duration = 12.5;

  return {
    duration,
    frame: t => {
      const u = new Trail(t);
      const fade = seam(t, duration);
      u.prompt(command, typeFrom);
      if (!u.enter(enter)) return u.frame(fade);
      u.intro(VERSION);
      if (!u.task('Fetching video info', 'Video found', enter, found))
        return u.frame(fade);
      u.info(TITLE, AUTHOR, DURATION);
      const v = u.select(
        'Video quality',
        hiddenNote('mp4'),
        videoHeader,
        video.map(videoRow),
        videoKeys
      );
      if (v === null) return u.frame(fade);
      const a = u.select(
        'Audio quality',
        '',
        audioHeader,
        audio.map(audioRow),
        audioKeys
      );
      if (a === null) return u.frame(fade);
      const finished = u.progress(
        'Downloading',
        download.since,
        bytesReading(total, transfer(total, download.seconds)),
        {
          at: downloaded,
          done: 'Downloaded',
          detail: `${formatSize(total)} in ${download.seconds.toFixed(1)}s`
        }
      );
      if (!finished) return u.frame(fade);
      if (!u.task('Muxing into mp4', 'Muxed into mp4', mux.since, mux.until))
        return u.frame(fade);
      // The container costs a little less than the two streams' own framing.
      u.saved(savedPath('mp4'), total * 0.998, mux.until - enter);
      u.prompt('', mux.until);
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
  // mkv takes every codec, so the list is long enough to scroll.
  const video = videoFor('mkv');
  const audio = audioFor('mkv');
  const videoKeys: Press[] = [
    { at: 1.8, key: 'down' },
    { at: 2.1, key: 'down' },
    { at: 2.4, key: 'down' },
    ...held(2.9, 3.6),
    { at: 4.6, key: 'end' },
    { at: 5.3, key: 'down' },
    { at: 5.85, key: 'down' },
    { at: 6.2, key: 'down' },
    { at: 6.8, key: 'enter' }
  ];
  const audioKeys: Press[] = [
    { at: 7.5, key: 'down' },
    { at: 7.85, key: 'up' },
    { at: 8.4, key: 'enter' }
  ];
  const duration = 10;
  const audioTotal = audio[0]?.size ?? 0;
  const total = (video[2]?.size ?? 0) + audioTotal;

  return {
    duration,
    frame: t => {
      const u = new Trail(t);
      const fade = seam(t, duration);
      if (!opening(u, ' --format mkv', enter, found)) return u.frame(fade);
      const v = u.select(
        'Video quality',
        hiddenNote('mkv'),
        videoHeader,
        video.map(videoRow),
        videoKeys
      );
      if (v === null) return u.frame(fade);
      const a = u.select(
        'Audio quality',
        '',
        audioHeader,
        audio.map(audioRow),
        audioKeys
      );
      if (a === null) return u.frame(fade);
      u.progress('Downloading', 8.4, bytesReading(total, transfer(total, 2.2)));
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
  // ffmpeg re-encodes, so every audio stream qualifies; --best takes the top.
  const best = audioFor('mp3')[0];
  const size = best?.size ?? 0;
  const download = { since: found, seconds: 0.5 };
  const startup = 0.25;
  const speed = 108;
  const encode = {
    since: download.since + download.seconds,
    startup,
    speed,
    seconds: startup + DURATION / speed
  };
  const encoded = encode.since + encode.seconds;
  // libmp3lame -q:a 0 averages about 245 kbps.
  const mp3 = (245_000 * DURATION) / 8;
  const duration = 8;

  return {
    duration,
    frame: t => {
      const u = new Trail(t);
      const fade = seam(t, duration);
      if (!opening(u, ' --format mp3 --best', enter, found))
        return u.frame(fade);
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
          mediaReading(el => Math.max(0, el - encode.startup) * encode.speed),
          {
            at: encoded,
            done: 'Re-encoded',
            detail: `in ${encode.seconds.toFixed(1)}s`
          }
        )
      )
        return u.frame(fade);
      u.saved(savedPath('mp3'), mp3, encoded - enter);
      u.prompt('', encoded);
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
  const video = videoFor('mp4')[0];
  const audio = audioFor('mp4')[0];
  const total = (video?.size ?? 0) + (audio?.size ?? 0);
  // Two connections: about a fifth of the usual speed.
  const bytes = transfer(total, 8.1);
  const interrupt = found + 2.7;
  const echo = { from: interrupt + 0.75, enter: interrupt + 1.45 };
  const duration = 8;

  return {
    duration,
    frame: t => {
      const u = new Trail(t);
      const fade = seam(t, duration);
      if (!opening(u, ' --best -c 2', enter, found)) return u.frame(fade);
      if (video) u.picked('Video quality', videoRow(video));
      if (audio) u.picked('Audio quality', audioRow(audio));
      u.press(interrupt, 'ctrl-c');
      const stopped = u.progress(
        'Downloading',
        found,
        bytesReading(total, bytes),
        { at: interrupt, fail: true }
      );
      if (!stopped) return u.frame(fade);
      u.cancelled();
      // Exit status 130: killed by SIGINT.
      u.prompt('echo $?', echo.from, 0.07);
      if (!u.enter(echo.enter)) return u.frame(fade);
      u.print('130');
      u.prompt('', echo.enter);
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
