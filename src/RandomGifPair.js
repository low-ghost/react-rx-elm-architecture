import React, { Component } from 'react';
import R from 'ramda';
import fetch from 'isomorphic-fetch';
import { FuncSubject } from 'rx-react';
import { dispatch, forwardTo, createReducer, Effects } from './startApp';
import * as RandomGif from './RandomGif';

const mapI = R.addIndex(R.map);

const unzip = a => mapI((col, i) => R.map(R.nth(i), a), R.head(a));

// type Action = Topic | Create | SubMsg
const TOPIC = 'TOPIC';
const CREATE = 'CREATE';
const SUB_MSG = 'SUB_MSG';

// init : () -> () -> (Model, Effects Action)
// maybe
export const init = () => () => [{ topic: '', gifList: [], uid: 0 }, Effects.none ];

// update : Action -> Model -> (Model, Effects Action)
export const update = createReducer({

  [TOPIC](action, model) {
    return [ { ...model, topic: action.topic }, Effects.none ];
  },

  [CREATE](action, model) {

    const [ newRandomGif, fx ] = RandomGif.init(model.topic)();

    return [
      {
        topic: '',
        gifList: [ ...model.gifList, { id: model.uid, model: newRandomGif }],
        uid: model.uid + 1,
      },
      Effects.map(SUB_MSG, fx, { id: model.uid }),
    ];
  },

  [SUB_MSG](action, model) {
    // msgId = action.id and msg = action.action
    const { id: msgId, action: msg } = action;
    const subUpdate = ({ id, model: randomGif }) => {
      if (id === msgId) {
        let [ newRandomGif, fx ] = RandomGif.update(msg, randomGif);
        return [
          { id, model: newRandomGif },
          Effects.map(SUB_MSG, fx, { id }),
        ];
      }
      else
        return [ { id, model: randomGif }, Effects.none ];
    };

    const  [ newGifList, fxList ] = R.pipe(
      R.map(subUpdate),
      unzip
    )(model.gifList);

    return [
      { ...model, gifList: newGifList },
      Effects.batch(...fxList),
    ];

  },
});

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '10px 0',
  fontSize: '2em',
  textAlign: 'center',
};

// elementView : Signal.Address Action -> (Int, RandomGif.Model) -> Html
function ElementView({ address$, id, model }) {
  return RandomGif.View({
    address$: forwardTo(address$, SUB_MSG, { id }),
    model
  });
}


// view : Signal.Address Action -> Model -> Html
export class View extends Component {

  onKeyDown$ = FuncSubject.create();
  onChange$ = FuncSubject.create();
  disposable$ = {};

  componentDidMount() {

    const { address$, model } = this.props;

    this.disposable$ = Rx.Observable.merge(
      this.onKeyDown$.map(R.path(['keyCode'])).filter(R.equals(13)),
      this.onChange$.map(R.path(['target', 'value'])),
    ).map(value =>
      value === 13
        ? dispatch(address$, CREATE, {})
        : dispatch(address$, TOPIC, { topic: value }))
    .subscribe()
  }

  componentWillUnmount() {
    this.disposable$.dispose();
  }

  render() {
    const { address$, model } = this.props;
    return (
      <div>
        <input
          placeholder='What kind of gifs do you want?'
          value={model.topic}
          onKeyDown={this.onKeyDown$}
          onChange={this.onChange$}
          style={inputStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {
          mapI(({ id, model }, key) =>
            <ElementView address$={address$} id={id} model={model} key={key} />,
            model.gifList)
        }
        </div>
      </div>
    );
  }
}
