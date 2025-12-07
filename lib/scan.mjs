import { parseFile } from "music-metadata";
import { logger } from "./logger.mjs";
import { walkDir } from "./walk.mjs";

/**
 * @typedef TrackScanned
 * @property {string} path
 */

/**
 * @typedef Options
 * @property {string[]} ext Extensions of Audio files to load
 *
 * @param {string} path
 * @param {Options} opts
 * @returns {AsyncGenerator<import('../type.ts').Track>}
 */
export async function* scanAudioFiles(path, opts) {
  for await (const file of walkDir(path, { ext: opts.ext })) {
    logger.debug(`[insertTags] parsing  ${file}`);
    /** @type {import("music-metadata").IAudioMetadata} */
    try {
      const tags = await parseFile(file);

      yield {
        genre: tags.common.genre?.join(",") ?? "",
        path: file,
        album: tags.common.album,
        artist: tags.common.artist,
        title: tags.common.title,
        year: tags.common.year || undefined,
        bpm: tags.common.bpm || undefined,
        duration: tags.format.duration,
        bitrate: tags.format.bitrate,
        sampleRate: tags.format.sampleRate,
        musicbrainzArtistId: tags.common.musicbrainz_artistid?.join(","),
        musicbrainzTrackId: tags.common.musicbrainz_trackid,
        musicbrainzRecordingId: tags.common.musicbrainz_recordingid,
        musicbrainzAlbumId: tags.common.musicbrainz_albumid,
        comment: tags.common.comment?.at(0)?.text,
      };
    } catch (err) {
      logger.error(err, "[insertTags] could not parse metadata");
      return;
    }
  }
}
