import { DEFAULT_AUDIO_EXT } from "./constants.mjs";
import { logger } from "./logger.mjs";
import { scanAudioFiles } from "./scan.mjs";

/** @import {Range, SearchOptions} from '../type.d.ts' */

/**
 * @param {string} path
 * @param {SearchOptions} opts
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
