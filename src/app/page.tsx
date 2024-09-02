import Image from "next/image";
import styles from "./page.module.css";
import CameraPreview from '../components/CameraPreview';
import CaptureButton from '../components/CaptureButton';
import FrameStack from '../components/FrameStack';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.cameraContainer}>
        <CameraPreview />
        <CaptureButton />
      </div>
      <div className={styles.frameStackContainer}>
        <FrameStack />
      </div>
    </main>
  )
}
