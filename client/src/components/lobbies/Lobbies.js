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
      <section className="flex flex-col space-y-2">
        <h1 className="large text-primary">Lobby</h1>
        <p className="lead">
          <i className="fas fa-user" /> Choose Room to join
        </p>
        <div className="py-2 flex">
          <Link
            className="block p-2 cursor-pointer text-white bg-blue-600 rounded shadow"
            to="/create_room"
          >
            {' '}
            Create Room{' '}
          </Link>
        </div>
        <div className="flex flex-col space-y-2">
          {lobbies.map((lobby) => (
            <LobbyItem key={lobby._id} lobby={lobby} />
          ))}
        </div>
      </section>
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
