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
  Select,
  Center,
} from "@chakra-ui/react";

import "./App.css";

type AudioFormat = "m4a" | "mp3";
const YOUTUBE_AUDIO_FORMATS: Map<AudioFormat, string> = new Map([
  ["m4a", "140"],
]);

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
  const [audioFormat] = useState<AudioFormat>("m4a");

  // This line assumes that the browser does not have access to the local filesystem
  // and assumes any path string with the protocol deliiter to be a remote path.
  const isRemotePath = path.includes("://");

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
      options = `-f ${YOUTUBE_AUDIO_FORMATS.get(audioFormat)}`;
    } else if (path.includes("soundcloud")) {
      options = `-x --audio-format ${audioFormat}`;
    }
    if (ffmpegTrimArgs) {
      options += ` --postprocessor-args "${ffmpegTrimArgs}"`;
    }
    return `youtube-dl ${options} --add-metadata ${path}`;
  }, [path, ffmpegTrimArgs, audioFormat]);

  const ffmpegCmd = useMemo(() => {
    if (!path || !path.includes(".") || !ffmpegTrimArgs) return "";

    const splitPath = path.split(".");
    const ext = splitPath.pop();
    const parent = splitPath.join(".");

    return `ffmpeg -i "${path}" ${ffmpegTrimArgs} -c copy "${parent}-trim.${ext}"`;
  }, [path, ffmpegTrimArgs]);

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
          <Tr>
            <Td>Format</Td>
            <Td>
              <Select>
                <option>m4a</option>
              </Select>
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
          <CopiableTextArea
            label="Command"
            value={isRemotePath ? ytdlCmd : ffmpegCmd}
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
    <Center>
      <App />
    </Center>
  </ChakraProvider>
);

export default WrappedApp;
