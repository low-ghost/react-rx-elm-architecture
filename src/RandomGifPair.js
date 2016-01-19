import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';


//type Action = RequestMore | NewGif
const NEW_GIF = 'NEW_GIF';

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

//init : String -> (Model, Effects Action)
export let init = topic => () => [{
  left: {
    gifUrl: 'assets/waiting.gif',
    topic,
  },
  right: {
    gifUrl: 'assets/waiting.gif',
    topic,
  }
}, getRandomGif(topic)];

//getRandomGif : String -> Effects Action
function getRandomGif(topic) {
  const encodedTopic = encodeURIComponent(topic);
  return {
    type: LEFT + NEW_GIF,
    action: Rx.Observable.fromPromise(
      fetch(`http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${encodedTopic}`)
        .then(decodeUrl)),
  };
}

//minor difference as json is a promise
//decodeUrl : String -> Effects Action
function decodeUrl(response) {
  if (response.status >= 400) {
    throw new Error("Hmm, that's not great");
  }
  return response.json()
    .then(R.path(['data', 'image_url']));
}
//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [LEFT](action, model) {
    const [ left, fx ] = RandomGif.update(action.action, model.left);
    const newFx = { ...fx, type: LEFT + fx.type }
    return [ { left, right: model.right }, newFx ];
  },

  [RIGHT](action, model) {
    const [ right, fx ] = RandomGif.update(action.action, model.right);
    const newFx = { ...fx, type: RIGHT + fx.type }
    return [ { right, left: model.left }, newFx ]
  },

  [LEFT + NEW_GIF](action, model) {
    //if left
    const [left, effect] = RandomGif.update({ type: NEW_GIF, result: action.result }, model.left);
    return [{
      ...model,
      left
    }, effect];
  },

  [RIGHT + NEW_GIF](action, model) {
    //if left
    const [right, effect] = RandomGif.update({ type: NEW_GIF, result: action.result }, model.right);
    return [{
      ...model,
      right
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
