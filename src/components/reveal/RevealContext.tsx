import * as React from 'react';

const DEFAULT_VALUE = { clientX: -100, clientY: -100 };
const RevealContext = React.createContext(DEFAULT_VALUE);

export interface RevealProviderProps {

}

export interface RevealStates {
  clientX: number,
  clientY: number,
}

const RevealProvider: React.FC<RevealProviderProps> = (props) => {
  const [revealState, setRevealState] = React.useState<RevealStates>(DEFAULT_VALUE);

  React.useEffect(() => {
    const handleMouseMove = (ev:MouseEvent) => {
      setRevealState(
        (state: RevealStates) => ({
          ...state,
          clientX: ev.clientX,
          clientY: ev.clientY,
        })
      )
    }

    document.addEventListener('mousemove',handleMouseMove, false);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [-1]);

  return (
    <RevealContext.Provider value={{ ...revealState }}>
      {props.children}
    </RevealContext.Provider>
  );
}

const RevealConsumer = RevealContext.Consumer;

export default RevealContext;
export {RevealProvider, RevealConsumer};