import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

/// <reference path="./CustomElement.d.ts" />
import './acrylic-reveal';

ReactDOM.render(<App />, document.getElementById('root'));

const div = document.createElement('div');
document.getElementById('root')!.before(div);
const hello = (
  <acrylic-reveal style={{ marginTop: 50 }}>
    <h1 style={{ margin: 0, display: 'inline-block' }}>Hello, world from Custom Element!</h1>
  </acrylic-reveal>
);
ReactDOM.render(
  <acrylic-reveal-bound style={{ width: '100vw', height: 250 }}>
    {hello}
    {hello}
  </acrylic-reveal-bound>,
  div
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
