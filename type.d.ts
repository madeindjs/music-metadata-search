export interface Track {
  path: string;
  title?: string;
  genre?: string;
  artist?: string;
  album?: string;
  year?: number;
  bitrate?: number;
  sampleRate?: number;
  bpm?: number;
  duration?: number;
  musicbrainzArtistId?: string;
  musicbrainzTrackId?: string;
  musicbrainzAlbumId?: string;
  musicbrainzRecordingId?: string;
  comment?: string;
  mtime?: number;
}

export type Range = [number, number];

export interface SearchOptions {
  /** Filter album of the track using `LIKE` operator*/
  album?: string;
  /** Filter artist of the track using `LIKE` operator*/
  artist?: string;
  /** Filter genre of the track using `LIKE` operator*/
  genre?: string;
  /** Filter comment of the track using `LIKE` operator*/
  comment?: string;
  /** Filter by title of the track to search using `LIKE` operator*/
  title?: string;
  musicbrainzTrackId?: string;
  musicbrainzAlbumId?: string;
  musicbrainzArtistId?: string;
  musicbrainzRecordingId?: string;
  /** Filter by BPM of the track using `=` operator or `BETWEEN` if a range is given*/
  bpm?: number | Range;
  /** Filter by year of the track using `=` operator or `BETWEEN` if a range is given*/
  year?: number | Range;
  /** Filter by bitrate (in bits/seconds) of the track using `=` operator or `BETWEEN` if a range is given*/
  bitrate?: number | Range;
  /** Filter by sample rate (in Hz) of the track using `=` operator or `BETWEEN` if a range is given*/
  sampleRate?: number | Range;
  /** Filter by duration of the track (in seconds), using `=` operator or `BETWEEN` if a range is given*/
  duration?: number | Range;
  /** Search the term everywhere*/
  query?: string;
  /** Extensions of Audio files to scan*/
  ext?: string[];
  /** Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)*/
  logLevel?: string;
}

declare module "music-metadata-search" {
  export function search(
    path: string,
    opts: SearchOptions,
  ): AsyncGenerator<Track>;
}
