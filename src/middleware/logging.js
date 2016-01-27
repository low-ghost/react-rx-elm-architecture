import R from 'ramda';
import { Effects } from '../startApp';

export function logger(next) {
  return (action, model) => {

    try {
      console.groupCollapsed(`action ${action.type}`);
    } catch(e) {
      console.log(`action ${action.type}`);
    }
    console.log('prev state', model);
    console.log('action', action);

    const [ nextModel, effects ] = next(action, model);

    console.log('next state', nextModel);
    effects === Effects.none
      ? console.log("effects", "NONE")
      : console.log("effects", "MAYBE", effects);

    try {
      console.groupEnd();
    } catch(e) {
      console.log('group end');
    }

    return [ nextModel, effects ];
  };
}

const actionLens = R.lensProp('action');
const recursiveSubactionLog = R.compose(
  sub => {
    if (sub) {
      console.log('sub action', sub);
      return recursiveSubactionLog(sub);
    }
  },
  R.view(actionLens));

export function subLogger(next) {
  return (action, model) => {
    recursiveSubactionLog(action);
    return next(action, model);
  };
}

