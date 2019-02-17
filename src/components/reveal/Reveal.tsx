import * as React from 'react';

import { RevealStyle } from './RevealStateManager';
import { RevealBoundaryContext } from './RevealBoundary';

import styles from './styles/Reveal.module.css';

export type RevealProps = RevealStyle & {
}

export interface RevealState {
  registered: boolean
}

const Reveal: React.SFC<RevealProps> = (props) => {
  const boundaryContext = React.useContext(RevealBoundaryContext);
  const [revealState, setRevealState] = React.useState({ registered: false });
  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

  React.useEffect(() => {
    if (!boundaryContext.storage) return;
    if (revealState.registered) return;

    const $canvas = canvasRef.current;

    boundaryContext.storage.addReveal($canvas);
  });

  return (
    <canvas ref={canvasRef} className={styles.reveal_canvas}></canvas>
  );
}

export default Reveal;