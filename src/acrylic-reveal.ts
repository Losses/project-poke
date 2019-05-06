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
    if (newS) {
      this._storage = newS;
      this.dispatchEvent(new CustomEvent(attachStorageEvent, { detail: this._storage }));
      if (old) this.dispatchEvent(new CustomEvent(replaceStorageEvent, { detail: { old, new: newS } }));
    }
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
  handlePointerEnter = () => this.waitForStorage(storage => storage.onPointerEnterBoundary());
  handlePointerLeave = () => this.waitForStorage(storage => storage.onPointerLeaveBoundary());
  handlePointerMove = (ev: MouseEvent) =>
    this.waitForStorage(storage => {
      storage.clientX = ev.clientX;
      storage.clientY = ev.clientY;
    });
  handlePointerDown = () => this.waitForStorage(storage => storage.initializeAnimation());
  handlePointerUp = () => this.waitForStorage(storage => storage.switchAnimation());
  connectedCallback() {
    this.appendStorage(true);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('pointermove', this.handlePointerMove);
    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('pointerup', this.handlePointerUp);
  }
  disconnectedCallback() {
    this.storage = undefined;
  }
}
customElements.define(AcrylicRevealBoundary.ElementName, AcrylicRevealBoundary);

export class AcrylicReveal extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal';
  private root = this.attachShadow({ mode: 'open' });
  private canvas: HTMLCanvasElement;
  private boundary!: AcrylicRevealBoundary;
  adoptedCallback() {
    this.disconnectedCallback();
    this.connectedCallback();
  }
  disconnectedCallback() {
    this.boundary && this.boundary.waitForStorage(storage => storage.removeReveal(this.canvas));
  }
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
        borderWhileNotHover: true,
        revealAnimateSpeed: 2000,
        revealReleasedAccelerateRate: 6
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
