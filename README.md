# mlib

A suite of applications to automate the management of one's music library.

Applications used in the stack:

* [Navidrome](https://www.navidrome.org/)
  * This can be replaced with any Subsonic-compatible server.
* [MusicBrainz Picard](https://hub.docker.com/r/mikenye/picard)
* [youtube-dl](https://youtube-dl.org/)

## Usage

`docker-compose.yml`:

```yml
version: "3"
services:
  ui:
    container_name: mlib-ui
    image: jaeseoparkdocker/mlib-ui:latest
    ports:
      - 4534:80
```

### Next Steps

1. Download songs in the adapter panel: http://localhost:4534
1. Enjoy the music in Navidrome: http://localhost:4533
1. (Optional) If the downloaded files' tags aren't fully populated, try Picard: http://localhost:4535
