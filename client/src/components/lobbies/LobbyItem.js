import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinLobby } from '../../actions/lobby';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom';

const ENDPOINT = 'http://localhost:5000';

let socket = io(ENDPOINT);

const LobbyItem = ({
  lobby: {
    _id,
    lobbyName,
    owner: { name, avatar, owner_id },
    players,
    maxParticipants,
    description,
  },
  joinLobby,
}) => {
  const locate = useHistory();

  async function joinLobbyBeforeNavigate(roomId) {
    await joinLobby(roomId);
    locate.push(`/room/${roomId}`);
  }

  return (
    <Fragment>
      <div className="border rounded p-4 flex space-x-2">
        <div className="p-2 grid place-items-center">
          <img
            className="rounded border border-white shadow-lg w-40 h-40"
            src={avatar}
            alt=""
          />
        </div>
        <div className="flex flex-col space-y-2 flex-1">
          <h4 className="text-lg font-bold">
            Owner: <Link to={`/profile/${owner_id}`}>{name}</Link>
          </h4>
          <p className="">Room Name: {lobbyName}</p>
          <p className="">
            Slots: {players.length}/{maxParticipants}
          </p>
          <p className="">
            Desc: {description} <br />
          </p>
        </div>
        <div>
          <button
            // to={`/room/${_id}`}
            className="block p-2 cursor-pointer text-white bg-blue-600 rounded shadow"
            onClick={(e) => joinLobbyBeforeNavigate(_id)}
          >
            Join Lobby
          </button>
        </div>
      </div>
    </Fragment>
  );
};

LobbyItem.defaultProps = {
  showActions: true,
};

LobbyItem.propTypes = {
  lobby: PropTypes.object.isRequired,
  joinLobby: PropTypes.func.isRequired,
  useHistory: PropTypes.func.isRequired,
};

export default connect(null, { joinLobby, useHistory })(LobbyItem);
