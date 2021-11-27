import {
  GAME_ERROR,
  VOTED_SUCCESS,
  GET_GAME_INFO_ID,
  GET_GAME_INFO,
  REMOVE_VOTE,
  UPDATE_GAME_INFO,
  END_GAME,
} from '../actions/types';

const initialState = {
  gameState: null,
  vote: null,
  loading: true,
  gameOver: false,
  error: {},
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
    case UPDATE_GAME_INFO:
      return {
        ...state,
        gameState: Object.assign({}, state.gameState, payload),
        loading: false,
      };
    case VOTED_SUCCESS:
      return {
        ...state,
        vote: payload,
        loading: false,
      };
    case REMOVE_VOTE:
      return {
        ...state,
        vote: null,
        loading: false,
      };
    case END_GAME:
      return {
        ...state,
        gameOver: true,
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
