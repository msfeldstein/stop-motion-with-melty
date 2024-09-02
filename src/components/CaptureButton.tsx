import React from 'react';
import styles from '../app/page.module.css';

const CaptureButton: React.FC = () => {
  return (
    <button className={styles.captureButton}>
      Capture
    </button>
  );
};

export default CaptureButton;

