import { isWidthDown } from "@material-ui/core/withWidth";

export interface RevealStateManagerTypes {
  newBoundary: Function
}

export interface RevealStyle {
  color: string,
  borderStyle: 'full' | 'half' | 'none',
  borderWidth: number,
  fillMode: 'relative' | 'absolute' | 'none',
  fillRadius: number,
  borderWhileNotHover: boolean
}

export const revealStyleKeys: string[] = ['color', 'borderStyle', 'borderWidth', 'fillMode', 'fillRadius'];

type CanvasConfig = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D | null,
  width: number,
  height: number,
  style: RevealStyle,
  cachedRevealBitmap: CachedRevealBitmapSet
}

export type RevealBoundaryStore = {
  _currentHashId: number,
  id: number,
  clientX: number,
  clientY: number,
  paintedClientX: number,
  paintedClientY: number,
  destory: Function,
  addReveal: Function,
  removeReveal: Function,
  cacheRevealBitmaps: Function,
  getCanvasPaintingStyle: Function,
  mouseInBoundary: boolean,
  canvasList: Array<CanvasConfig>,
  dynamicBoundingRect: boolean,
  paintAll: Function,
  resetAll: Function,
  dirty: boolean,
  [key: string]: any
}

export interface CachedRevealBitmap {
  type: string,
  bitmap: ImageData
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
    const storage = <RevealBoundaryStore>{
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
      destory: () => {
        this._storage.find((sto, idx) => {
          const answer = sto === storage;

          this._storage.splice(idx, 1);
          return answer;
        });
      },
      addReveal: ($el: HTMLCanvasElement, style: RevealStyle) => {
        const canvasConfig: CanvasConfig = {
          canvas: $el,
          ctx: $el.getContext('2d'),
          cachedRevealBitmap: [],
          width: 0,
          height: 0,
          style
        };

        storage.cacheRevealBitmaps(canvasConfig);
        storage.canvasList.push(canvasConfig);
      },
      removeReveal: ($el: HTMLCanvasElement) => {
        storage.canvasList.find((el, idx) => {
          const answer = $el === el.canvas;

          storage.canvasList.splice(idx, 1);
          return answer;
        });
      },
      getCanvasPaintingStyle: (config: CanvasConfig) => {
        let { top, left, width, height } = config.canvas.getBoundingClientRect();

        top = Math.round(top);
        left = Math.round(left);
        width = Math.round(width);
        height = Math.round(height);

        let trueFillRadius;

        if (config.style.fillMode === 'none') {
          trueFillRadius = 0;
        } else {
          trueFillRadius = config.style.fillMode === 'relative'
            ? Math.max(width, height) * config.style.fillRadius
            : config.style.fillRadius;
        }

        const cacheCanvasSize = trueFillRadius * 2;

        return { top, left, width, height, trueFillRadius, cacheCanvasSize };
      },

      cacheRevealBitmaps: (config: CanvasConfig) => {
        if (!config.ctx) return;

        const { width, height, trueFillRadius, cacheCanvasSize } = storage.getCanvasPaintingStyle(config);

        config.width = width;
        config.height = height;
        config.canvas.width = width;
        config.canvas.height = height;

        let fillAlpha, grd, revealCanvas, revealCtx;

        for (let i of ['border', 'fill']) {
          revealCanvas = document.createElement('canvas');
          revealCanvas.width = cacheCanvasSize;
          revealCanvas.height = cacheCanvasSize;

          revealCtx = revealCanvas.getContext('2d');
          if (!revealCtx) return;

          fillAlpha = i === 'border' ? ', 0.6)' : ', 0.3)';

          grd = revealCtx.createRadialGradient(
            trueFillRadius, trueFillRadius, 0,
            trueFillRadius, trueFillRadius, trueFillRadius
          )

          grd.addColorStop(0, 'rgba(' + config.style.color + fillAlpha);
          grd.addColorStop(1, 'rgba(' + config.style.color + ', 0.0)');

          revealCtx.fillStyle = grd;
          revealCtx.fillRect(0, 0, cacheCanvasSize, cacheCanvasSize);

          config.cachedRevealBitmap.push({
            type: i,
            bitmap: revealCtx.getImageData(0, 0, cacheCanvasSize, cacheCanvasSize)
          });
        }
      },
      paintAll: (force: boolean) => {
        if (!(storage.mouseInBoundary || (!storage.mouseInBoundary && force))) return;

        storage.canvasList.forEach((config, index) => {
          paintCanvas(config, storage, force, index === 0);
        });

        storage.dirty = true;
        storage.paintedClientX = storage.clientX;
        storage.paintedClientY = storage.clientY;

        if (storage.mouseInBoundary) {
          window.requestAnimationFrame(() => { storage.paintAll() });
        }
      },

      resetAll: () => {
        storage.canvasList.forEach((config) => {
          paintCanvas(config, storage);
        });
      }
    };

    this._storage.push(storage);

    return storage;
  }
}

const paintCanvas = (config: CanvasConfig, storage: RevealBoundaryStore, force?: boolean, debug?: boolean) => {
  if (storage.clientX === storage.paintedClientX && storage.clientY === storage.paintedClientY && !force) return;

  if (!config.ctx) return;

  config.ctx.clearRect(0, 0, config.width, config.height);
  storage.dirty = false;

  if (!storage.mouseInBoundary) return;
  if (config.cachedRevealBitmap.length < 2) return;

  const { top, left, width, height, trueFillRadius } = storage.getCanvasPaintingStyle(config);

  if (width !== config.width || height !== config.height) {
    storage.cacheRevealBitmaps(config);
  }

  const {borderStyle, borderWidth, fillMode } = config.style;

  const relativeX = storage.clientX - left;
  const relativeY = storage.clientY - top;

  let fillX = 0, fillY = 0, fillW = 0, fillH = 0;

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

  const putX = relativeX - trueFillRadius;
  const putY = relativeY - trueFillRadius;

  if (isNaN(relativeX) || isNaN(relativeY)) return;

  if (borderStyle !== 'none') {
    config.ctx.putImageData(config.cachedRevealBitmap[0].bitmap, putX, putY, -putX, -putY, width, height);
    config.ctx.clearRect(fillX, fillY, fillW, fillH);
  }

  if (fillMode == 'none') return;
  if (notHover) return;

  config.ctx.putImageData(config.cachedRevealBitmap[1].bitmap, putX, putY, fillX - putX, fillY - putY, fillW, fillH);
}


export default RevealStateManager