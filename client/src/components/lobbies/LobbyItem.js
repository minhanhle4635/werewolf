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
      <div className="post bg-white p-1 my-1">
        <div>
          <img className="round-img" src={avatar} alt="" />
          <h4>
            Owner: <Link to={`/profile/${owner_id}`}>{name}</Link>
          </h4>
        </div>
        <div>
          <p className="lobby-name">Room Name: {lobbyName}</p>
          <p className="lobby-max">
            Slots: {players.length}/{maxParticipants}
          </p>
          <p className="lobby-desc">
            Desc: {description} <br />
          </p>
        </div>
        <div>
          <button
            // to={`/room/${_id}`}
            className="btn btn-primary"
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
