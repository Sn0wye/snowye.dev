/**
 * The video every ytd moment downloads, and the streams its pickers list.
 *
 * A capture, not a guess: title, channel, length and every stream's itag,
 * bitrate and size are what ytd's own client (GetVideo, VideoChoices,
 * AudioChoices) returned for dQw4w9WgXcQ. The rows below are built with
 * the same printf layouts as cmd/down.go.
 */

export const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
/** ytd takes a bare 11-character video ID as well as any link to it. */
export const ID = 'dQw4w9WgXcQ';
export const TITLE =
  'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)';
export const AUTHOR = 'Rick Astley';
/** Seconds. */
export const DURATION = 213;
/** The release Homebrew installs; GoReleaser stamps it into cmd.version. */
export const VERSION = '1.1.0';

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

const video = (
  quality: string,
  codec: Codec,
  kbps: number,
  size: number,
  itag: number
): Stream => ({ quality, codec, kbps, size, itag });

const audio = (
  codec: Codec,
  kbps: number,
  size: number,
  itag: number
): Stream => ({ codec, kbps, itag, channels: 2, size });

/** Best first, the way VideoFormats sorts them. */
const allVideo: Stream[] = [
  video('2160p', 'AV1', 9024, 240_334_643, 401),
  video('2160p', 'VP9', 13_466, 358_608_461, 313),
  video('1440p', 'AV1', 4587, 122_168_277, 400),
  video('1440p', 'VP9', 5674, 151_103_346, 271),
  video('1080p', 'H.264', 3038, 80_911_999, 137),
  video('1080p', 'AV1', 1142, 30_415_996, 399),
  video('1080p', 'VP9', 1158, 30_846_580, 248),
  video('720p', 'H.264', 993, 26_455_880, 136),
  video('720p', 'AV1', 660, 17_593_076, 398),
  video('720p', 'VP9', 664, 17_686_717, 247),
  video('480p', 'H.264', 529, 14_103_519, 135),
  video('480p', 'AV1', 370, 9_874_826, 397),
  video('480p', 'VP9', 352, 9_381_481, 244),
  video('360p', 'H.264', 315, 8_390_921, 134),
  video('360p', 'AV1', 213, 5_685_561, 396),
  video('360p', 'VP9', 225, 6_014_765, 243),
  video('240p', 'H.264', 161, 4_310_122, 133),
  video('240p', 'AV1', 116, 3_095_447, 395),
  video('240p', 'VP9', 101, 2_706_929, 242),
  video('144p', 'H.264', 77, 2_058_142, 160),
  video('144p', 'AV1', 56, 1_505_504, 394),
  video('144p', 'VP9', 57, 1_540_844, 278)
];

/** By bitrate, AAC first on a tie, the way AudioFormats sorts them. */
const allAudio: Stream[] = [
  audio('AAC', 129, 3_449_447, 140),
  audio('Opus', 128, 3_433_755, 251),
  audio('Opus', 61, 1_628_559, 250),
  audio('AAC', 48, 1_300_631, 139),
  audio('Opus', 46, 1_231_355, 249)
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
  `~/Downloads/rick-astley-never-gonna-give-you-up-(official-video)-(4k-remaster).${container}`;

/* -------------------------------------------------------------------------- */
/* The playlist                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A public playlist of covers, as ytd's GetPlaylist lists it: the title,
 * and each video's title and length. Sizes are estimates: the 129 kbps AAC
 * stream ytd picks for m4a over each video's length.
 */
export const PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLL8jFEKG82Z7vNDMUamdAcNL4JwGZ8CMG';
export const PLAYLIST_TITLE = 'Never Gonna Give You Up version 1 - 16 Variant';

export type Entry = { title: string; seconds: number; size: number };

const entry = (title: string, m: number, s: number): Entry => ({
  title,
  seconds: m * 60 + s,
  size: Math.round((129_000 * (m * 60 + s)) / 8)
});

export const entries: Entry[] = [
  entry(TITLE, 3, 34),
  entry(
    'Rick Astley - Never Gonna Give You Up | Piano Cover by Pianistmiri 이미리',
    4,
    10
  ),
  entry(
    'Never Gonna Give You Up - Tenor Saxophone Cover - Rick Astley - Mineheart Natividad',
    4,
    6
  ),
  entry(
    'Never Gonna Give You Up - Vintage Soul Rick Astley Cover ft. Clark Beckham - PMJ Rickroll',
    4,
    5
  ),
  entry('Barry Manilow - Never Gonna Give You Up (Official Video)', 2, 51),
  entry('Never Gonna Give You Up on One Guitar (Alex Misko)', 3, 13),
  entry('Never Gonna Give You Up (metal cover by Leo Moracchioli)', 4, 20),
  entry('Rick Astley - Never Gonna Give You Up (Seraphim Metal Cover)', 3, 31),
  entry('RICK ASTLEY - NEVER GONNA GIVE YOU UP (Metal Cover)', 2, 50),
  entry(
    '"Never Gonna Give You Up" - Rick Astley (Reeve Carney + Scary Pockets cover)',
    3,
    17
  ),
  entry('"Never Gonna Give You Up" WILD WEST COVER', 2, 58),
  entry(
    'Never Gonna Give You Up - Amazing Musical Virtuoso Gunhild Carling Plays Bagpipes, Trumpet & more',
    3,
    51
  ),
  entry('Never... - viola cover', 2, 26),
  entry(
    'The Chefs Choir Sing "Never Gonna Give You Up" - Red Nose Day 2011 - BBC Comic Relief Night',
    3,
    0
  ),
  entry(
    'Rick Astley & Foo Fighters - Never Gonna Give You Up (Live) (O2, London)',
    6,
    9
  ),
  entry(
    'Rick Astley - "Never Gonna Give You Up" (Cover by The Animal In Me)',
    4,
    2
  )
];

/** pickEntries: "%*d  %7s  %s", the width of the largest position. */
const w = String(entries.length).length;
export const entryRow = (e: Entry, i: number) =>
  `${right(String(i + 1), w)}  ${right(clockOf(e.seconds), 7)}  ${e.title}`;
export const entryHeader = `${right('#', w)}  ${right('LENGTH', 7)}  TITLE`;

/** ui.Clock, for an entry's length. */
function clockOf(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, '0')}`;
}

/** downloader.Name for the playlist: the slugified title, under ~/Downloads. */
export const playlistDir =
  '~/Downloads/never-gonna-give-you-up-version-1-16-variant';

/** cmd.truncate: an entry's title in its progress label, cut to 60 runes. */
export const shortTitle = (title: string, n = 60) => {
  const r = [...title];
  return r.length <= n
    ? title
    : `${r
        .slice(0, n - 1)
        .join('')
        .trim()}…`;
};
