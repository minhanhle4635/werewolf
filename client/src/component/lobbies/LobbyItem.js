import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { joinLobby } from '../../actions/lobby';

const LobbyItem = ({
  lobby: {
    _id,
    lobbyName,
    owner: { name, avatar, owner_id },
    players,
    date,
    maxParticipants,
    description,
    privacyStatus,
  },
  showActions,
  joinLobby,
}) => (
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
        <p className="lobby-date">
          Created at <Moment format="YYYY/MM/DD">{date}</Moment>
        </p>
        <p className="lobby-desc">
          Desc: {description} <br />
          Privacy Status: {privacyStatus}
        </p>
      </div>
      <div>
        <Link
          to={`/lobby/${_id}`}
          className="btn btn-primary"
          onClick={(e) => joinLobby(_id)}
        >
          Join Lobby
        </Link>
      </div>
    </div>
  </Fragment>
);

LobbyItem.defaultProps = {
  showActions: true,
};

LobbyItem.propTypes = {
  lobby: PropTypes.object.isRequired,
  joinLobby: PropTypes.func.isRequired,
};

export default connect(null, { joinLobby })(LobbyItem);
