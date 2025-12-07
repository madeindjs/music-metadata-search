import { search } from "./lib.mjs";

const tracks = search("/home/alexandre/Musique/", {
  // Filter artist of the track using `LIKE` operator
  artist: "Daft",
  // Extensions of Audio files to scan
  ext: [".flac"],
  // Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)
  logLevel: "debug",
  // Filter by title of the track to search using `LIKE` operator
  title: "One",
});
for await (const track of tracks) {
  console.log(track);
}

/*
  {
    path: '/home/alexandre/Musique/Daft Punk/2007-12-04 -  Alive 2007/08 One More Time _ Aerodynamic.flac',
    title: 'One More Time / Aerodynamic',
    genre: 'Electronic',
    artist: 'Daft Punk',
    album: 'Alive 2007',
    year: 2007
  }
  {
    path: '/home/alexandre/Musique/Daft Punk/2001-03-13 -  Discovery/01 One More Time.flac',
    title: 'One More Time',
    genre: 'House',
    artist: 'Daft Punk',
    album: 'Discovery',
    year: 2001
  }
*/
