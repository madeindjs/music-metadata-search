import { search } from "./lib.mjs";

const tracks = await search("/home/alexandre/Musique", {
  album: "Discovery",
  artist: "Daft",
  cacheScanTtl: 3_600,
  ext: [".flac"],
  genre: "French touch",
  logLevel: "silent",
  sort: "title desc",
  title: "ery",
  year: 2001,
  where: 'title LIKE "%ery"',
});
