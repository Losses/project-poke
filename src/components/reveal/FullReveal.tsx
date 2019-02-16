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
  'elementPositionLogged': false,
}

export interface FullRevealStates {
  elementTop: number,
  elementLeft: number,
  elementPositionLogged: boolean,
}

export interface FullRevealProps {

}

const FullReveal: React.FC<FullRevealProps> = () => {
  const revealProps = React.useContext(RevealContext);
  const revealBoundaryProps = React.useContext(RevealBoundaryContext);
  const [fullRevealState, setFullRevealState] = React.useState<FullRevealStates>(DEFAULT_STATE);

  const canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();

  React.useEffect(() => {
    //if (fullRevealState.elementPositionLogged) return;
    if (!canvasRef.current) return;

    const $canvas = canvasRef.current;
    const position = $canvas.getBoundingClientRect();

    if (position.top === fullRevealState.elementTop && position.left === fullRevealState.elementLeft) return;

    setFullRevealState((state: FullRevealStates) => ({
      ...state,
      elementTop: position.top,
      elementLeft: position.left,
      elementPositionLogged: true
    }));

    const ctx = $canvas.getContext('2d');

    if (!ctx) return;

    ctx.canvas.width = $canvas.offsetWidth;
    ctx.canvas.height = $canvas.offsetHeight;
  });

  React.useEffect(() => {
    if ('mouseInBoundary' in revealBoundaryProps && !revealBoundaryProps.mouseInBoundary) return;
    if (!canvasRef.current) return;

    const $canvas = canvasRef.current;

    const ctx = $canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, $canvas.offsetWidth, $canvas.offsetHeight);

    const relativeX = revealProps.clientX - fullRevealState.elementLeft;
    const relativeY = revealProps.clientY - fullRevealState.elementTop;

    const borderGrd = ctx.createRadialGradient(
      relativeX, relativeY, 0,
      relativeX, relativeY, $canvas.offsetHeight * REVEAL_FILL_RADIUS
    );

    borderGrd.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    borderGrd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = borderGrd;
    ctx.fillRect(0, 0, $canvas.offsetWidth, $canvas.offsetHeight);
    ctx.clearRect(
      REVEAL_BORDER_WIDTH,
      REVEAL_BORDER_WIDTH,
      $canvas.offsetWidth - 2 * REVEAL_BORDER_WIDTH,
      $canvas.offsetHeight - 2 * REVEAL_BORDER_WIDTH
    );

    if (relativeX < 0 || relativeX > $canvas.offsetWidth) return;
    if (relativeY < 0 || relativeY > $canvas.offsetHeight) return;

    const fillGrd = ctx.createRadialGradient(
      relativeX, relativeY, 0,
      relativeX, relativeY, $canvas.offsetHeight * REVEAL_FILL_RADIUS
    );

    fillGrd.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    fillGrd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = fillGrd;
    ctx.fillRect(
      REVEAL_BORDER_WIDTH,
      REVEAL_BORDER_WIDTH,
      $canvas.offsetWidth - 2 * REVEAL_BORDER_WIDTH,
      $canvas.offsetHeight - 2 * REVEAL_BORDER_WIDTH
    );
  });

  return (
    <canvas
      ref={canvasRef}
      className={cx('reveal_canvas', { hidden: !revealBoundaryProps.mouseInBoundary })}
    ></canvas>
  );
}

export default FullReveal;