# Music finder

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

## Lib usage

```js
import { search } from "music-metadata-search";

const tracks = await search("/home/alexandre/music", {
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
```
