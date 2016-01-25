import React from 'react';
import { render } from 'react-dom';
import StartApp from './startApp';
import { init, update, View } from './RandomGifPair';


render(
  <StartApp init={init()} update={update} View={View}/>,
  document.getElementById('root'));
