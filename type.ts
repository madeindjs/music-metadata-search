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
