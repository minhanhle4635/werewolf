import { combineReducers } from 'redux';
import auth from './auth';
import alert from './alert';
import lobby from './lobby';

export default combineReducers({ auth, alert, lobby });
