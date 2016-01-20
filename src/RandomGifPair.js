import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';


//type Action = RequestMore | NewGif
const NEW_GIF = 'NEW_GIF';
const SCOPED = "SCOPED";
const SCOPED_NEW_GIF = SCOPED + "_" + NEW_GIF;

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

//init : String -> (Model, Effects Action)
export let init = (topicLeft, topicRight) => () => {
  const [ left, lfx ] = RandomGif.init(topicLeft)();
  const [ right, rfx ] = RandomGif.init(topicRight)();
  const leftFx = { ...lfx, type: SCOPED_NEW_GIF, scope: 'left' };
  const rightFx = { ...rfx, type: SCOPED_NEW_GIF, scope: 'right' };
  return [{ left, right }, leftFx];
}

//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [LEFT](action, model) {
    const [ left, fx ] = RandomGif.update(action.action, model.left);
    const newFx = { ...fx, type: `${SCOPED}_${fx.type}`, scope: 'left' }
    return [ { left, right: model.right }, newFx ];
  },

  [RIGHT](action, model) {
    const [ right, fx ] = RandomGif.update(action.action, model.right);
    const newFx = { ...fx, type: `${SCOPED}_${fx.type}`, scope: 'right' }
    return [ { right, left: model.left }, newFx ]
  },

  [SCOPED_NEW_GIF](action, model) {
    const { scope } = action;
    const [result, effect] = RandomGif.update({ type: NEW_GIF, result: action.result }, model[scope]);
    return [{
      ...model,
      [scope]: result
    }, effect];
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



//import React from 'react';
//import R from 'ramda';
//import fetch from 'isomorphic-fetch';
//import * as RandomGif from './RandomGif';
//import { dispatch, forwardTo, createReducer} from './startApp';

//const Effects = {

  //batch(items) {
    //return Rx.Observable.forkJoin.apply(null, items);
  //},

  //map(type, effect) {
    //console.log(type, effect);
  //}

//};

////type Action : Left | Right
//const LEFT = 'LEFT';
//const RIGHT = 'RIGHT';

////init : String -> String -> (Model, Effects Action)
//const init = (leftTopic, rightTopic) => () => {
  //const [ left, leftFx ] = RandomGif.init(leftTopic);
  //const [ right, rightFx ] = RandomGif.init(rightTopic);
  //return [
    //{ left, right },
    //Effects.batch([
      //Effects.map(LEFT, leftFx),
      //Effects.map(RIGHT, rightFx)
    //])
  //];
//}

//// update : Action -> Model -> (Model, Effects Action)
//const update = createReducer({

  //[LEFT](action, model){
    //const [ left, fx ] = RandomGif.update(action, model.left);
    //return [ { left, right: model.right }, Effects.map(LEFT, fx) ];
  //},

  //[RIGHT](action, model){
    //const [ right, fx ] = RandomGif.update(action, model.right);
    //return [ { right, left: model.left }, Effects.map(RIGHT, fx) ];
  //},

//});

////view : Signal.Address Action -> Model -> Html
//export function View({ address$, model }) {
  //return (
    //<div style={{ display: "flex" }}>
      //<RandomGif.View address$={forwardTo(address$, LEFT)} model={model.left} />
      //<RandomGif.View address$={forwardTo(address$, RIGHT)} model={model.right} />
    //</div>
  //);
//}
