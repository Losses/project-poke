import React from 'react';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { RevealProvider } from './components/reveal/RevealContext';
import RevealBoundary from './components/reveal/RevealBoundary';

import Button from './components/button/Button';
import List from './components/list/List';
import ListItem from './components/list/ListItem';

import Reveal from './components/reveal/Reveal';

import theme from './theme/dark';

export interface AppProps {

}

const App: React.FC<AppProps> = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <RevealProvider>
        <RevealBoundary>
          <div className="button-set">
            <h1>Button example:</h1>
            <div className="buttons">
              <Button>Hello</Button>
              <Button>World!</Button>
              <Button>From</Button>
              <Button>Team</Button>
            </div>
            <div className="buttons">
              <Button>Project</Button>
              <Button>Poke!</Button>
            </div>
          </div>
        </RevealBoundary>
        {/* <RevealBoundary dynamicBoundingRect>
          <div className="list">
            <h1>List example:</h1>
            <List>
              <ListItem>First List Item</ListItem>
              <ListItem>Second List Item</ListItem>
              <ListItem>Third List Item</ListItem>
              <ListItem>First List Item</ListItem>
              <ListItem>Second List Item</ListItem>
              <ListItem>Third List Item</ListItem>
              <ListItem>First List Item</ListItem>
              <ListItem>Second List Item</ListItem>
              <ListItem>Third List Item</ListItem>
              <ListItem>First List Item</ListItem>
              <ListItem>Second List Item</ListItem>
              <ListItem>Third List Item</ListItem>
            </List>
          </div>

          <div>
            <h1>Use independently:</h1>
            <div className='test-reveal'>
              <Reveal />
            </div>
          </div>

        </RevealBoundary> */}
      </RevealProvider>
    </MuiThemeProvider>
  );
}
export default App;
