import React from 'react';
import { render } from 'react-dom';
import StartApp from './startApp';
import { init, update, View } from './RandomGif';


render(
  <StartApp init={init('funny cats')} update={update} View={View}/>,
  document.getElementById('root'));
