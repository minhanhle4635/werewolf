import axios from 'axios';
import { setAlert } from './alert';
import { GET_GAME_INFO, GAME_ERROR } from './types';

export const getGameInfo = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/game');

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
