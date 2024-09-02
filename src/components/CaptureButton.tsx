'use client';

import React from 'react';
import styles from '../app/page.module.css';

interface CaptureButtonProps {
  onCapture: () => void;
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture }) => {
  return (
    <button className={styles.captureButton} onClick={onCapture} aria-label="Capture frame">
    </button>
  );
};

export default CaptureButton;

