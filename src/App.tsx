import React from 'react';
import './App.css';

import { MuiThemeProvider } from '@material-ui/core/styles';
import { RevealProvider } from './components/reveal/RevealContext';
import { RevealBoundary } from './components/reveal/RevealBoundary';

import BugfulCanvas from './components/debug/BugfulCanvas';

import Button from './components/button/Button';

import theme from './theme';

export interface AppProps {

}

const App: React.FC<AppProps> = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <RevealProvider>
        <RevealBoundary>
          <div className="App">
            <Button>Hello!</Button>
            <Button>World!</Button>
          </div>
        </RevealBoundary>
      </RevealProvider>
    </MuiThemeProvider>
  );
}
export default App;
