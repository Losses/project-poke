import * as React from 'react';

const DEFAULT_VALUE = {
  mouseInBoundary: false,
  dynamicBoundingRect: false
};

export interface RevealBoundaryProps {
  dynamicBoundingRect?: boolean
}

export interface RevealBoundaryStates {
  mouseInBoundary: boolean
}

export type RevealBoundaryContextTypes = RevealBoundaryProps & RevealBoundaryStates;

const RevealBoundaryContext = React.createContext<RevealBoundaryContextTypes>(DEFAULT_VALUE);

const RevealBoundary: React.FC<RevealBoundaryProps> = (props) => {
  const [revealBoundaryState, setrevealBoundaryState] = React.useState<RevealBoundaryStates>(DEFAULT_VALUE);

  const handleMouseEnter = (ev: any) => {
    setrevealBoundaryState(
      (state: RevealBoundaryStates) => ({
        ...state,
        mouseInBoundary: true
      })
    )
  }

  const handleMouseLeave = (ev: any) => {
    setrevealBoundaryState(
      (state: RevealBoundaryStates) => ({
        ...state,
        mouseInBoundary: false
      })
    )
  }

  return (
    <RevealBoundaryContext.Provider value={{ ...revealBoundaryState, ...props }}>
    {/* 这里这么写有个问题，如果鼠标位置到了 div 外面，光效就会“卡住”，你应该用 effect 把事件绑定到 document 上 */}
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {props.children}
      </div>

    </RevealBoundaryContext.Provider>
  );
}

const RevealBoundaryConsumer = RevealBoundaryContext.Consumer;

export default RevealBoundaryContext;
export { RevealBoundary, RevealBoundaryConsumer };