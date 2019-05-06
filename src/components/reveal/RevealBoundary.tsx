import * as React from 'react';

import { RevealContextTypes, RevealConsumer } from './RevealContext';
import { RevealBoundaryStore } from './RevealStateManager';

export type RevealBoundaryProps = {};

export interface RevealBoundaryState {
  storage?: RevealBoundaryStore;
}

export type RevealBoundaryContextTypes = RevealBoundaryState;

const RevealBoundary: React.FC<RevealBoundaryProps> = props => {
  return (
    <RevealConsumer>
      {context => (
        <RevealBoundaryContent context={context} {...props}>
          {props.children}
        </RevealBoundaryContent>
      )}
    </RevealConsumer>
  );
};

export interface RevealBoundaryContentProps {
  context: RevealContextTypes;
  [key: string]: any;
}

const RevealBoundaryContext = React.createContext<RevealBoundaryContextTypes>({} as RevealBoundaryContextTypes);

class RevealBoundaryContent extends React.Component<RevealBoundaryContentProps> {
  storage: RevealBoundaryStore;

  constructor(props: RevealBoundaryContentProps) {
    super(props);

    this.storage = props.context.storageManager.newBoundary();
  }

  handlePointerEnter = () => {
    this.storage.onPointerEnterBoundary();
  };

  handlePointerLeave = () => {
    this.storage.onPointerLeaveBoundary();
  };

  handlePointerMove = (ev: React.MouseEvent) => {
    this.storage.clientX = ev.clientX;
    this.storage.clientY = ev.clientY;
  };

  handlePointerDown = () => {
    this.storage.initializeAnimation();
  };

  handlePointerUp = () => {
    this.storage.switchAnimation();
  };

  render() {
    return (
      <RevealBoundaryContext.Provider value={{ storage: this.storage }}>
        <div
          className="poke-reveal-boundary"
          onPointerEnter={this.handlePointerEnter}
          onPointerLeave={this.handlePointerLeave}
          onPointerMove={this.handlePointerMove}
          onPointerDown={this.handlePointerDown}
          onPointerUp={this.handlePointerUp}
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
