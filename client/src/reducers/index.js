import { combineReducers } from 'redux';
import auth from './auth';
import alert from './alert';
import lobby from './lobby';
import game from './game';
import profile from './profile';

export default combineReducers({ auth, alert, lobby, game, profile });
