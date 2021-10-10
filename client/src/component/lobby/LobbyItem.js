import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import {} from '../../actions/lobby';
import { leaveLobby } from '../../actions/lobby';

const LobbyItem = ({ lobby: { lobby, loading }, leaveLobby }) => {
  const {
    _id,
    lobbyId,
    players,
    lobbyName,
    owner,
    maxParticipants,
    privacyStatus,
  } = lobby;
  return (
    <Fragment>
      <div>
        <h2>Lobby Name: {lobbyName}</h2>
      </div>
      <div className="lobby bg-white p-1 my-1">
        <div>LobbyID: {lobbyId}</div>
        <div>
          Number of players required: {players.length}/{maxParticipants}
        </div>
        <div className="bg-white">
          Players:
          {players.map((player) => (
            <div className="bg-white p-1 my-1">
              <img className="round-img" src={player.avatar} alt="" />
              <h4>{player.name}</h4>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Link to={'/game/:id'}>
          {players.length !== maxParticipants ? (
            <button className="btn btn-danger" disabled>
              Waiting for more players
            </button>
          ) : (
            <button className="btn btn-light">Start Game</button>
          )}
        </Link>
      </div>
      <div>
        <Link to="/lobbies" onClick={(e) => leaveLobby(_id)}>
          <button className="btn btn-danger">Quit</button>
        </Link>
      </div>
    </Fragment>
  );
};

LobbyItem.propTypes = {
  lobby: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  leaveLobby: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
  auth: state.auth,
});

export default connect(mapStateToProps, { leaveLobby })(LobbyItem);
