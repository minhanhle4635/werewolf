import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { leaveLobby } from '../../actions/lobby';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';

let socket = io(ENDPOINT);

const RoomItem = ({ lobby: { lobby, loading }, auth, leaveLobby }) => {
  const { _id, players, lobbyName, maxParticipants, description } = lobby;

  // localStorage.setItem('current_lobby', lobby);

  // const currentLobby = JSON.parse(localStorage.getItem('current_lobby'));

  useEffect(() => {
    console.count('useEffectCounted');
    socket.emit(
      'JOIN_ROOM',
      { roomInformation: lobby, userJoined: auth.user._id },
      (error) => {
        console.log(error);
      }
    );
  }, []);

  return (
    <Fragment>
      <div>
        <h2>Lobby Name: {lobbyName}</h2>
      </div>
      <div className="lobby bg-white p-1 my-1">
        <div>LobbyID: {_id}</div>
        <div>
          Number of players required: {players.length}/{maxParticipants}
        </div>

        <div>Desc: {description}</div>
        <div className="bg-white">
          Players:
          {players.map((player) => (
            <div key={player._id}>
              <img src={player.avatar} alt="" />
              <h4>{player.name}</h4>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Link to={`/game/${_id}`}>
          {players.length > 2 ? (
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

RoomItem.propTypes = {
  lobby: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  leaveLobby: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
  auth: state.auth,
});

export default connect(mapStateToProps, { leaveLobby })(RoomItem);
