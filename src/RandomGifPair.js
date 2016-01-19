import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';

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
    type: NEW_GIF,
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

//type Action = RequestMore | NewGif
const REQUEST_MORE = 'REQUEST_MORE';
const NEW_GIF = 'NEW_GIF';

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [LEFT](action, model) {
    const [ left, fx ] = RandomGif.update(action.action, model.left);
    return [ { left, right: model.right }, fx ];
  },

  [RIGHT](action, model) {
    const [ right, fx ] = RandomGif.update(action.action, model.right);
    return [ { right, left: model.left }, fx ]
  },

  [NEW_GIF](action, model) {
    //if left
    return [{
      ...model,
      left: {
        gifUrl: action.result,
        topic: model.left.topic,
      }
    }, Effects.none];
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
