/* eslint-disable import/no-anonymous-default-export */
import {
  GET_LOBBIES,
  GET_LOBBY,
  JOIN_LOBBY,
  LEAVE_LOBBY,
  LOBBY_CREATED,
  LOBBY_DISBANDED,
  LOBBY_ERROR,
} from '../actions/types';

const initialState = {
  lobbies: [],
  lobby: null,
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_LOBBIES:
      return {
        ...state,
        lobbies: payload,
        loading: false,
      };
    case GET_LOBBY:
      return {
        ...state,
        lobby: payload,
        loading: false,
      };
    case JOIN_LOBBY:
      return {
        ...state,
        lobbies: state.lobbies.map((lobby) =>
          lobby._id === payload.id
            ? { ...lobby, players: payload.players }
            : lobby
        ),
        loading: false,
      };
    case LOBBY_CREATED:
      return {
        ...state,
        lobby: payload,
        loading: false,
      };
    case LEAVE_LOBBY:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case LOBBY_DISBANDED:
      return {
        ...state,
        lobbies: state.lobbies.filter((lobby) => lobby._id !== payload),
        loading: false,
      };
    case LOBBY_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
}
