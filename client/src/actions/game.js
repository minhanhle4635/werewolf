import axios from 'axios';
import { setAlert } from './alert';
import { GET_GAME_INFO, GAME_ERROR, VOTED_SUCCESS } from './types';

export const getGameInfo = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/game/${id}`);

    dispatch({
      type: GET_GAME_INFO,
      payload: res.data,
    });
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

      dispatch(getGameInfo(roomId));
    } catch (err) {
      dispatch({
        type: GAME_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status },
      });
    }
  };
