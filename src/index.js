import React from 'react';
import { render } from 'react-dom';
import StartApp from './startApp';
import { init, update, view } from './CounterList';

render(
  <StartApp init={init} update={update} view={view}/>,
  document.getElementById('root'));
