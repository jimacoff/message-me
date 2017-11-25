import merge from 'lodash/merge';

import { RECEIVE_MESSAGE, RECEIVE_MESSAGES } from '../actions/conversation_actions';

const conversationReducer = (state = {}, action) => {
  Object.freeze(state);
  switch(action.type) {
    case RECEIVE_MESSAGE:
      const newMessage = {[action.message.id]: action.message};
      return merge({}, state, newMessage);
    case RECEIVE_MESSAGES:
      return action.messages;
    default:
      return state;
  }
};


export default conversationReducer;