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

let count = 0;

/**
 * Minor difference as response.json is a promise.
 * This incarnation throws an error every 4 iterations,
 * but maybeWithDefault intentionally swallows it
 * and leaves the old model in place
 *
 * randomUrl : String -> Effects Action
 */
function randomUrl(response) {
  return response.json()
    .then(json => {
      count++;
      if (count % 4 === 0)
        throw new Error("Four sounds like the word for death in Mandarin");
      else
        return json;
    });
}

const decodeUrl = R.path(['data', 'image_url']);

//getRandomGif : String -> Effects Action
export function getRandomGif(topic) {
  const encodedTopic = encodeURIComponent(topic);

  return toMaybe(NEW_GIF,
    Rx.Observable.just()
      .flatMap(
        fetch(`http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${encodedTopic}`))
      .flatMap(randomUrl)
      .map(decodeUrl));
};

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
      <button onClick={() => dispatch(address$, { type: REQUEST_MORE })}>More Please</button>
    </div>
  );
}
