import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { joinLobby } from '../../actions/lobby';
import io from 'socket.io-client';

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
          <Link
            to={`/room/${_id}`}
            className="btn btn-primary"
            onClick={(e) => joinLobby(_id)}
          >
            Join Lobby
          </Link>
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
};

export default connect(null, { joinLobby })(LobbyItem);