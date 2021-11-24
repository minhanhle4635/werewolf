import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_GAME_INFO_ID,
  GAME_ERROR,
  VOTED_SUCCESS,
  GET_GAME_INFO,
} from './types';

export const startGame = (id) => async (dispatch) => {
  try {
    const res = await axios.post(`/api/game/${id}/start`);

    dispatch({
      type: GET_GAME_INFO_ID,
      payload: res.data,
    });
    return res.data;
  } catch (err) {
    dispatch({
      type: GAME_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

export const getGameInformation = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/game/${id}/info`);

    dispatch({
      type: GET_GAME_INFO,
      payload: res.data,
    });
    return res.data;
  } catch (err) {
    dispatch({
      type: GAME_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

export const submitVote =
  (roomId, { type, targeted }) =>
  async (dispatch) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ type, targeted });
    try {
      const res = await axios.post(`/api/game/${roomId}/vote`, body, config);
      dispatch({
        type: VOTED_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: GAME_ERROR,
        payload: { msg: 'Game loi', status: 'Game loi' },
      });
    }
  };
