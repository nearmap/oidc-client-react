

export default (defaultState, actionReducers)=> (state=defaultState, action)=> {
  const reducer = actionReducers[action.type];

  if (reducer !== undefined) {
    return reducer(state, action);
  }
  return state;
};
