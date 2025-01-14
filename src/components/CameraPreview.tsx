'use client';

import React, { useEffect } from 'react';
import styles from '../app/page.module.css';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  previousFrame?: string;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ videoRef, previousFrame }) => {
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    setupCamera();

    return () => {
      // Clean up the video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className={styles.cameraPreview}>
      <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
      {previousFrame && (
        <div className={styles.onionskin}>
          <img src={previousFrame} alt="Previous frame" />
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
