import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getLobbies } from '../../actions/lobby';
import Spinner from '../layout/Spinner';
import LobbyItem from './LobbyItem';

const Lobbies = ({ getLobbies, lobbies: { lobbies, loading } }) => {
  useEffect(() => {
    getLobbies();
  }, [getLobbies]);
  return loading ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className="large text-primary">Lobby</h1>
      <p className="lead">
        <i className="fas fa-user" /> Choose Room to join
      </p>
      <div className="btn btn-light">
        <Link to="/create_room"> Create Room </Link>
      </div>
      <div className="posts">
        {lobbies.map((lobby) => (
          <LobbyItem key={lobby._id} lobby={lobby} />
        ))}
      </div>
    </Fragment>
  );
};

Lobbies.propTypes = {
  getLobbies: PropTypes.func.isRequired,
  lobbies: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  lobbies: state.lobby,
});

export default connect(mapStateToProps, { getLobbies })(Lobbies);
