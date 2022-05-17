import logging
import os

from commmons import init_logger_with_handlers
from flask import Flask, request

from adapter.ffmpegwrapper import trim
from adapter.ssonicwrapper import SSonicCli

app = Flask(__name__)

LOGGER = init_logger_with_handlers("mlib-adapter", logging.DEBUG, "/var/log/mlib/adapter.log")


def get_ssonic_client() -> SSonicCli:
    api_version = os.getenv("API_VERSION")
    auth_params = {key: request.args.get(key) for key in ("u", "s", "t", "p")}
    return SSonicCli(api_version=api_version, **auth_params)


@app.route("/songs/now_playing")
def get_now_playing():
    song = get_ssonic_client().get_now_playing()
    if song is None:
        return "", 204
    return song, 200


@app.route("/songs/now_playing/trim")
def trim_now_playing():
    client = get_ssonic_client()
    payload = request.json

    if "start" not in payload and "end" not in payload:
        return "'start' and/or 'end' are expected", 400

    # TODO: move the logic to the service layer if the file gets big
    song = client.get_now_playing()

    if not song:
        return "Nothing is being played at the moment", 409

    try:
        client.stop_playing()
    except RuntimeError:
        # Example: "RuntimeError: This endpoint is not implemented, but may be in future releases"
        LOGGER.exception("")
        # client.add_to_delete_me_playlist(song) # TODO

    trim(path=os.path.join("/data", song["path"]), start=payload["start"], end=payload["end"])
    return "", 200


if __name__ == '__main__':
    # This block is only for the dev env.
    app.run(host="0.0.0.0")
