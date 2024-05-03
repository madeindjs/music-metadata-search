import { Tracks } from "./drizzle/schema.mjs";

export const DEFAULT_AUDIO_EXT = Object.freeze([".mp3", ".flac", ".m4a", ".ogg", ".aac"]);

export const QUERYABLE_COLUMNS = Object.freeze([
  Tracks.album.name,
  Tracks.artist.name,
  Tracks.title.name,
  Tracks.genre.name,
]);

export const FILTERABLE_COLUMNS = Object.freeze([...QUERYABLE_COLUMNS, Tracks.year.name, Tracks.mtime.name]);
