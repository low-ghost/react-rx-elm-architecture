import React from 'react';
import { render } from 'react-dom';
import R from 'ramda';
import { dispatch, createReducer } from './startApp';

// type alias Model = Int
// init : Int -> Model
export const init = R.identity;

//type Action = Increment | Decrement
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

//update : Action -> Model -> Model
export const update = createReducer({

  [INCREMENT](action, model) {
    return model + 1;
  },

  [DECREMENT](action, model) {
    return model - 1;
  },

});

//view : Signal.Address Action -> Model -> Int -> Html
export function View({ address$, model }) {
  return (
    <div>
      <button onClick={dispatch(address$, DECREMENT)}>-</button>
      <h2>{model}</h2>
      <button onClick={dispatch(address$, INCREMENT)}>+</button>
    </div>
  );
}
