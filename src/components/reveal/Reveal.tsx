import * as React from 'react';

import { RevealStyle } from './RevealStateManager';
import { RevealBoundaryContext } from './RevealBoundary';
import { useTheme } from '../theme/theme';

import styles from './styles/Reveal.module.css';

export interface RevealProps {
  color?: string,
  borderStyle?: 'full' | 'half' | 'none',
  borderWidth?: number,
  fillMode?: 'relative' | 'absolute' | 'none',
  fillRadius?: number
}

const Reveal: React.SFC<RevealProps> = (props) => {
  const boundaryContext = React.useContext(RevealBoundaryContext);
  const revealTheme = useTheme({
    color: '0, 0, 0',
    borderStyle: 'full',
    borderWidth: 1,
    fillMode: 'relative',
    fillRadius: 1.5,
    borderWhileNotHover: true,
    revealAnimateSpeed: 2000,
    revealReleasedAccelerateRate: 3.5
  }) as RevealStyle;

  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

  React.useEffect(() => {
    if (!boundaryContext.storage) return;

    const $canvas = canvasRef.current;
    if (!$canvas) return;
    boundaryContext.storage.addReveal($canvas, revealTheme);
  }, [-1]);

  return (
    <canvas ref={canvasRef} className={styles.reveal_canvas}></canvas>
  );
}

export default Reveal;