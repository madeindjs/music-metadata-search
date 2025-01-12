# Music Metadata Search

[![npm version](https://badge.fury.io/js/music-metadata-search.svg)](https://badge.fury.io/js/music-metadata-search)

Search in your local music library using quick filter on metadata tags.

My main usage is to find musics I want to play and pipe it to [mpv](https://mpv.io/) but it can be used for different purposes (see "usage").

```sh
music-metadata-search ~/music --where "genre like '%sport%'" | mpv --playlist=-
```

It will:

- walk in the given directory and parse metadata using [`music-metadata`](https://github.com/borewit/music-metadata)
- Cache metadata inside a [SQlite](https://www.sqlite.org/) database using [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- do a SQL query to filters results
- pipe results

My main objective is to have a CLI tool fast & convenient, for myself. It takes 45s for my library of 150go (5406 files), and then less than 1s using the cache.

## Install

```sh
npm i music-metadata-search
```

## CLI usage

Generate list of filepath matching where the genre contains "French":

```sh
music-metadata-search ~/music/ -g 'French'
```

Or you can pipe to [mpv](https://mpv.io/) to play them. Example playlist my new Rock songs:

```sh
music-metadata-search ~/music/ -g 'rock' -s "mtime DESC" | mpv --playlist=-
```

Or you can export an old school French Touch playlist as `.m3u` file:

```sh
music-metadata-search ~/music/ -g 'French' --where 'year BETWEEN 2000 AND 2005' -f m3u > french-touch.m3u
```

Or getting the "Daft Punks albums before 2000" using JSON output and [jq](https://jqlang.github.io/jq/)

```sh
music-metadata-search ~/music/ -a 'daft' --where 'year < 2000' -f json | jq '[.[].album] | unique'
```

Use `music-metadata-search --help` for more information.

```
Usage: music-metadata-search [options] [path]

Search in your local music library using quick filters on metadata tags

Arguments:
  path                             The directory of local files (default: "/home/alexandre/github/madeindjs/music-metadata-search")

Options:
  -V, --version                    output the version number
  -q, --query [genre]              Search the term everywhere (in album, artist, title, genre, comment)
  -w, --where [where]              SQL WHERE expression
                                   You can filters on columns: album, artist, title, genre, comment, year, mtime, bpm, bitrate, duration
                                   Example: `genre LIKE "%Rock%"` AND duration between 60 AND 120
  -g, --genre [genre]              Filter by genre of the track using `LIKE` operator
                                   It's an alias of: `--where 'genre LIKE "%Electro%"'`
  -a, --artist [artist]            Filter by artist of the track using `LIKE` operator
                                   It's an alias of: `--where 'artist LIKE "%Daft%"'`
  -b, --album [album]              Filter by album of the track using `LIKE` operator
                                   It's an alias of: `--where 'album LIKE "%Discovery%"'`
  -y, --year [year]                Filter by year of the track
                                   If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator
  -t, --title [title]              Title of the track to search using `LIKE` operator
                                   It's an alias of: `--where 'title LIKE "%Verdis%"'`
  -c, --comment [comment]          Comment of the track to search using `LIKE` operator
                                   It's an alias of: `--where 'comment LIKE "%Verdis%"'`
  -d,--duration [duration]         Filter by duration of the track (in seconds)
                                   If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator
  --bpm [bpm]                      Filter by BPM of the track
                                   If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator
  --bitrate [bitrate]              Filter by bitrate of the track (in bits/seconds)
                                   If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator
  -l, --limit [limit]              Limit the number of tracks returned
  -s, --sort [order]               SQL ORDER BY expression
                                   You can order on columns: album, artist, title, genre, comment, year, mtime, bpm, bitrate, duration.
                                   Example: `genre DESC`
  -f, --format [format]            Output format (choices: "txt", "json", "m3u", default: "txt")
  --ext [ext...]                   Extensions of Audio files to scan (default: [".mp3",".flac",".m4a",".ogg",".aac"])
  --log-level [logLevel]           Log level (choices: "trace", "debug", "info", "warn", "error", "fatal", default: "fatal")
  --cache-scan-ttl [cacheScanTtl]  time to live for the cache (in seconds) (default: 1 hour)
  -h, --help                       display help for command
```

## Lib usage

```js
import { search } from "music-metadata-search";

const tracks = await search("/home/alexandre/Musique/", {
  // Filter artist of the track using `LIKE` operator
  artist: "Daft",
  // Extensions of Audio files to scan
  ext: [".flac"],
  // Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)
  logLevel: "debug",
  // SQL ORDER BY expression
  sort: "title desc",
  // Filter by title of the track to search using `LIKE` operator
  title: "One",
  // Limit the number of tracks returned
  limit: 10,
});

console.log(tracks);
/*
[
  {
    path: '/home/alexandre/Musique/Daft Punk/2007-12-04 -  Alive 2007/08 One More Time _ Aerodynamic.flac',
    title: 'One More Time / Aerodynamic',
    genre: 'Electronic',
    artist: 'Daft Punk',
    album: 'Alive 2007',
    year: 2007,
    comment: '#classic'
  },
  {
    path: '/home/alexandre/Musique/Daft Punk/2001-03-13 -  Discovery/01 One More Time.flac',
    title: 'One More Time',
    genre: 'House',
    artist: 'Daft Punk',
    album: 'Discovery',
    year: 2001,
    comment: '#classic #nrj'
  }
]
*/
```
