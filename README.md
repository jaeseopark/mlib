# mlib

A suite of applications to automate the management of one's music library.

Applications used in the stack:

* [Navdrome](https://www.navidrome.org/)
  * Thiss can be replaced with any Subsonic-compatible server.
* [MusicBrainz Picard](https://hub.docker.com/r/mikenye/picard)
* [youtube-dl](https://youtube-dl.org/)

## Usage

1. Checkout this repo, fill out `.env`, then run:
    ```bash
    docker-compose up --build -d
    ```
1. Download songs in the adapter panel: http://localhost:4534
1. Enjoy your songs in Navdrome: http://localhost:4533
1. (Optional) If the downloaded files' tags aren't fully populated, use Picard: http://localhost:4535

TODO: production build
