import * as React from 'react';

import RevealContext, { RevealContextTypes, RevealConsumer } from './RevealContext';
import { RevealBoundaryStore } from './RevealStateManager';

export type RevealBoundaryProps = {
  dynamicBoundingRect?: boolean
};

export interface RevealBoundaryState {
  storage?: RevealBoundaryStore
}

export type RevealBoundaryContextTypes = RevealBoundaryState;

const RevealBoundary: React.FC<RevealBoundaryProps> = (props) => {
  return (
    <RevealConsumer>
      {(context) => (
        <RevealBoundaryContent context={context} {...props}>
          {props.children}
        </RevealBoundaryContent>
      )}
    </RevealConsumer>
  )
}

export interface RevealBoundaryContentProps {
  context: RevealContextTypes,
  [key: string]: any
}

const RevealBoundaryContext = React.createContext<RevealBoundaryContextTypes>({} as RevealBoundaryContextTypes);

class RevealBoundaryContent extends React.Component<RevealBoundaryContentProps> {
  storage: RevealBoundaryStore;

  constructor(props: RevealBoundaryContentProps) {
    super(props);

    this.storage = props.context.storageManager.newBoundary();
  }

  handleMouseEnter = () => {
    this.storage.mouseInBoundary = true;

    window.requestAnimationFrame(() => this.storage.paintAll());
  }

  handleMouseLeave = () => {
    this.storage.mouseInBoundary = false;

    this.storage.paintAll(undefined, true);
  }

  handleMouseMove = (ev: React.MouseEvent) => {
    this.storage.clientX = ev.clientX;
    this.storage.clientY = ev.clientY;
  }

  handleMouseDown = () => {
    this.storage.mouseDownAnimateStartFrame = null;
    this.storage.mousePressed = true;
    this.storage.mouseReleased = false;
    this.storage.hoveringRevealConfig = this.storage.getHoveringRevealConfig();
  }

  handleMouseUp = () => {
    this.storage.mouseReleased = true;
  }

  render() {
    return (
      <RevealBoundaryContext.Provider value={{ storage: this.storage }}>
        <div
          className="poke-reveal-boundary"
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onMouseMove={this.handleMouseMove}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
        >
          {this.props.children}
        </div>
      </RevealBoundaryContext.Provider>
    );
  }
}


const RevealBoundaryConsumer = RevealBoundaryContext.Consumer;

export default RevealBoundary;
export { RevealBoundaryContext, RevealBoundaryConsumer };