import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { joinLobby } from '../../actions/lobby';

const LobbyItem = ({
  auth,
  lobby: { _id, lobbyName, owner, players, date, maxParticipants, description },
}) => (
  <div className="post bg-white p-1 my-1">
    <div>
      <Link to={`/profile/${owner._id}`}>
        <img className="round-img" src={owner.avatar} alt="" />
        <h4>Owner: {owner.name}</h4>
      </Link>
    </div>
    <div>
      <p className="lobby-name">Room Name: {lobbyName}</p>
      <p className="lobby-max">
        Slots: {players.length}/{maxParticipants}
      </p>
      <p className="lobby-date">
        Created at <Moment format="YYYY/MM/DD">{date}</Moment>
      </p>
      <p className="lobby-desc">Desc: {description}</p>
    </div>
    <Link to={`/lobby/${_id}`} className="btn btn-primary">
      Join Lobby
    </Link>
  </div>
);

LobbyItem.propTypes = {
  lobby: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  joinLobby: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { joinLobby })(LobbyItem);
