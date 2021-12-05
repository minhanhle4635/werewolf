import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import RoomItem from '../room/RoomItem';
import { getLobby } from '../../actions/lobby';
import io from 'socket.io-client';
import ENDPOINT from '../../utils/deploy';

let socket = io(ENDPOINT);

const Room = ({ getLobby, lobby: { lobby, loading }, match }) => {
  useEffect(() => {
    getLobby(match.params.id);
  }, []);

  return loading || lobby === null ? <Spinner /> : <RoomItem />;
};

Room.propTypes = {
  getLobby: PropTypes.func.isRequired,
  lobby: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
});

export default connect(mapStateToProps, { getLobby })(Room);
