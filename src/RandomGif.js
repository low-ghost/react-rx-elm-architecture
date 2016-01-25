import React from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import {
    dispatch,
    forwardTo,
    createReducer,
    Effects,
    toMaybe,
    maybeWithDefault
  } from './startApp';

//init : String -> (Model, Effects Action)
export let init = topic => () => [{
  gifUrl: 'assets/waiting.gif',
  topic,
}, getRandomGif(topic)];

//getRandomGif : String -> Effects Action
export function getRandomGif(topic) {
  const encodedTopic = encodeURIComponent(topic);

  return toMaybe(NEW_GIF,
    Rx.Observable.fromPromise(
      fetch(`http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${encodedTopic}`)
        .then(decodeUrl)));
};

var x = 0;
//minor difference as json is a promise
//decodeUrl : String -> Effects Action
function decodeUrl(response) {
  return response.json()
    .then((r) => {
      x++;
      if (x % 3 === 0)
        throw new Error("massive error");
      else
        return r;
    })
    .then(R.path(['data', 'image_url']));
}

//type Action = RequestMore | NewGif
const REQUEST_MORE = 'REQUEST_MORE';
const NEW_GIF = 'NEW_GIF';

//update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [REQUEST_MORE](action, model) {
    return [ model, getRandomGif(model.topic) ];
  },

  [NEW_GIF](action, model) {
    return [{
      ...model,
      gifUrl: maybeWithDefault(model.gifUrl, action.result)
    }, Effects.none];
  },

});

//view : Signal.Address Action -> Model -> Html
export function View({ address$, model }) {

  const imgStyle = {
    width: 200,
    height: 200,
    display: "inline-block",
    backgroundPosition: "center center",
    backgroundSize: "cover",
    backgroundImage: `url("${model.gifUrl}")`,
  };

  const headerStyle = {
    width: 200,
    textAlign: "center",
  };

  return (
    <div style={{ width: 200 }}>
      <h2 style={headerStyle}>{model.topic}</h2>
      <img style={imgStyle} />
      <button onClick={() => dispatch(address$, REQUEST_MORE, void 0)}>More Please</button>
    </div>
  );
}
