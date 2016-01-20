import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';

const NEW_GIF = 'NEW_GIF';

//type Action = Left | Right | ScopedNewGif
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const SCOPED_NEW_GIF = 'SCOPED_' + NEW_GIF;

//init : String -> (Model, Effects Action)
export let init = (topicLeft, topicRight) => () => {
  const [ left, lfx ] = RandomGif.init(topicLeft)();
  const [ right, rfx ] = RandomGif.init(topicRight)();
  return [
    { left, right },
    Effects.batch(
      Effects.map(lfx, NEW_GIF, 'left'),
      Effects.map(rfx, NEW_GIF, 'right'))
  ];
}

//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [LEFT](action, model) {
    const [ left, fx ] = RandomGif.update(action.action, model.left);
    return [ { left, right: model.right }, Effects.map(fx, NEW_GIF, 'left') ];
  },

  [RIGHT](action, model) {
    const [ right, fx ] = RandomGif.update(action.action, model.right);
    return [ { right, left: model.left }, Effects.map(fx, NEW_GIF, 'right') ];
  },

  [SCOPED_NEW_GIF](action, model) {
    const { scope } = action;
    const [result, effect] = RandomGif.update({ type: NEW_GIF, result: action.result }, model[scope]);
    return [ R.set(R.lensProp(scope), result, model), effect ];
  },

});

//view : Signal.Address Action -> Model -> Html
export function View({ address$, model }) {
  return (
    <div>
      <RandomGif.View address$={forwardTo(address$, LEFT)} model={model.left} />
      <RandomGif.View address$={forwardTo(address$, RIGHT)} model={model.right} />
    </div>
  );
}
