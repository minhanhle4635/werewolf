import { GET_GAME_INFO, GAME_ERROR, VOTED_SUCCESS } from '../actions/types';

const initialState = {
  gameState: {
    _id: '6199f1be92cd7533824401c4',
    players: ['6195806cc70f178f96b03b83', '61968ba069cb1a75b6832c2e'],
    phase: 'DAY',
    turn: 1,
    lobbyName: 'Lê Minh Anh',
    owner: '6195806cc70f178f96b03b83',
    date: '2021-11-20T16:02:56.035Z',
    description: '1231231231',
    maxParticipants: 10,
    status: 'PLAYING',
    __v: 1,
    playerStatus: {
      '6195806cc70f178f96b03b83': 'ALIVE',
      '61968ba069cb1a75b6832c2e': 'ALIVE',
    },
    roles: 'VILLAGER',
  },
  loading: true,
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
