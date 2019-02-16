import * as React from 'react';

import styles from './styles/BugfulCanvas.module.css';

export interface BugfulCanvasProps {

}

const BugfulCanvas: React.SFC<BugfulCanvasProps> = (props) => {
  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  React.useEffect(() => {
    const $c = canvasRef.current;

    if (!$c) return;

    const ctx = $c.getContext('2d');

    if (!ctx) return;

    ctx.canvas.width = $c.offsetWidth;
    ctx.canvas.height = $c.offsetHeight;

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, $c.offsetWidth, $c.offsetHeight);
  })
  return (
    <div className={styles.normal_div}>
      <canvas className={styles.test_canvas} ref={canvasRef}></canvas>
    </div>
  );
}

export default BugfulCanvas;