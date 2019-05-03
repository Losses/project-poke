export interface RevealStateManagerTypes {
  newBoundary: () => RevealBoundaryStore;
}

export interface RevealStyle {
  color: string;
  borderStyle: 'full' | 'half' | 'none';
  borderWidth: number;
  fillMode: 'relative' | 'absolute' | 'none';
  fillRadius: number;
  revealAnimateSpeed: number;
  revealReleasedAccelerateRate: number;
}

export const revealStyleKeys: string[] = ['color', 'borderStyle', 'borderWidth', 'fillMode', 'fillRadius'];

type CanvasConfig = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  style: RevealStyle;
  cachedRevealBitmap: CachedRevealBitmapSet;
  getCanvasPaintingStyle(): {
    top: number;
    left: number;
    width: number;
    height: number;
    trueFillRadius: number[];
    cacheCanvasSize: number;
  };
  cacheRevealBitmaps(): void;
  mouseInCanvas(): boolean;
  getHoveringAnimateGrd(frame: number, grd: CanvasGradient): void;
};

export type RevealBoundaryStore = {
  _currentHashId: number;
  id: number;
  // The current cursor position relative to window.
  clientX: number;
  clientY: number;
  // The cursor position of painted reveal effect.
  paintedClientX: number;
  paintedClientY: number;
  destroy(): void;
  // Add a new reveal effect.
  addReveal($el: HTMLCanvasElement, style: RevealStyle, boundingElement?: HTMLElement): void;
  removeReveal($el: HTMLCanvasElement): void;
  mouseInBoundary: boolean;
  canvasList: Array<CanvasConfig>;
  dynamicBoundingRect: boolean;
  paintAll(frame?: number, force?: boolean): void;
  resetAll(): void;
  dirty: boolean;

  getHoveringRevealConfig(): CanvasConfig | null;
  hoveringRevealConfig: CanvasConfig | null;
  // Cursor position while mouse down.
  mouseUpClientX: number | null;
  mouseUpClientY: number | null;
  mouseDownAnimateStartFrame: number | null;
  mouseDownAnimateCurrentFrame: number | null;
  mouseDownAnimateLogicFrame: number | null;
  mousePressed: boolean;
  mouseReleased: boolean;

  [key: string]: any;
};

export interface CachedRevealBitmap {
  type: number;
  bitmap: ImageData;
}

export type CachedRevealBitmapSet = CachedRevealBitmap[];

class RevealStateManager<RevealStateManagerTypes> {
  private _currentHashId = 0;
  private _storage = [] as Array<RevealBoundaryStore>;

  constructor() {
    this.newBoundary = this.newBoundary.bind(this);
  }

