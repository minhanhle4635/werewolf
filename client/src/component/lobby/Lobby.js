import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import LobbyItem from './LobbyItem';
import { getLobby } from '../../actions/lobby';

const Lobby = ({ getLobby, lobby: { lobby, loading }, match }) => {
  useEffect(() => {
    getLobby(match.params.id);
  }, [getLobby, match.params.id]);

  return loading || lobby === null ? <Spinner /> : <LobbyItem />;
};

Lobby.propTypes = {
  getLobby: PropTypes.func.isRequired,
  lobby: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
});

export default connect(mapStateToProps, { getLobby })(Lobby);
