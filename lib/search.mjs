import { DEFAULT_AUDIO_EXT } from "./constants.mjs";
import { logger } from "./logger.mjs";
import { scanAudioFiles } from "./scan.mjs";

/**
 * @typedef {[from: number, to: number]} Range
 *
 * @typedef Options
 * @property {string} [album] Filter album of the track using `LIKE` operator
 * @property {string} [artist] Filter artist of the track using `LIKE` operator
 * @property {string} [genre] Filter genre of the track using `LIKE` operator
 * @property {string} [comment] Filter comment of the track using `LIKE` operator
 * @property {string} [title] Filter by title of the track to search using `LIKE` operator
 * @property {string} [musicbrainzTrackId]
 * @property {string} [musicbrainzAlbumId]
 * @property {string} [musicbrainzArtistId]
 * @property {string} [musicbrainzRecordingId]
 * @property {number | Range} [bpm] Filter by BPM of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [year] Filter by year of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [bitrate] Filter by bitrate (in bits/seconds) of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [sampleRate] Filter by sample rate (in Hz) of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [duration] Filter by duration of the track (in seconds), using `=` operator or `BETWEEN` if a range is given
 *
 * @property {string} [query] Search the term everywhere
 *
 * @property {string[]} [ext] Extensions of Audio files to scan
 * @property {number} [limit] Limit the number of tracks returned
 * @property {string} [logLevel] Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function* search(path, opts = {}) {
  logger.level = opts.logLevel ?? "silent";
  const scan = scanAudioFiles(path, {
    ext: opts.ext ?? [...DEFAULT_AUDIO_EXT],
  });

  /**
   * @param {string | undefined} text
   * @param {string} query
   */
  function matchString(text, query) {
    return text?.toLowerCase().includes(query.toLowerCase());
  }
  /**
   * @param {number | undefined} number
   * @param {number | Range} query
   */
  function matchNumber(number, query) {
    if (number === undefined) return false;
    if (Array.isArray(query)) {
      return number >= query[0] && number <= query[1];
    } else {
      query === number;
    }
  }

  for await (const track of scan) {
    if (opts.artist && !matchString(track.artist, opts.artist)) continue;
    if (opts.album && !matchString(track.album, opts.album)) continue;
    if (opts.title && !matchString(track.title, opts.title)) continue;
    if (opts.genre && !matchString(track.genre, opts.genre)) continue;
    if (opts.comment && !matchString(track.comment, opts.comment)) continue;

    if (opts.year && !matchNumber(track.year, opts.year)) continue;
    if (opts.duration && !matchNumber(track.duration, opts.duration)) continue;
    if (opts.bpm && !matchNumber(track.bpm, opts.bpm)) continue;
    if (opts.sampleRate && !matchNumber(track.sampleRate, opts.sampleRate))
      continue;

    if (
      opts.musicbrainzAlbumId &&
      !matchString(track.musicbrainzAlbumId, opts.musicbrainzAlbumId)
    )
      continue;
    if (
      opts.musicbrainzArtistId &&
      !matchString(track.musicbrainzArtistId, opts.musicbrainzArtistId)
    )
      continue;
    if (
      opts.musicbrainzRecordingId &&
      !matchString(track.musicbrainzRecordingId, opts.musicbrainzRecordingId)
    )
      continue;
    if (
      opts.musicbrainzTrackId &&
      !matchString(track.musicbrainzTrackId, opts.musicbrainzTrackId)
    )
      continue;

    if (
      opts.query &&
      !(
        matchString(track.album, opts.album) ||
        matchString(track.artist, opts.artist) ||
        matchString(track.title, opts.title) ||
        matchString(track.genre, opts.genre)
      )
    )
      continue;

    yield track;
  }

  return;
}
