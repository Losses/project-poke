import * as React from 'react';

import RevealStorageManager, { RevealStateManagerTypes } from './RevealStateManager';

const RevealContext = React.createContext<RevealContextTypes>({} as RevealContextTypes);

export interface RevealProviderProps {
}

export interface RevealContextTypes {
  storageManager: RevealStateManagerTypes
}

export type RevealContextStates = RevealContextTypes;

const RevealProvider: React.FC<RevealProviderProps> = (props) => {
  const revealState = React.useRef<RevealContextStates>({
    storageManager: new RevealStorageManager()
  });

  return (
    <RevealContext.Provider value={revealState.current}>
      {props.children}
    </RevealContext.Provider>
  );
}

const RevealConsumer = RevealContext.Consumer;

export default RevealContext;
export { RevealProvider, RevealConsumer };