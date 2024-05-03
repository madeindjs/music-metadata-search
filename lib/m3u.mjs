/**
 * @typedef {typeof import('./search.mjs').search} SearchFn
 * @param {Awaited<ReturnType<SearchFn>>} tracks
 */
export function generateM3uPlaylist(tracks, title = "Playlist") {
  const rows = ["#EXTM3U", `#PLAYLIST:${title}`, ""];
  for (const track of tracks) rows.push(`#EXTINF:0,${track.artist} - ${track.title}`, track.path, "");
  return rows.join("\n");
}
