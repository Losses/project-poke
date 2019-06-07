import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

/// <reference path="./CustomElement.d.ts" />
import './acrylic-reveal';
import Button from '@material-ui/core/Button/Button';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import { AppBar, Typography } from '@material-ui/core';

ReactDOM.render(<App />, document.getElementById('root'));

const div = document.createElement('div');
document.getElementById('root')!.before(div);
const hello = (
  <acrylic-reveal>
    <Button disableFocusRipple disableRipple disableTouchRipple>
      Hello
    </Button>
  </acrylic-reveal>
);
ReactDOM.render(
  <acrylic-reveal-bound style={{ width: '100vw', height: 250 }}>
    <h1>👇Custom Element</h1>
    {hello}
    {hello}
    <acrylic-reveal>
      <div style={{ width: 400, height: 200, background: 'cyan' }} />
    </acrylic-reveal>
    <acrylic-reveal>
      <Button variant="contained" disableFocusRipple disableRipple disableTouchRipple>
        Default
      </Button>
    </acrylic-reveal>
    <acrylic-reveal>
      <Button variant="contained" disableFocusRipple disableRipple disableTouchRipple color="primary">
        Primary
      </Button>
    </acrylic-reveal>
    <acrylic-reveal>
      <Button variant="contained" disableFocusRipple disableRipple disableTouchRipple color="secondary">
        Secondary
      </Button>
    </acrylic-reveal>
    <acrylic-reveal>
      <Button variant="contained" disableFocusRipple disableRipple disableTouchRipple color="secondary" disabled>
        Disabled
      </Button>
    </acrylic-reveal>
    <acrylic-reveal>
      <Button variant="contained" disableFocusRipple disableRipple disableTouchRipple href="#contained-buttons">
        Link
      </Button>
    </acrylic-reveal>
    <h1>👇React Component</h1>
  </acrylic-reveal-bound>,
  div
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
