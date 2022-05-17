# mlib

A suite of applications to automate the management of one's music library.

Applications used in the stack:

* [Navidrome](https://www.navidrome.org/)
  * This can be replaced with any Subsonic-compatible server.
* [MusicBrainz Picard](https://hub.docker.com/r/mikenye/picard)
* [youtube-dl](https://youtube-dl.org/)

## Usage

### One-time Setup

1. Checkout this repo, then run:
    ```bash
    cp .env.sample .env
    docker-compose up --build -d
    ```
1. Log into Navidrome and create a user account: http://localhost:4533
1. Take down the stack by running:
    ```bash
    docker-compose down -v
    ```
1. Open `.env` and enter the user credentials.
1. Fire up docker-compose again. 

TODO: production build

### Next Steps

1. Download songs in the adapter panel: http://localhost:4534
1. Enjoy the music in Navidrome: http://localhost:4533
1. (Optional) If the downloaded files' tags aren't fully populated, try Picard: http://localhost:4535
