import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getLobbies, getLobby, leaveLobby } from '../../actions/lobby';
import { io } from 'socket.io-client';
import { loadUser } from '../../actions/auth';
import { useHistory } from 'react-router-dom';
import { getGameInformation, startGame } from '../../actions/game';

const ENDPOINT = 'http://localhost:5000';

let socket = io(ENDPOINT);

const RoomItem = ({
  lobby: { lobby, loading },
  auth,
  getLobby,
  leaveLobby,
  getLobbies,
  startGame,
  getGameInformation,
}) => {
  const { _id, players, lobbyName, maxParticipants, description } = lobby;
  // localStorage.setItem('current_lobby', JSON.stringify(lobby));

  // const currentLobby = JSON.parse(localStorage.getItem('current_lobby'));
  const u = useHistory();

  function authenticatedUser() {
    return auth && auth.user;
  }

  useEffect(() => {
    getLobby(lobby._id);
  }, []);

  async function startGameFunction() {
    // call API to generate/start game
    // then emit socket to server inform that the room is finished.
    const id = await startGame(_id);
    console.log(id);
    socket.emit('ROOM_GENERATED', id);
  }

  const eventUserLeft = (userLeftId) => {
    console.log('Userleft triggered');
    if (auth && auth.user && auth.user._id === userLeftId) {
      return;
    }
    getLobby(lobby._id);
  };
  const eventUserJoined = (joinedUserId) => {
    console.log(joinedUserId);
    if (!authenticatedUser() || auth.user._id === joinedUserId) {
      return;
    }
    // update lobby information
    getLobby(lobby._id);
  };
  const eventRoomDisband = () => {
    u.push('/lobbies');
  };
  // if event triggered, navigate all user to room URL.
  // In that page, each user get the room information (/game/:roomID/info)
  // and each of them will then know which role they are.
  const eventStartGame = async (generatedGameId) => {
    if (!authenticatedUser()) {
      return;
    }
    console.log(generatedGameId);
    await getGameInformation(generatedGameId);
    // other user and the host himself
    u.push(`/game/${generatedGameId}`);
  };

  useEffect(() => {
    socket.emit(
      'JOIN_ROOM',
      {
        roomInformation: lobby,
        userJoined: auth && auth.user && auth.user._id,
      },
      (error) => {
        console.log(error);
      }
    );

    socket.on('USER_JOINED', eventUserJoined);
    socket.on('USER_LEFT', eventUserLeft);
    socket.on('DISBAND_ROOM', eventRoomDisband);
    socket.on('START_GAME', eventStartGame);

    return () => {
      console.log('user left the room');
      socket.removeListener('USER_JOINED', eventUserJoined);
      socket.removeListener('USER_LEFT', eventUserLeft);
      socket.removeListener('DISBAND_ROOM', eventRoomDisband);
      socket.removeListener('START_GAME', eventStartGame);
    };
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
              <img className="w-40 h40" src={player.avatar} alt="" />
              <h4>{player.name}</h4>
            </div>
          ))}
        </div>
      </div>
      <div>
        {auth && auth.user && auth.user._id === lobby.owner ? (
          players.length > 3 ? (
            <button className="btn btn-danger" disabled>
              Waiting for more players
            </button>
          ) : (
            <button
              onClick={() => startGameFunction()}
              className="btn btn-light"
            >
              Start Game
            </button>
          )
        ) : (
          <button className="btn btn-danger" disabled>
            Waiting for more owner to start
          </button>
        )}
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
  getGameInformation: PropTypes.func.isRequired,
  startGame: PropTypes.func.isRequired,
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
  getGameInformation,
  startGame,
})(RoomItem);
