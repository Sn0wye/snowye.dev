/**
 * The video every ytd moment downloads, and the streams its pickers list.
 *
 * Title and channel are the video's own (YouTube oEmbed). The duration and
 * the stream ladder are representative, not a capture: YouTube asked for a
 * sign-in when they were read. To replace them, run ytd's format dump for
 * izGwDsrQ1eQ and copy each stream's itag, bitrate and size here; the rows
 * below are built with the same printf layouts as cmd/down.go.
 */

export const URL = 'https://www.youtube.com/watch?v=izGwDsrQ1eQ';
export const TITLE = 'George Michael - Careless Whisper (Official Video)';
export const AUTHOR = 'georgemichaelVEVO';
/** Seconds. */
export const DURATION = 300;
export const VERSION = '0.2';

type Codec = 'H.264' | 'AV1' | 'VP9' | 'AAC' | 'Opus';

export type Stream = {
  itag: number;
  codec: Codec;
  /** kbps, as YouTube reports it. */
  kbps: number;
  /** Bytes. */
  size: number;
  quality?: string;
  channels?: number;
};

/** A stream of `kbps` over the whole video. */
const sized = (kbps: number) => Math.round((kbps * 1000 * DURATION) / 8);

const video = (
  quality: string,
  codec: Codec,
  kbps: number,
  itag: number
): Stream => ({ quality, codec, kbps, itag, size: sized(kbps) });

const audio = (codec: Codec, kbps: number, itag: number): Stream => ({
  codec,
  kbps,
  itag,
  channels: 2,
  size: sized(kbps)
});

/** Best first, the way VideoFormats sorts: size, then H.264 > AV1 > VP9. */
const allVideo: Stream[] = [
  video('1080p', 'H.264', 2400, 137),
  video('1080p', 'AV1', 1150, 399),
  video('1080p', 'VP9', 1500, 248),
  video('720p', 'H.264', 1250, 136),
  video('720p', 'AV1', 640, 398),
  video('720p', 'VP9', 800, 247),
  video('480p', 'H.264', 600, 135),
  video('480p', 'AV1', 340, 397),
  video('480p', 'VP9', 420, 244),
  video('360p', 'H.264', 330, 134),
  video('360p', 'AV1', 190, 396),
  video('360p', 'VP9', 260, 243),
  video('240p', 'H.264', 160, 133),
  video('240p', 'AV1', 95, 395),
  video('240p', 'VP9', 140, 242),
  video('144p', 'H.264', 70, 160),
  video('144p', 'AV1', 55, 394),
  video('144p', 'VP9', 80, 278)
];

/** By bitrate, AAC first on a tie, the way AudioFormats sorts. */
const allAudio: Stream[] = [
  audio('Opus', 135, 251),
  audio('AAC', 129, 140),
  audio('Opus', 70, 250),
  audio('Opus', 52, 249),
  audio('AAC', 48, 139)
];

/** What media.Supports lets into each container without re-encoding. */
const fits: Record<string, Codec[]> = {
  mp4: ['H.264', 'AV1', 'AAC'],
  mkv: ['H.264', 'AV1', 'VP9', 'AAC', 'Opus'],
  m4a: ['AAC']
};

export const videoFor = (container: string) =>
  allVideo.filter(s => fits[container]?.includes(s.codec));

/** With ffmpeg re-encoding (mp3), every stream is usable. */
export const audioFor = (container: string) =>
  container === 'mp3'
    ? allAudio
    : allAudio.filter(s => fits[container]?.includes(s.codec));

/* -------------------------------------------------------------------------- */
/* Go's formatting, ported                                                     */
/* -------------------------------------------------------------------------- */

const left = (s: string, n: number) => s.padEnd(n);
const right = (s: string, n: number) => s.padStart(n);

/** utils.FormatSize: MB, or GB from 1 GB up. */
export const formatSize = (bytes: number) => {
  if (bytes <= 0) return '0 B';
  const mb = bytes / 2 ** 20;
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
};

const channels = (n = 0) =>
  ({ 0: '-', 1: 'mono', 2: 'stereo', 6: '5.1', 8: '7.1' })[n] ?? `${n}ch`;

/** cmd.videoRow: "%-14s %-6s %10s %10s  %4d". */
export const videoRow = (s: Stream) =>
  `${left(s.quality ?? '', 14)} ${left(s.codec, 6)} ${right(`${s.kbps} kbps`, 10)} ${right(formatSize(s.size), 10)}  ${right(String(s.itag), 4)}`;

/** cmd.audioRow: "%-6s %10s %-8s %10s  %4d  %s", with no language. */
export const audioRow = (s: Stream) =>
  `${left(s.codec, 6)} ${right(`${s.kbps} kbps`, 10)} ${left(channels(s.channels), 8)} ${right(formatSize(s.size), 10)}  ${right(String(s.itag), 4)}  `;

export const videoHeader = `${left('QUALITY', 14)} ${left('CODEC', 6)} ${right('BITRATE', 10)} ${right('SIZE', 10)}  ${right('ITAG', 4)}`;
export const audioHeader = `${left('CODEC', 6)} ${right('BITRATE', 10)} ${left('CHANNELS', 8)} ${right('SIZE', 10)}  ${right('ITAG', 4)}  LANGUAGE`;

/** The file name ytd derives from the title, under ~/Downloads. */
export const savedPath = (container: string) =>
  `~/Downloads/george-michael-careless-whisper-official-video.${container}`;
