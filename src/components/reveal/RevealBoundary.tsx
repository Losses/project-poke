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

  handleMouseEnter = (ev: any) => {
    this.storage.mouseInBoundary = true;

    window.requestAnimationFrame(() => this.storage.paintAll());
  }

  handleMouseLeave = (ev: any) => {
    this.storage.mouseInBoundary = false;
    
    this.storage.paintAll(true);
  }

  handleMouseMove = (ev: any) => {
    this.storage.clientX = ev.clientX;
    this.storage.clientY = ev.clientY;
  }

  render() {
    return (
      <RevealBoundaryContext.Provider value={{ storage: this.storage }}>
        <div
          className="poke-reveal-boundary"
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onMouseMove={this.handleMouseMove}
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