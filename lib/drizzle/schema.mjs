import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Tracks = sqliteTable("tracks", {
  id: int("id").primaryKey(),
  path: text("path").notNull(),
  title: text("title"),
  genre: text("genre").notNull(),
  artist: text("artist"),
  album: text("album"),
  year: int("year"),
  bpm: int("bpm"),
  duration: int("duration"),
  bitrate: int("bitrate"),
  sampleRate: int("sampleRate"),
  mtime: int("mtime").notNull().default(0),
  musicbrainzArtistId: text("musicbrainzArtistId"),
  musicbrainzTrackId: text("musicbrainzTrackId"),
  musicbrainzAlbumId: text("musicbrainzAlbumId"),
  comment: text("comment"),
  createdAt: int("createdAt")
    .notNull()
    .$defaultFn(() => Math.floor(new Date().getTime() / 1000)),
});

export const Scans = sqliteTable("scans", {
  id: int("id").primaryKey(),
  path: text("path")
    .notNull()
    .$default(() => ""),
  ext: text("ext").notNull(),
  createdAt: int("createdAt")
    .notNull()
    .$defaultFn(() => Math.floor(new Date().getTime() / 1000)),
});

export const ScansTracks = sqliteTable("scan_tracks", {
  id: int("id").primaryKey(),
  scanId: int("scanId").references(() => Scans.id, { onDelete: "cascade" }),
  trackId: int("trackId").references(() => Tracks.id, { onDelete: "cascade" }),
  createdAt: int("createdAt")
    .notNull()
    .$defaultFn(() => Math.floor(new Date().getTime() / 1000)),
});
