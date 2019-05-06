import RevealStateManager, { RevealBoundaryStore } from './components/reveal/RevealStateManager';

const globalManager = new RevealStateManager();
export class AcrylicRevealProvider extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal-provider';
  readonly manager = new RevealStateManager();
}
customElements.define(AcrylicRevealProvider.ElementName, AcrylicRevealProvider);

export class AcrylicRevealBoundary extends HTMLElement {
  static readonly ElementName = 'acrylic-reveal-bound';
  storage?: RevealBoundaryStore;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<slot></slot><style>:host { display: inline-block; } </style>`;
  }
  handleMouseEnter = () => {
    this.storage!.mouseInBoundary = true;
    window.requestAnimationFrame(() => this.storage!.paintAll());
  };

  handleMouseLeave = () => {
    this.storage!.mouseInBoundary = false;
    this.storage!.paintAll(0, true);
  };

  handleMouseMove = (ev: MouseEvent) => {
    this.storage!.clientX = ev.clientX;
    this.storage!.clientY = ev.clientY;
  };

  handleMouseDown = () => {
    this.storage!.initializeAnimation();
  };

  handleMouseUp = () => {
    this.storage!.switchAnimation();
  };
  connectedCallback() {
    const parent: AcrylicRevealProvider = this.closest(AcrylicRevealProvider.ElementName) as any;
    const manager = this.storage ? parent.manager : globalManager;
    this.storage = manager.newBoundary();
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
  private provider: AcrylicRevealBoundary | null = null;
  connectedCallback() {
    this.provider = this.closest(AcrylicRevealBoundary.ElementName) as AcrylicRevealBoundary;
    if (!this.provider) throw new SyntaxError('You must use ' + AcrylicRevealBoundary.ElementName + '!');
    setTimeout(() => {
      this.provider!.storage!.addReveal(this.canvas, {
        color: '0, 0, 0',
        borderStyle: 'full',
        borderWidth: 1,
        fillMode: 'relative',
        fillRadius: 1.5,
        revealAnimateSpeed: 2000,
        revealReleasedAccelerateRate: 3.5,
        borderWhileNotHover: true
      });
    }, 0);
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
