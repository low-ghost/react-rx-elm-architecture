import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';

//type Action = Left | Right
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

//init : String -> (Model, Effects Action)
export let init = (topicLeft, topicRight) => () => {
  const [ left, leftFx ] = RandomGif.init(topicLeft)();
  const [ right, rightFx ] = RandomGif.init(topicRight)();
  return [
    { left, right },
    Effects.batch(
      Effects.map(LEFT, leftFx),
      Effects.map(RIGHT, rightFx))
  ];
};

//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [LEFT](action, model) {
    const [ left, fx ] = RandomGif.update(action.action, model.left);
    return [ { left, right: model.right }, Effects.map(LEFT, fx) ];
  },

  [RIGHT](action, model) {
    const [ right, fx ] = RandomGif.update(action.action, model.right);
    return [ { right, left: model.left }, Effects.map(RIGHT, fx) ];
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
