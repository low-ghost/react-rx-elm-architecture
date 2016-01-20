import React, { Component } from 'react';
import Rx from 'rx';
import R from 'ramda';
import mixin from 'react-mixin';
import { StateStreamMixin } from 'rx-react';

export function dispatch(address$, type) {
  return () => address$.onNext({ type });
}

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

export const Effects = {
  map: (f, type, scope) => f.map(R.merge(R.__, { type: `SCOPED_${type}`, scope })),
  batch: (x, ...xs) => R.reduce((acc, fn) => acc.merge(fn), x, xs),
  none: 0
};
