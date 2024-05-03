# Music finder

[![npm version](https://badge.fury.io/js/music-metadata-search.svg)](https://badge.fury.io/js/music-metadata-search)

Search in your local music library using quick filter on metadata tags.

My main usage is to find musics I want to play and pipe it to [mpv](https://mpv.io/).

```sh
music-metadata-search search ~/Musique --where "genre like '%sport%'" | mpv --playlist=-
```

It will:

- walk in the given directory and parse metadata using [`music-metadata`](https://github.com/borewit/music-metadata)
- store metadata inside a [SQlite](https://www.sqlite.org/) database using [Drizzle](https://github.com/drizzle-team/drizzle-orm)
- do a SQL query to filters results
- pipe filepath result

## Install

```sh
npm i music-metadata-search
```

## CLI usage

### filter

```txt
Usage: music-metadata-search search [options] [path]

filters tracks by metadata in the given path

Arguments:
  path                    The directory of local files (default: "/home/alexandre/github/madeindjs/music-playlist-generator")

Options:
  -g, --genre [genre]     Genre of the track
                          It's an alias of: --where 'genre LIKE "%Electro%"'
  -a, --artists [artist]  Artist of the track
                          It's an alias of: --where 'artist LIKE "%Daft%"'
  -y, --year [year]       Year of the track
                          It's an alias of: --where 'year = 2024'
  -t, --title [title]     Title of the track
                          It's an alias of: --where 'title LIKE "%Verdis%"'
  -w, --where [where]     SQL WHERE expression
                          You can filters on columns: album, artist, title, genre, year
                          Example: genre LIKE "%Rock%"
  -s, --sort [order]      SQL ORDER BY expression
                          You can order on columns: album, artist, title, genre, year.
                          Example: genre DESC
  -l, --log-level         Log level (choices: "trace", "debug", "info", "warn", "error", "fatal")
  -c, --cache-ttl         time to live for the cache (in seconds)
  -h, --help              display help for command
```

Example

```sh
music-metadata-search filter ~/Musique/ -g 'sport'
```

will output

```txt
/home/alexandre/Musique/French 79/2023-05-20 -  Teenagers/11 Freedom.flac
/home/alexandre/Musique/Gesaffelstein/2019 - Novo Sonic System/01 - Orck.flac
/home/alexandre/Musique/Justice/2016-11-18 -  Woman/06 Chorus.flac
/home/alexandre/Musique/Kanye West/2010-11-22 -  My Beautiful Dark Twisted Fantasy/03 Kanye West - Power.flac
/home/alexandre/Musique/Kavinsky/2022-03-25 -  Reborn/03 Kavinsky - Renegade (feat. Cautious Clay).flac
/home/alexandre/Musique/Marlowe/2018-07-13 -  Marlowe/03 Honest Living.flac
/home/alexandre/Musique/Muddy Monk/2022-04-01 -  Ultra Dramatic Kid/01 Intro.flac
/home/alexandre/Musique/Queen/2011 -  The Ultimate Best Of Queen/15 Don’t Stop Me Now.mp3
/home/alexandre/Musique/Survivor/1985 -  Eye of the Tiger/01 Eye of the Tiger.mp3
/home/alexandre/Musique/Various Artists/2015-08-21 -  .Wave/09 Vanilla - Shutterbugg.mp3
```
