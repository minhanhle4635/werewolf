import { GET_GAME_INFO, GAME_ERROR } from '../actions/types';

const initialState = {
  gameState: {},
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
  const { type, payload } = action;
  // eslint-disable-next-line default-case
  switch (type) {
    case GET_GAME_INFO:
      return {
        ...state,
        gameState: payload,
        loading: false,
      };
    case GAME_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
}
