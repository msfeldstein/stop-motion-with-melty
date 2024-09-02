'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CameraPreview from '../components/CameraPreview';
import CaptureButton from '../components/CaptureButton';
import FrameStack from '../components/FrameStack';
import styles from './page.module.css';

export default function Home() {
  const [frames, setFrames] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureFrame = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const frameDataUrl = canvas.toDataURL('image/jpeg');
      setFrames(prevFrames => [...prevFrames, frameDataUrl]);
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        captureFrame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [captureFrame]);

  const exportVideo = async () => {
    if (frames.length === 0) {
      alert('No frames to export!');
      return;
    }

    setIsExporting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const firstFrame = new Image();

    firstFrame.onload = async () => {
      canvas.width = firstFrame.width;
      canvas.height = firstFrame.height;

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stop_motion.webm';
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      mediaRecorder.start();

      for (let i = 0; i < frames.length; i++) {
        const img = new Image();
        img.src = frames[i];
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx!.drawImage(img, 0, 0);
            resolve();
          };
        });
        await new Promise(resolve => setTimeout(resolve, 200)); // 5 fps
      }

      mediaRecorder.stop();
    };

    firstFrame.src = frames[0];
  };

  return (
    <main className={styles.main}>
      <div className={styles.cameraContainer}>
        <CameraPreview videoRef={videoRef} />
        <CaptureButton onCapture={captureFrame} />
      </div>
      <div className={styles.frameStackContainer}>
        <FrameStack frames={frames} onExport={exportVideo} isExporting={isExporting} />
      </div>
    </main>
  )
}
