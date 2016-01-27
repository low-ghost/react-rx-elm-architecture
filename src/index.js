import React from 'react';
import { render } from 'react-dom';
import StartApp, { composeUpdate } from './startApp';
import { logger, subLogger } from './middleware/logging';
import { init, update, View } from './RandomGifPair';

const composedUpdate = composeUpdate(logger, subLogger)(update);

render(
  <StartApp
    init={init("funny cats", "funny dogs")}
    update={composedUpdate}
    View={View} />,
  document.getElementById('root'));
