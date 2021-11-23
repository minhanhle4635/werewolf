import {
  GAME_ERROR,
  VOTED_SUCCESS,
  GET_GAME_INFO_ID,
  GET_GAME_INFO,
} from '../actions/types';

const initialState = {
  gameState: null,
  gameId: null,
  loading: true,
  error: {},
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function (state = initialState, action) {
  const { type, payload } = action;
  // eslint-disable-next-line default-case
  switch (type) {
    case GET_GAME_INFO_ID:
      return {
        ...state,
        gameId: payload,
        loading: false,
      };
    case GET_GAME_INFO:
      return {
        ...state,
        gameState: payload,
        loading: false,
      };
    case VOTED_SUCCESS:
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