  newBoundary() {
    const hashId = this._currentHashId++;
    const storage: RevealBoundaryStore = {
      _currentHashId: 0,
      id: hashId,
      clientX: -1000,
      clientY: -1000,
      paintedClientX: -1000,
      paintedClientY: -1000,
      mouseInBoundary: false,
      canvasList: [],
      dynamicBoundingRect: false,
      dirty: false,
      destroy: () => {
        this._storage.find((sto, idx) => {
          const answer = sto === storage;

          this._storage.splice(idx, 1);
          return answer;
        });
      },
      addReveal: ($el: HTMLCanvasElement, style: RevealStyle, boundingElement?: HTMLElement) => {
        const canvasConfig: CanvasConfig = {
          canvas: $el,
          ctx: $el.getContext('2d'),
          cachedRevealBitmap: [],
          width: 0,
          height: 0,
          style,

          getCanvasPaintingStyle: () => {
            let { top, left, width, height } = (boundingElement || canvasConfig.canvas).getBoundingClientRect();

            top = Math.round(top);
            left = Math.round(left);
            width = Math.round(width);
            height = Math.round(height);

            let trueFillRadius;

            if (canvasConfig.style.fillMode === 'none') {
              trueFillRadius = [0, 0];
            } else {
              trueFillRadius =
                canvasConfig.style.fillMode === 'relative'
                  ? [width, height].sort((a, b) => a - b).map(x => x * canvasConfig.style.fillRadius)
                  : [canvasConfig.style.fillRadius];
            }

            const cacheCanvasSize = trueFillRadius[1] * 2;

            return { top, left, width, height, trueFillRadius, cacheCanvasSize };
          },

          cacheRevealBitmaps: () => {
            if (!canvasConfig.ctx) return;

            const { width, height, trueFillRadius, cacheCanvasSize } = canvasConfig.getCanvasPaintingStyle();

            canvasConfig.width = width;
            canvasConfig.height = height;
            canvasConfig.canvas.width = width;
            canvasConfig.canvas.height = height;
            canvasConfig.cachedRevealBitmap = [];

            let fillAlpha, grd, revealCanvas, revealCtx;

            // const a = document.querySelector('#debug');
            // if (a) a.innerHTML = '';

            for (let i of [0, 1]) { // 0 means border, 1 means fill.
              revealCanvas = document.createElement('canvas');
              revealCanvas.width = cacheCanvasSize;
              revealCanvas.height = cacheCanvasSize;

              revealCtx = revealCanvas.getContext('2d');
              if (!revealCtx) return;

              fillAlpha = i === 0 ? ', 0.6)' : ', 0.3)';

              grd = revealCtx.createRadialGradient(
                cacheCanvasSize / 2,
                cacheCanvasSize / 2,
                0,
                cacheCanvasSize / 2,
                cacheCanvasSize / 2,
                trueFillRadius[i]
              );

              grd.addColorStop(0, 'rgba(' + canvasConfig.style.color + fillAlpha);
              grd.addColorStop(1, 'rgba(' + canvasConfig.style.color + ', 0.0)');

              revealCtx.fillStyle = grd;
              revealCtx.fillRect(0, 0, cacheCanvasSize, cacheCanvasSize);

              // if (a) a.appendChild(revealCanvas);

              canvasConfig.cachedRevealBitmap.push({
                type: i,
                bitmap: revealCtx.getImageData(0, 0, cacheCanvasSize, cacheCanvasSize)
              });
            }
          },

          mouseInCanvas: () => {
            const { top, left, width, height } = canvasConfig.getCanvasPaintingStyle();

            const relativeX = storage.clientX - left;
            const relativeY = storage.clientY - top;

            if (relativeX < 0 || relativeX > width) return false;
            if (relativeY < 0 || relativeY > height) return false;
            return true;
          },

          getHoveringAnimateGrd: (frame: number, grd: CanvasGradient) => {
            if (!canvasConfig.ctx) return null;

            const _innerAlpha = 0.2 - frame * 0.7 * 1.7;
            const _outerAlpha = 0.1 - frame * 0.05;
            const _outerBorder = 0.1 + frame * 0.9;

            const innerAlpha = _innerAlpha < 0 ? 0 : _innerAlpha;
            const outerAlpha = _outerAlpha < 0 ? 0 : _outerAlpha;
            const outerBorder = _outerBorder > 1 ? 1 : _outerBorder;

            grd.addColorStop(0, `rgba(0,0,0,${innerAlpha})`);
            grd.addColorStop(outerBorder * 0.55, `rgba(${canvasConfig.style.color} ,${outerAlpha})`);
            grd.addColorStop(outerBorder, `rgba(${canvasConfig.style.color}, 0)`);

            return grd;
          }
        };

        canvasConfig.cacheRevealBitmaps();
        storage.canvasList.push(canvasConfig);
      },

      removeReveal: ($el: HTMLCanvasElement) => {
        storage.canvasList.find((el, idx) => {
          const answer = $el === el.canvas;

          storage.canvasList.splice(idx, 1);
          return answer;
        });
      },

      paintAll: (frame?: number, force?: boolean) => {
        if (!(storage.mouseInBoundary || (!storage.mouseInBoundary && force))) return;

        if (
          storage.mousePressed &&
          storage.mouseReleased &&
          (storage.mouseUpClientX === null || storage.mouseUpClientY === null)
        ) {
          storage.mouseUpClientX = storage.clientX;
          storage.mouseUpClientY = storage.clientY;
        }

        if (storage.mousePressed) {
          if (!frame) frame = 0;

          if (storage.mouseDownAnimateStartFrame === null) storage.mouseDownAnimateStartFrame = frame;

          if (storage.hoveringRevealConfig) {
            const relativeFrame = frame - storage.mouseDownAnimateStartFrame;
            storage.mouseDownAnimateCurrentFrame = relativeFrame;

            if (storage.mouseReleased && storage.mouseDownAnimateReleasedFrame === null) {
              storage.mouseDownAnimateReleasedFrame = relativeFrame;
            }

            const speed = storage.hoveringRevealConfig.style.revealAnimateSpeed;
            const accelerateRate = storage.hoveringRevealConfig.style.revealReleasedAccelerateRate;

            storage.mouseDownAnimateLogicFrame = !storage.mouseReleased
              ? relativeFrame / speed
              : relativeFrame / speed +
              ((relativeFrame - storage.mouseDownAnimateReleasedFrame) / speed) * accelerateRate;

            if (storage.mouseDownAnimateLogicFrame < 0) storage.mouseDownAnimateLogicFrame = 0;
          }

          if (storage.mouseDownAnimateLogicFrame && storage.mouseDownAnimateLogicFrame > 1) {
            storage.hoveringRevealConfig = null;
            storage.mouseUpClientX = null;
            storage.mouseUpClientY = null;
            storage.mouseDownAnimateStartFrame = null;
            storage.mouseDownAnimateCurrentFrame = null;
            storage.mouseDownAnimateReleasedFrame = null;
            storage.mouseDownAnimateLogicFrame = null;
            storage.mousePressed = false;
            storage.mouseReleased = false;
          }
        }

        storage.canvasList.forEach((config, index) => {
          paintCanvas(config, storage, frame, force);
        });

        storage.dirty = true;
        storage.paintedClientX = storage.clientX;
        storage.paintedClientY = storage.clientY;

        if (storage.mouseInBoundary) {
          window.requestAnimationFrame(frame => {
            storage.paintAll(frame);
          });
        }
      },

      resetAll: () => {
        storage.canvasList.forEach(config => {
          paintCanvas(config, storage);
        });
      },

      getHoveringRevealConfig: () => {
        return storage.canvasList.find(x => x.mouseInCanvas()) || null;
      },

      hoveringRevealConfig: null,
      mouseUpClientX: null,
      mouseUpClientY: null,
      mouseDownAnimateStartFrame: null,
      mouseDownAnimateCurrentFrame: null,
      mouseDownAnimateReleasedFrame: null,
      mouseDownAnimateLogicFrame: null,
      mousePressed: false,
      mouseReleased: false
    };

    this._storage.push(storage);

    return storage;
  }
}

