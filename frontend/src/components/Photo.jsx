import { useRef, useEffect, useState } from "react";
import Axios from "axios";
const WIDTH = 640;
const HEIGHT = 480;
const IMAGE_TYPE = "image/png";
const QUALITY = 0.5;

function Photo() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [image, setImage] = useState(null);

  function handleWebcam() {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", audio: false } })
      .then((stream) => {
        console.log("Camera stream obtained:", stream);
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }

  async function handlePhoto() {
    const w = videoRef.current.width;
    const h = videoRef.current.height;
    const capture = canvasRef.current.getContext("2d").drawImage(videoRef.current, 0, 0, w, h);

    const url = canvasRef.current.toDataURL(IMAGE_TYPE, QUALITY);
    await Axios.post("http://localhost:8080/api/photos", { base64Image: url });
  }

  return (
    <div>
      <h1>Photo</h1>
      <button onClick={handleWebcam}>Open WebCam</button>
      <button onClick={handlePhoto}>Take Photo</button>
      <video ref={videoRef} id="webcam" autoPlay playsInline width={WIDTH} height={HEIGHT}></video>
      <canvas width={WIDTH} height={HEIGHT} ref={canvasRef}></canvas>
    </div>
  );
}
export default Photo;

// const url = canvasRef.current.toBlob(
//       (blob) => {
//         console.log(blob, "blob");
//       },
//       IMAGE_TYPE,
//       QUALITY,
//     );
//     console.log(url, "url");
