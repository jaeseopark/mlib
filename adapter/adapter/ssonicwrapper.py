import re
from dataclasses import dataclass, field
from typing import Iterator, Union

import requests
from commmons import head, merge, get
from pydash import url

DEFAULT_HOST = "http://server:4533"
DELETE_ME_PLAYLIST_NAME = "DELETE ME"
MEDIA_FILE_KEYS = (
    "id", "path", "title", "album", "artist", "artist_id", "album_artist", "album_id", "has_cover_art", "track_number",
    "disc_number", "year", "size", "suffix", "duration", "bit_rate", "genre", "compilation", "created_at", "updated_at",
    "full_text", "album_artist_id", "order_album_name", "order_album_artist_name", "order_artist_name",
    "sort_album_name", "sort_artist_name", "sort_album_artist_name", "sort_title", "disc_subtitle", "mbz_track_id",
    "mbz_album_id", "mbz_artist_id", "mbz_album_artist_id", "mbz_album_type", "mbz_album_comment", "catalog_num",
    "comment", "lyrics", "bpm", "channels", "order_title"
)


@dataclass
class SSonicCli:
    api_version: str
    u: str  # username
    p: str = field(default=None)  # password
    s: str = field(default=None)  # salt
    t: str = field(default=None)  # token
    host_override: str = field(default=None)

    def __post_init__(self):
        assert self.api_version  # api version is non-blank

        assert self.u  # username is always expected
        assert self.p or (self.s and self.t)  # password or (salt&token)

        if self.host_override:
            assert re.match(".*://.*", self.host_override)

    @property
    def params(self):
        return dict(
            u=self.u,
            p=self.p,
            s=self.s,
            t=self.t,
            v=self.api_version,
            c="adapter",
            f="json"
        )

    def _get_url(self, subpath: str):
        host = self.host_override or DEFAULT_HOST
        return url(host, "rest", subpath)

    def get_all_artists(self) -> Iterator[dict]:
        r = requests.get(self._get_url("getArtists"), params=self.params)
        if not r.ok:
            raise RuntimeError(r.text)
        indices = r.json().get("subsonic-response", dict()).get("artists", dict()).get("index", list())
        yield from iter([index.get("artist")[0] for index in indices])
        # TOOD: should use [0] here?

    def get_albums_by_artist_id(self, artist_id: str) -> Iterator[dict]:
        r = requests.get(self._get_url("getArtist"), params=merge(self.params, dict(id=artist_id)))
        if not r.ok:
            raise RuntimeError(r.text)
        yield from iter(get(r.json(), ["subsonic-response", "artist", "album"]))

    def get_songs_by_album_id(self, album_id: str) -> Iterator[dict]:
        r = requests.get(self._get_url("getAlbum"), params=merge(self.params, dict(id=album_id)))
        if not r.ok:
            raise RuntimeError(r.text)
        yield from iter(get(r.json(), ["subsonic-response", "album", "song"]))

    def get_all_songs(self) -> Iterator[dict]:
        artists = self.get_all_artists()
        for artist in artists:
            albums = self.get_albums_by_artist_id(artist.get("id"))
            for album in albums:
                album_id = album.get("id")
                yield from self.get_songs_by_album_id(album_id)

    def get_now_playing(self) -> dict:
        r = requests.get(self._get_url("getNowPlaying"), params=self.params)
        if not r.ok:
            raise RuntimeError(r.text)
        return head(get(r.json(), ["subsonic-response", "nowPlaying", "entry"]))

    def stop_playing(self) -> None:
        r = requests.get(self._get_url("jukeboxControl"), params=merge(self.params, dict(action="stop")))
        if not r.ok:
            raise RuntimeError(r.text)

    def get_playlist_by_name(self, name: str) -> dict:
        raise NotImplementedError

    def add_to_playlist(self, playlist: Union[str, dict], song: Union[str, dict]):
        song_id = song
        if isinstance(song, dict):
            song_id = song["id"]

        playlist_id = playlist
        if isinstance(playlist, dict):
            playlist_id = playlist["id"]

        raise NotImplementedError

    def add_to_delete_me_playlist(self, song: Union[str, dict]) -> None:
        l = self.get_playlist_by_name(DELETE_ME_PLAYLIST_NAME)
        self.add_to_playlist(l, song)
        raise NotImplementedError
