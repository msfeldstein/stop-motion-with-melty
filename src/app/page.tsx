'use client';

import React, { useState, useRef } from 'react';
import CameraPreview from '../components/CameraPreview';
import CaptureButton from '../components/CaptureButton';
import FrameStack from '../components/FrameStack';
import styles from './page.module.css';

export default function Home() {
  const [frames, setFrames] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const frameDataUrl = canvas.toDataURL('image/jpeg');
      setFrames(prevFrames => [...prevFrames, frameDataUrl]);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.cameraContainer}>
        <CameraPreview videoRef={videoRef} />
        <CaptureButton onCapture={captureFrame} />
      </div>
      <div className={styles.frameStackContainer}>
        <FrameStack frames={frames} />
      </div>
    </main>
  )
}
