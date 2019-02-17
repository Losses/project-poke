import * as React from 'react';

import cn from 'classnames/bind';

import RevealContext from './RevealContext';
import RevealBoundaryContext from './RevealBoundary';

import styles from './styles/Reveal.module.css';

const cx = cn.bind(styles);

const REVEAL_BORDER_WIDTH = 1;
const REVEAL_FILL_RADIUS = 2;

const DEFAULT_STATE = {
  'elementTop': -100,
  'elementLeft': -100,
  'loggedBondRect': false
}

export interface RevealStates {
  elementTop: number,
  elementLeft: number,
  loggedBondRect: boolean
}

export interface RevealProps {
  borderStyle?: 'full' | 'half' | 'none',
  noFill?: boolean
}

const Reveal: React.FC<RevealProps> = (props) => {
  const revealProps = React.useContext(RevealContext);
  const revealBoundaryProps = React.useContext(RevealBoundaryContext);
  const [RevealState, setRevealState] = React.useState<RevealStates>(DEFAULT_STATE);

  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

  React.useEffect(() => {
    if ('mouseInBoundary' in revealBoundaryProps && !revealBoundaryProps.mouseInBoundary) return;
    if (RevealState.loggedBondRect && !revealBoundaryProps.dynamicBoundingRect) return;
    
    if (!canvasRef.current) return;

    const $canvas = canvasRef.current;
    const position = $canvas.getBoundingClientRect();

    if (position.top === RevealState.elementTop && position.left === RevealState.elementLeft) return;

    setRevealState((state: RevealStates) => ({
      ...state,
      elementTop: position.top,
      elementLeft: position.left,
      loggedBondRect: true
    }));

    const ctx = $canvas.getContext('2d');

    if (!ctx) return;

    ctx.canvas.width = $canvas.offsetWidth;
    ctx.canvas.height = $canvas.offsetHeight;
  });

  React.useEffect(() => {
    if ('mouseInBoundary' in revealBoundaryProps && !revealBoundaryProps.mouseInBoundary) return;
    if (!canvasRef.current) return;

    const borderStyle = props.borderStyle || 'full';

    const $canvas = canvasRef.current;
    const ctx = $canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, $canvas.offsetWidth, $canvas.offsetHeight);

    const relativeX = revealProps.clientX - RevealState.elementLeft;
    const relativeY = revealProps.clientY - RevealState.elementTop;

    let fillX = 0, fillY = 0, fillW = 0, fillH = 0;

    switch (borderStyle) {
      case 'full':
        fillX = REVEAL_BORDER_WIDTH;
        fillY = REVEAL_BORDER_WIDTH;
        fillW = $canvas.offsetWidth - 2 * REVEAL_BORDER_WIDTH;
        fillH = $canvas.offsetHeight - 2 * REVEAL_BORDER_WIDTH;
        break;
      case 'half':
        fillX = 0;
        fillY = REVEAL_BORDER_WIDTH;
        fillW = $canvas.offsetWidth;
        fillH = $canvas.offsetHeight - 2 * REVEAL_BORDER_WIDTH;
        break;
      case 'none':
        fillX = 0;
        fillY = 0;
        fillW = $canvas.offsetWidth;
        fillH = $canvas.offsetHeight
    }

    if (borderStyle !== 'none') {
      const borderGrd = ctx.createRadialGradient(
        relativeX, relativeY, 0,
        relativeX, relativeY, $canvas.offsetHeight * REVEAL_FILL_RADIUS
      );

      borderGrd.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      borderGrd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = borderGrd;
      ctx.fillRect(0, 0, $canvas.offsetWidth, $canvas.offsetHeight);
      ctx.clearRect(fillX, fillY, fillW, fillH);
    }

    if (props.noFill) return;
    if (relativeX < 0 || relativeX > $canvas.offsetWidth) return;
    if (relativeY < 0 || relativeY > $canvas.offsetHeight) return;

    const fillGrd = ctx.createRadialGradient(
      relativeX, relativeY, 0,
      relativeX, relativeY, $canvas.offsetHeight * REVEAL_FILL_RADIUS
    );

    fillGrd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    fillGrd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = fillGrd;
    ctx.fillRect(fillX, fillY, fillW, fillH);

  });

  return (
    <canvas
      ref={canvasRef}
      className={cx('reveal_canvas', { hidden: !revealBoundaryProps.mouseInBoundary })}
    ></canvas>
  );
}

export default Reveal;