import axios from 'axios';
import { setAlert } from './alert';
import {
  LOBBY_CREATED,
  GET_LOBBIES,
  LOBBY_DISBANDED,
  LOBBY_ERROR,
  JOIN_LOBBY,
} from './types';

//Create lobby
export const createLobby = (formData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await axios.post('/api/lobby', formData, config);

    dispatch({
      type: LOBBY_CREATED,
      payload: res.data,
    });

    dispatch(setAlert('Lobby Created', 'success'));
  } catch (err) {
    dispatch({
      type: LOBBY_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get All Lobbies
export const getLobbies = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/lobby');

    dispatch({
      type: GET_LOBBIES,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: LOBBY_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Join lobby
export const joinLobby = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`api/lobby/${id}`);

    dispatch({
      type: JOIN_LOBBY,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: LOBBY_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Disband lobby
export const disbandLobby = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/posts/${id}`);

    dispatch({
      type: LOBBY_DISBANDED,
      payload: id,
    });

    dispatch(setAlert('Lobby Disbanded', 'success'));
  } catch (err) {
    dispatch({
      type: LOBBY_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