const paintCanvas = (
  config: CanvasConfig,
  storage: RevealBoundaryStore,
  frame?: number,
  force?: boolean,
  debug?: boolean
) => {
  if (
    storage.clientX === storage.paintedClientX &&
    storage.clientY === storage.paintedClientY &&
    storage.hoveringRevealConfig !== config &&
    !force
  )
    return;

  if (!config.ctx) return;

  config.ctx.clearRect(0, 0, config.width, config.height);
  storage.dirty = false;

  if (!storage.mouseInBoundary) return;
  if (config.cachedRevealBitmap.length < 2) return;

  const { top, left, width, height, cacheCanvasSize, trueFillRadius } = config.getCanvasPaintingStyle();

  if (width !== config.width || height !== config.height) {
    config.cacheRevealBitmaps();
  }

  const { borderStyle, borderWidth, fillMode } = config.style;

  const relativeX = storage.clientX - left;
  const relativeY = storage.clientY - top;

  let fillX = 0,
    fillY = 0,
    fillW = 0,
    fillH = 0;

  switch (borderStyle) {
    case 'full':
      fillX = borderWidth;
      fillY = borderWidth;
      fillW = width - 2 * borderWidth;
      fillH = height - 2 * borderWidth;
      break;
    case 'half':
      fillX = 0;
      fillY = borderWidth;
      fillW = width;
      fillH = height - 2 * borderWidth;
      break;
    case 'none':
      fillX = 0;
      fillY = 0;
      fillW = width;
      fillH = height;
      break;
  }

  const putX = relativeX - cacheCanvasSize / 2;
  const putY = relativeY - cacheCanvasSize / 2;

  if (isNaN(relativeX) || isNaN(relativeY)) return;

  if (borderStyle !== 'none') {
    config.ctx.putImageData(config.cachedRevealBitmap[0].bitmap, putX, putY, -putX, -putY, width, height);
    config.ctx.clearRect(fillX, fillY, fillW, fillH);
  }

  if (fillMode == 'none') return;
  if (relativeX < 0 || relativeX > width) return;
  if (relativeY < 0 || relativeY > height) return;

  config.ctx.putImageData(config.cachedRevealBitmap[1].bitmap, putX, putY, fillX - putX, fillY - putY, fillW, fillH);

  if (config !== storage.hoveringRevealConfig) return;
  if (!storage.mousePressed || !storage.mouseDownAnimateLogicFrame) return;

  let animateGrd;

  if (storage.mouseReleased && storage.mouseUpClientX && storage.mouseUpClientY) {
    animateGrd = config.ctx.createRadialGradient(
      storage.mouseUpClientX - left,
      storage.mouseUpClientY - top,
      0,
      relativeX,
      relativeY,
      cacheCanvasSize
    );
  } else {
    animateGrd = config.ctx.createRadialGradient(relativeX, relativeY, 0, relativeX, relativeY, trueFillRadius[1]);
  }

  config.getHoveringAnimateGrd(storage.mouseDownAnimateLogicFrame, animateGrd);
  config.ctx.fillStyle = animateGrd;
  config.ctx.fillRect(fillX, fillY, fillW * 1.5, fillH * 1.5);
};

export default RevealStateManager;
