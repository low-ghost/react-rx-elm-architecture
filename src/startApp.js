import React, { Component } from 'react';
import Rx from 'rx';
import R from 'ramda';
import mixin from 'react-mixin';
import { StateStreamMixin } from 'rx-react';

export const dispatch = R.curry(function dispatch(address$, type, args) {
  return address$.onNext({ type, ...args });
});

export function forwardTo(address$, type, args = {}){
  let forward$ = new Rx.Subject();
  forward$.subscribe(action => {
    return address$.onNext({
      action,
      type,
      ...args
    });
  });
  return forward$;
}

/**
 * reversed action state from redux
 * and no init
 */
export function createReducer(handlers) {
  return (action, state) =>
    handlers.hasOwnProperty(action.type)
      ? handlers[action.type](action, state)
      : state;
};

@mixin.decorate(StateStreamMixin)
export default class StartApp extends Component {

  getStateStream(){

    const { update, init } = this.props;

    const address$ = new Rx.Subject();
    return Rx.Observable.just(init())
      .merge(address$)
      //-- updateStep : action -> (model, Effects action) -> (model, Effects action)
      .scan(([ model, _ ], action) => update(action, model))
      .map(([ model, effects ]) => {
        if (effects instanceof Rx.Observable) {
          effects.subscribe(r => address$.onNext({ ...r }));
        }
        return ({ address$, model });
      });
  }

  render(){

    const { View } = this.props;
    const { address$, model } = this.state;

    return <View address$={address$} model={model} />;
  }
}

// TODO: better none type
const none = 0;
export const Effects = {
  map: (type, f, args = {}) => f !== none ? f.map(action => ({ type, action, ...args })) : none,
  batch: (x, ...xs) => R.reduce((acc, fn) => {
    if (acc !== none && fn !== none)
      return acc.merge(fn);
    if (fn !== none)
      return fn;
    return acc;
  }, x, xs),
  none
};

const formatTask = type => R.compose(R.merge({ type }), R.objOf('result'));

export const toMaybe = (type, task$) => Rx.Observable.catch(
  task$,
  Rx.Observable.just(Effects.none)
).map(formatTask(type));

export const maybeWithDefault = (defaultVal, val) =>
  val !== Effects.none ? val : defaultVal;
