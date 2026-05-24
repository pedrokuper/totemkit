import { useRef, useEffect, useState } from "react";
import Axios from "axios";
const WIDTH = 640;
const HEIGHT = 480;
const RECORDING_TIME_MS = 5000;
const MIME_TYPE = "video/webm";
const VIDEO_BITS_PER_SECOND = 6000 * 1000; // 6 Mbps

function Video() {
  const [savedVideo, setSavedVideo] = useState(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  let recorder = null;

  function handleWebcam() {
    videoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", audio: false } })
      .then((stream) => {
        console.log("Camera stream obtained:", stream);
        videoRef.current.srcObject = stream;
        recorder = new MediaRecorder(stream, {
          mimeType: MIME_TYPE,
          videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
        });

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: MIME_TYPE });
          const videoURL = URL.createObjectURL(blob);
          URL.revokeObjectURL(savedVideo);
          const base64Video = await blobToBase64(blob);
          await Axios.post("http://localhost:8080/api/videos", {
            base64Video,
          });

          setSavedVideo(videoURL);
          chunksRef.current = [];
        };
        recorder.ondataavailable = (e) => {
          console.log(e.data, "ondataavailable");
          chunksRef.current.push(e.data);
        };
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }

  function handleRecordVideo() {
    recorder.start();
    console.log(recorder.state);
    console.log("record started");
  }

  function handleStopRecording() {
    recorder.stop();
    console.log(recorder.state);
    console.log("recorder stopped");
    console.log({ savedVideo });
    console.log({ chunks: chunksRef.current });
  }

  function blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    console.log({ reader });
    return new Promise((resolve) => {
      reader.onloadend = () => {
        console.log("reader.result", reader.result);
        resolve(reader.result);
      };
    });
  }

  return (
    <div>
      <h1>Video</h1>
      <button onClick={handleWebcam}>Open WebCam</button>
      <button onClick={handleRecordVideo}>Start recording</button>
      <button onClick={handleStopRecording}>Stop Recording </button>
      <video ref={videoRef} id="webcam" autoPlay playsInline width={WIDTH} height={HEIGHT}></video>
      <canvas width={WIDTH} height={HEIGHT} ref={canvasRef}></canvas>

      {savedVideo && (
        <video
          id="saved-video"
          autoPlay
          playsInline
          width={WIDTH}
          height={HEIGHT}
          src={savedVideo}
        ></video>
      )}
    </div>
  );
}
export default Video;
