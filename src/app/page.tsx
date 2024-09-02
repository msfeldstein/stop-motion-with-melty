'use client';

import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import CameraPreview from '../components/CameraPreview';
import CaptureButton from '../components/CaptureButton';
import FrameStack from '../components/FrameStack';
import styles from './page.module.css';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const [frames, setFrames] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const captureFrame = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const frameDataUrl = canvas.toDataURL('image/jpeg');
      setFrames(prevFrames => [...prevFrames, frameDataUrl]);
      
      // Play chime sound
      playChimeSound();
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

    // Set up speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim().toLowerCase();
            if (transcript === 'now') {
              captureFrame();
            }
          }
        }
      };

      recognitionRef.current.start();
    } else {
      console.error('Speech recognition not supported in this browser');
    }

    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [captureFrame]);

  const playChimeSound = useCallback(() => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    }
  }, []);

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
