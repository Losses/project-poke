export interface RevealStateManagerTypes {
  newBoundary: Function
}

export interface RevealStyle {
  color?: string,
  borderStyle?: 'full' | 'half' | 'none',
  borderWidth?: number,
  fillMode?: 'relative' | 'absolute' | 'none',
  fillRadius?: number
}

export const revealStyleKeys: string[] = ['color', 'borderStyle', 'borderWidth', 'fillMode', 'fillRadius'];

type CanvasConfig = RevealStyle & {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D | null,
  top: number,
  left: number,
  width: number,
  height: number,
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
  mouseInBoundary: boolean,
  canvasList: Array<CanvasConfig>,
  dynamicBoundingRect: boolean,
  paintAll: Function,
  resetAll: Function,
  dirty: boolean,
  [key: string]: any
}

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
      addReveal: ($el: HTMLCanvasElement) => {
        const canvasConfig: CanvasConfig = {
          canvas: $el,
          ctx: $el.getContext('2d'),
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          color: '0, 0, 0',
          borderStyle: 'full',
          borderWidth: 1,
          fillMode: 'relative',
          fillRadius: 2
        };

        setCanvasRect(canvasConfig);
        storage.canvasList.push(canvasConfig);
      },
      removeReveal: ($el: HTMLCanvasElement) => {
        storage.canvasList.find((el, idx) => {
          const answer = $el === el.canvas;

          storage.canvasList.splice(idx, 1);
          return answer;
        });
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

const setCanvasRect = (config: CanvasConfig) => {
  if (!config.ctx) return;

  const pos = config.canvas.getBoundingClientRect();

  config.top = pos.top;
  config.left = pos.left;
  config.width = config.canvas.offsetWidth;
  config.height = config.canvas.offsetHeight;

  config.ctx.canvas.width = config.width;
  config.ctx.canvas.height = config.height;
}

const paintCanvas = (config: CanvasConfig, storage: RevealBoundaryStore, force?: boolean, debug?: boolean) => {
  if (storage.clientX === storage.paintedClientX && storage.clientY === storage.paintedClientY && !force) return;

  if (!config.ctx) return;

  const { top, left, width, height } = config;

  config.ctx.clearRect(0, 0, width, height);
  storage.dirty = false;

  if (!storage.mouseInBoundary) return;

  const { color, borderStyle, borderWidth, fillMode, fillRadius } = config;

  if (!color || !borderStyle || !borderWidth || !fillMode || !fillRadius) return;

  const relativeX = storage.clientX - left;
  const relativeY = storage.clientY - top;

  const trueFillRadius = fillMode === 'relative' ? height * fillRadius : fillRadius;
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

  if (isNaN(relativeX) || isNaN(relativeY)) return;

  if (borderStyle !== 'none') {
    const borderGrd = config.ctx.createRadialGradient(
      relativeX, relativeY, 0,
      relativeX, relativeY, trueFillRadius
    );

    borderGrd.addColorStop(0, 'rgba(' + color + ', 0.8)');
    borderGrd.addColorStop(1, 'rgba(' + color + ', 0.0)');

    config.ctx.fillStyle = borderGrd;
    config.ctx.fillRect(0, 0, width, height);
    config.ctx.clearRect(fillX, fillY, fillW, fillH);
  }

  if (fillMode == 'none') return;
  if (relativeX < 0 || relativeX > width) return;
  if (relativeY < 0 || relativeY > height) return;

  const fillGrd = config.ctx.createRadialGradient(
    relativeX, relativeY, 0,
    relativeX, relativeY, trueFillRadius
  );

  fillGrd.addColorStop(0, 'rgba(' + color + ', 0.3)');
  fillGrd.addColorStop(1, 'rgba(' + color + ', 0.0)');

  config.ctx.fillStyle = fillGrd;
  config.ctx.fillRect(fillX, fillY, fillW, fillH);
}


export default RevealStateManager