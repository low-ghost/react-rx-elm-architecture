import React, { Component } from 'react';
import Rx from 'rx';
import mixin from 'react-mixin';
import { StateStreamMixin } from 'rx-react';

export function dispatch(address$, type) {
  return () => address$.onNext({ type });
}

export function forwardTo(address, type, args){
  let forward = new Rx.Subject();
  forward.subscribe(action => address.onNext({
    action,
    type,
    ...args
  }));
  return forward;
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

    return Rx.Observable.just(init)
      .merge(address$)
      .scan((model, action) => update(action, model))
      .map(model => ({ address$, model }));
  }

  render(){

    const { View } = this.props;
    const { address$, model } = this.state;

    return <View address$={address$} model={model} />;
  }
}
