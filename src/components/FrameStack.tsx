'use client';

import React from 'react';
import styles from '../app/page.module.css';

interface FrameStackProps {
  frames: string[];
  onExport: () => void;
  isExporting: boolean;
}

const FrameStack: React.FC<FrameStackProps> = ({ frames, onExport, isExporting }) => {
  return (
    <div className={styles.frameStack}>
      {frames.map((frame, index) => (
        <img key={index} src={frame} alt={`Frame ${index + 1}`} className={styles.frameThumb} />
      ))}
      <button className={styles.exportButton} onClick={onExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export Video'}
      </button>
    </div>
  );
};

export default FrameStack;

