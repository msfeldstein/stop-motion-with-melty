import React from 'react';
import styles from '../app/page.module.css';

interface FrameStackProps {
  frames: string[];
}

const FrameStack: React.FC<FrameStackProps> = ({ frames }) => {
  return (
    <div className={styles.frameStack}>
      {frames.map((frame, index) => (
        <img key={index} src={frame} alt={`Frame ${index + 1}`} className={styles.frameThumb} />
      ))}
      <button className={styles.exportButton}>Export Video</button>
    </div>
  );
};

export default FrameStack;

