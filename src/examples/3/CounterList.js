import React from 'react';
import R from 'ramda';
import * as Counter from './Counter';
import { dispatch, forwardTo, createReducer } from './startApp';

/**
 * type alias Model =
 *  { counters : List [ ID, Counter.Model ]
 *  , nextID : ID
 *  }
 * init : Model
 */
export let init = {
  counters: [],
  nextID: 0
};

//type Action = Insert | Remove | Modify
const INSERT = 'INSERT';
const REMOVE = 'REMOVE';
const MODIFY = 'MODIFY';

//update : Action -> Model -> Model
export const update = createReducer({

  [INSERT](action, model) {
    return {
      ...model,
      counters: [ ...model.counters, [ model.nextID, Counter.init(0) ] ],
      nextID: model.nextID + 1
    };
  },

  [REMOVE](action, model) {
    return {
      ...model,
      counters: R.init(model.counters)
    };
  },

  [MODIFY](action, model) {
    return {
      ...model,
      counters: R.map(
        counter => {
          const [ id, counterModel ] = counter;
          return (id === action.id)
            ? [ id, Counter.update(action.action, counterModel) ]
            : counter;
        },
        model.counters)
    };
  },

});

//viewCounter : Signal.Address Action -> (ID, Counter.Model) -> Html
function viewCounter(address$) {
  return ([ id, model ]) =>
    Counter.view({ address$: forwardTo(address$, MODIFY, { id }), model, id });
}

//view : Signal.Address Action -> Model -> Html
export function view({ address$, model }) {
  const counters = R.map(viewCounter(address$), model.counters);
  return (
    <div>
      <button onClick={dispatch(address$, REMOVE)}>Remove</button>
      <button onClick={dispatch(address$, INSERT)}>Add</button>
      {counters}
    </div>
  );
}
