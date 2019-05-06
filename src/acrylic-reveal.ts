import RevealStateManager, { RevealBoundaryStore } from './components/reveal/RevealStateManager';

const removeStorageEvent = 'removeStorage';
const attachStorageEvent = 'attachStorage';
const replaceStorageEvent = 'replaceStorage';

const globalStateManager = new RevealStateManager();
export class AcrylicRevealProvider extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal-provider';
  readonly stateManager = new RevealStateManager();
}
customElements.define(AcrylicRevealProvider.ElementName, AcrylicRevealProvider);

export class AcrylicRevealBoundary extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal-bound';
  private _storage!: RevealBoundaryStore | undefined;
  private get storage() {
    return this._storage;
  }
  private set storage(newS) {
    const old = this._storage;
    if (old) this.dispatchEvent(new CustomEvent(removeStorageEvent, { detail: old }));
    this._storage = newS;
    this.dispatchEvent(new CustomEvent(attachStorageEvent, { detail: this._storage }));
    if (old) this.dispatchEvent(new CustomEvent(replaceStorageEvent, { detail: { old, new: newS } }));
  }
  public waitForStorage(f: (storage: RevealBoundaryStore) => void) {
    if (this.storage === undefined)
      this.addEventListener(attachStorageEvent, () => f(this.storage!), {
        once: true
      });
    else f(this.storage);
  }
  private appendStorage(force = false) {
    if (!force) if (this.storage) return;
    const parent = this.closest(AcrylicRevealProvider.ElementName) as AcrylicRevealProvider;
    const stateManager = parent ? parent.stateManager : globalStateManager;
    this.storage = stateManager.newBoundary();
  }
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<slot></slot><style>:host { display: inline-block; } </style>`;
  }
  handleMouseEnter = () =>
    this.waitForStorage(storage => {
      storage.mouseInBoundary = true;
      window.requestAnimationFrame(() => storage.paintAll());
    });

  handleMouseLeave = () =>
    this.waitForStorage(storage => {
      storage.mouseInBoundary = false;
      storage.paintAll(0, true);
    });

  handleMouseMove = (ev: MouseEvent) =>
    this.waitForStorage(storage => {
      storage.clientX = ev.clientX;
      storage.clientY = ev.clientY;
    });

  handleMouseDown = () => this.waitForStorage(storage => storage.initializeAnimation());
  handleMouseUp = () => this.waitForStorage(storage => storage.switchAnimation());
  connectedCallback() {
    this.appendStorage(true);
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
    this.addEventListener('mousemove', this.handleMouseMove);
    this.addEventListener('mousedown', this.handleMouseDown);
    this.addEventListener('mouseup', this.handleMouseUp);
  }
}
customElements.define(AcrylicRevealBoundary.ElementName, AcrylicRevealBoundary);

export class AcrylicReveal extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal';
  private root = this.attachShadow({ mode: 'open' });
  private canvas: HTMLCanvasElement;
  private boundary!: AcrylicRevealBoundary;
  connectedCallback() {
    this.boundary = this.closest(AcrylicRevealBoundary.ElementName) as AcrylicRevealBoundary;
    if (!this.boundary)
      throw new SyntaxError('You must use ' + AcrylicRevealBoundary.ElementName + ' as the boundary of acrylic!');
    this.boundary.waitForStorage(storage =>
      storage.addReveal(this.canvas, {
        color: '0, 0, 0',
        borderStyle: 'full',
        borderWidth: 1,
        fillMode: 'relative',
        fillRadius: 1.5,
        revealAnimateSpeed: 2000,
        revealReleasedAccelerateRate: 3.5,
        borderWhileNotHover: true
      })
    );
  }
  constructor() {
    super();
    this.root.innerHTML = `
    <div>
      <slot></slot>
    </div>
    <canvas></canvas>
    <style>
      div { display: inline; }
      canvas { top: 0; left: 0; pointer-events: none; width: 100%; height: 100%; position: absolute; }
      :host { display: inline-block; position: relative; }
    </style>`;
    this.canvas = this.root.querySelector('canvas')!;
  }
}

customElements.define(AcrylicReveal.ElementName, AcrylicReveal);
