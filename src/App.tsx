import { useEffect, useState } from 'react';
import './App.css';

// const BACKEND_URL = 'http://localhost:8000';
const BACKEND_URL = 'https://b3aa-202-131-143-209.ngrok-free.app';

const App = () => {
  const [cameraStream, setCameraStream] = useState<MediaStream | undefined>(undefined);

  const [shouldClickPhoto, setShouldClickPhoto] = useState(true);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  //

  // getting user camera stream
  const getUserCamera = async () => {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
  };

  // creating video element to preview stream
  const addVideoSrcToEl = (stream: MediaStream) => {
    const vidEl = document.getElementById('video-preview') as HTMLVideoElement | null;
    setVideoEl(vidEl);
    if (!videoEl) return;
    if (videoEl.srcObject) return;
    videoEl.srcObject = stream;
  };

  if (document.body) {
    (async () => {
      const stream = await getUserCamera();
      setCameraStream(stream);
      addVideoSrcToEl(stream);
    })();
  }

  useEffect(() => {
    (async () => {
      const stream = await getUserCamera();
      setCameraStream(stream);
      addVideoSrcToEl(stream);
    })();
  }, []);

  // check when to click photo from the backend by API
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        let resBody = await fetch(BACKEND_URL);

        let response = await resBody.json();

        // console.log('🚀 ~ file: App.tsx:45 ~ response:', response);
        setShouldClickPhoto(response.shouldClickPhoto);
      } catch (error) {
        console.log('🚀 ~ file: App.tsx:49 ~ error:', error);
      }
    }, 500);

    () => clearInterval(intervalId);
  }, []);

  // click photo when required
  useEffect(() => {
    if (document.body) {
      const canvasEl = document.getElementById('canvasStream') as HTMLCanvasElement | null;
      if (!canvasEl) return;
      canvasEl.width = 420;
      canvasEl.height = 520;

      if (videoEl) {
        canvasEl.getContext('2d')?.drawImage(videoEl, 0, 0, 420, 520);
        // console.log('🚀 ~ file: App.tsx:76 ~ useEffect ~ canvasEl:', canvasEl);
        // setTimeout(() => {
        // }, 500);
        if (shouldClickPhoto) {
          let imageClicked = canvasEl.toDataURL('image/jpeg');
          // console.log('🚀 ~ file: App.tsx:69 ~ useEffect ~ imageClicked:', imageClicked);
          (async () => {
            await fetch(`${BACKEND_URL}/upload`, {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image: imageClicked }),
            });
          })();
        }
      }
    }
  }, [shouldClickPhoto, videoEl]);

  // const testAPI = async () => {
  //   let resBody = await fetch(BACKEND_URL);

  //   let response = await resBody.json();
  // };

  return (
    <>
      <div className='main-container'>
        {cameraStream ? (
          <div id='video-wrapper'>
            <video id='video-preview' autoPlay></video>
            <canvas id='canvasStream' />
            {/* <button onClick={testAPI}>Test API</button> */}
          </div>
        ) : (
          <p>Unable to capture camera stream</p>
        )}
      </div>
    </>
  );
};

export default App;
