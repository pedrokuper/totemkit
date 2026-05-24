import { useRef, useState, useCallback } from "react";
import Axios from "axios";
const WIDTH = 640;
const HEIGHT = 480;
const RECORDING_TIME_MS = 5000;
const MIME_TYPE = "video/webm";
const VIDEO_BITS_PER_SECOND = 6000 * 1000;

export default function Video() {
  const [savedVideo, setSavedVideo] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const handleWebcam = useCallback(() => {
    cleanup();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        recorderRef.current = new MediaRecorder(stream, {
          mimeType: MIME_TYPE,
          videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
        });

        recorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: MIME_TYPE });
          const videoURL = URL.createObjectURL(blob);
          if (savedVideo) URL.revokeObjectURL(savedVideo);
          const base64Video = await blobToBase64(blob);
          await Axios.post("http://localhost:8080/api/videos", {
            base64Video,
          });
          setSavedVideo(videoURL);
          chunksRef.current = [];
          setIsRecording(false);
        };

        recorderRef.current.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        setCameraActive(false);
      });
  }, [cleanup, savedVideo]);

  const handleRecordVideo = useCallback(() => {
    if (!recorderRef.current || !cameraActive) return;

    let count = 3;
    setCountdown(count);

    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count === 0) {
        setCountdown("GO!");
        clearInterval(countdownIntervalRef.current);

        setTimeout(() => {
          setCountdown(null);
          setProgress(0);
          setIsRecording(true);
          recorderRef.current.start();

          const startTime = Date.now();
          progressIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const percent = Math.min((elapsed / RECORDING_TIME_MS) * 100, 100);
            setProgress(percent);
          }, 50);

          timeoutRef.current = setTimeout(() => {
            if (recorderRef.current?.state === "recording") {
              clearInterval(progressIntervalRef.current);
              setProgress(0);
              recorderRef.current.stop();
            }
          }, RECORDING_TIME_MS);
        }, 500);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [cameraActive]);

  const handleStopRecording = useCallback(() => {
    cleanup();
    setProgress(0);
    setCountdown(null);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }, [cleanup]);

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
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Video Recorder</h1>
          <p className="text-neutral-400">Capture moments with your camera</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <button
            onClick={handleWebcam}
            disabled={cameraActive}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              cameraActive
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-white text-neutral-900 hover:bg-neutral-200 active:scale-95"
            }`}
          >
            {cameraActive ? "Camera Active" : "Open Camera"}
          </button>

          <button
            onClick={handleRecordVideo}
            disabled={!cameraActive || isRecording || countdown !== null}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              !cameraActive || isRecording || countdown !== null
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600 active:scale-95"
            }`}
          >
            Start Recording
          </button>

          <button
            onClick={handleStopRecording}
            disabled={!isRecording && countdown === null}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              !isRecording && countdown === null
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-700 text-white hover:bg-neutral-600 active:scale-95"
            }`}
          >
            Stop Recording
          </button>
        </div>

        {/* Main Video Container */}
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl mb-8">
          {/* Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={WIDTH}
            height={HEIGHT}
            className="w-full aspect-video object-cover bg-neutral-800"
          />

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium">REC</span>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div
                className={`text-8xl font-black transition-all duration-300 ${
                  countdown === "GO!" ? "text-green-400 scale-110 animate-pulse" : "text-white"
                }`}
                style={{
                  textShadow:
                    countdown === "GO!"
                      ? "0 0 60px rgba(74, 222, 128, 0.5)"
                      : "0 0 40px rgba(255, 255, 255, 0.3)",
                }}
              >
                {countdown}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-neutral-800/80">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Camera Placeholder */}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
              <svg
                className="w-16 h-16 text-neutral-700 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-neutral-500">Click "Open Camera" to start</p>
            </div>
          )}
        </div>

        {/* Saved Video */}
        {savedVideo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-neutral-800"></div>
              <span className="text-neutral-500 text-sm font-medium px-3">Recorded Video</span>
              <div className="h-px flex-1 bg-neutral-800"></div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-neutral-900 shadow-xl">
              <video
                loop
                autoPlay
                playsInline
                muted
                width={WIDTH}
                height={HEIGHT}
                src={savedVideo}
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
