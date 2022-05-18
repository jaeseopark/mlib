import os
from typing import Union

from moviepy.config import get_setting as get_moviepy_setting
from moviepy.tools import subprocess_call


def trim(path: str, start: Union[str, int, float], end: Union[str, int, float]):
    assert start or end  # at least one is needed
    assert os.path.exists(path)

    _, ext = os.path.splitext(path)
    tmp_path = path + ext

    base_cmd = [get_moviepy_setting("FFMPEG_BINARY"), "-y", "-i", path]
    output_cmd = ["-c", "copy", tmp_path]

    trim_cmd = []
    if start:
        trim_cmd += ["-ss", f"{start}"]
    if end:
        trim_cmd += ["-to", f"{end}"]

    subprocess_call(base_cmd + trim_cmd + output_cmd)
    os.rename(tmp_path, path)
