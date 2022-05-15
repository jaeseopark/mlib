import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Table,
  Tbody,
  Tr,
  Td,
  Textarea,
  Button,
  ChakraProvider,
  Input,
} from "@chakra-ui/react";

import "./App.css";

const CopyButton = ({
  data,
  disabled,
}: {
  data: string;
  disabled?: boolean;
}) => {
  const [cls, setCls] = useState("");
  return (
    <Button
      className={cls}
      disabled={disabled}
      onClick={() => {
        navigator.clipboard.writeText(data);
        setCls("copied");
        setTimeout(() => setCls(""), 750);
      }}
    >
      Copy
    </Button>
  );
};

const CopiableTextArea = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Tr>
    <Td>{label}</Td>
    <Td>
      <Textarea disabled={!value} value={value} />
    </Td>
    <Td>
      <CopyButton disabled={!value} data={value} />
    </Td>
  </Tr>
);

const DurationInputRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (n: string) => void;
}) => (
  <Tr>
    <Td>{label}</Td>
    <Td>
      <Input onChange={(e) => onChange(e.target.value)} value={value} />
    </Td>
  </Tr>
);

function App() {
  const [path, setPath] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const [firstFile] = acceptedFiles;
    setPath(firstFile.name);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const ffmpegTrimArgs = useMemo(() => {
    let args = "";
    if (startTime) {
      args += `-ss ${startTime}`;
    }
    if (endTime) {
      args += ` -to ${endTime}`;
    }
    return args;
  }, [startTime, endTime]);

  const ytdlCmd = useMemo(() => {
    if (!path) return "";

    let options = "";
    if (path.includes("youtube")) {
      options = "-f 140";
    } else if (path.includes("soundcloud")) {
      options = "-x --audio-format m4a";
    }
    return `youtube-dl ${options} --add-metadata ${path}`;
  }, [path]);

  const ffmpegCmd = useMemo(() => {
    if (!path || !path.includes(".") || !ffmpegTrimArgs) return "";

    const splitPath = path.split(".");
    const ext = splitPath.pop();
    const parent = splitPath.join(".");

    return `ffmpeg -i "${path}" ${ffmpegTrimArgs} -c copy "${parent}-trim.${ext}"`;
  }, [ffmpegTrimArgs, path]);

  const singleCmd = useMemo(() => {
    if (!ffmpegTrimArgs || !path) {
      return ytdlCmd;
    }

    let options = "";
    if (path.includes("youtube")) {
      options = "-f 140";
    }

    return `youtube-dl ${options} --youtube-skip-dash-manifest -g ${path} | ffmpeg -i pipe: ${ffmpegTrimArgs} -c copy FILENAME`;
  }, [ffmpegTrimArgs, path, ytdlCmd]);

  const reset = () => {
    setPath("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="App">
      <Table>
        <Tbody>
          <Tr>
            <Td>URL or Local Path</Td>
            <Td>
              <Textarea
                onChange={(e) => setPath(e.target.value)}
                value={path}
              />
              <Button
                {...getRootProps()}
                height="3em"
                width="100%"
                marginTop="1em"
                backgroundColor="var(--chakra-colors-blackAlpha-50)"
              >
                <input {...getInputProps()} />
                Browse
              </Button>
            </Td>
          </Tr>
          <DurationInputRow
            label="Start Time"
            onChange={setStartTime}
            value={startTime}
          />
          <DurationInputRow
            label="End Time"
            onChange={setEndTime}
            value={endTime}
          />
          <CopiableTextArea label="youtube-dl" value={ytdlCmd} />
          <CopiableTextArea label="ffmpeg" value={ffmpegCmd} />
          <CopiableTextArea
            label="One-liner (Experimental)"
            value={singleCmd}
          />
        </Tbody>
      </Table>
      <Button marginTop="1em" width="100%" onClick={reset}>
        Reset
      </Button>
    </div>
  );
}

const WrappedApp = () => (
  <ChakraProvider>
    <App />
  </ChakraProvider>
);

export default WrappedApp;
