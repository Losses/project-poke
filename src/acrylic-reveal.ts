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
  handleMouseEnter = () => {
    this.storage!.mouseInBoundary = true;
    window.requestAnimationFrame(() => this.storage!.paintAll());
  };

  handleMouseLeave = () => {
    this.storage!.mouseInBoundary = false;
    this.storage!.paintAll(true);
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
    this.style.display = 'inline-block';
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
    this.style.display = 'inline-block';
    if (!this.provider) throw new SyntaxError('You must use ' + AcrylicRevealBoundary.ElementName + '!');
    const div = this.root.querySelector('div')!;
    setTimeout(() => {
      this.provider!.storage!.addReveal(
        this.canvas,
        {
          color: '0, 0, 0',
          borderStyle: 'full',
          borderWidth: 1,
          fillMode: 'relative',
          fillRadius: 2,
          revealAnimateSpeed: 2000,
          revealReleasedAccelerateRate: 3.5,
          borderWhileNotHover: true
        } as any,
        div
      );
    }, 0);
    this.canvas.style.transform = `translateY(-${div.getBoundingClientRect().height}px)`; // - + "px";
  }
  constructor() {
    super();
    this.root.innerHTML = `<div><slot></slot></div><canvas></canvas><style>canvas { top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; } </style>`;
    this.canvas = this.root.querySelector('canvas')!;
  }
}

customElements.define(AcrylicReveal.ElementName, AcrylicReveal);
