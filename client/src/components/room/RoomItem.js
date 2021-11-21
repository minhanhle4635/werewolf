import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getLobbies, getLobby, leaveLobby } from '../../actions/lobby';
import { io } from 'socket.io-client';
import { loadUser } from '../../actions/auth';

const ENDPOINT = 'http://localhost:5000';

let socket = io(ENDPOINT);

const RoomItem = ({
  lobby: { lobby, loading },
  auth,
  getLobby,
  loadUser,
  leaveLobby,
  getLobbies,
}) => {
  const { _id, players, lobbyName, maxParticipants, description } = lobby;

  // localStorage.setItem('current_lobby', JSON.stringify(lobby));

  // const currentLobby = JSON.parse(localStorage.getItem('current_lobby'));

  useEffect(() => {
    socket.emit(
      'JOIN_ROOM',
      { roomInformation: lobby, userJoined: auth.user._id },
      (error) => {
        console.log(error);
      }
    );

    socket.on('USER_JOINED', (joinedUserId) => {
      console.log(joinedUserId);
      if (auth.user._id === joinedUserId) {
        return;
      }
      // update lobby information
      getLobby(lobby._id);
    });

    socket.on('USER_LEFT', (payload) => {
      getLobby(lobby._id);
    });

    socket.on('DISBAND_ROOM', () => {
      window.location.href = '/lobbies';
    });
  }, [getLobby, getLobbies, lobby._id]);

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
          {auth.user._id === lobby.owner ? (
            players.length > 3 ? (
              <button className="btn btn-danger" disabled>
                Waiting for more players
              </button>
            ) : (
              <button className="btn btn-light">Start Game</button>
            )
          ) : (
            <button className="btn btn-danger" disabled>
              Waiting for more owner to start
            </button>
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
  getLobby: PropTypes.func.isRequired,
  getLobbies: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  getLobbies,
  leaveLobby,
  getLobby,
  loadUser,
})(RoomItem);
