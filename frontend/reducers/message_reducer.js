import merge from 'lodash/merge';

import { RECEIVE_MESSAGE, RECEIVE_MESSAGES } from 'actions/message_actions';

const messageReducer = (state = [], action) => {
  Object.freeze(state);
  switch(action.type) {
    case RECEIVE_MESSAGE:      
      let newState = Object.assign([], state);
      newState.push(action.message);
      return newState;
    case RECEIVE_MESSAGES:
      return action.messages;

    default:
      return state;
  }
};


export default messageReducer;
