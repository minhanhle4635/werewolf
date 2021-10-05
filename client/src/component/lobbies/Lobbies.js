import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getLobbies } from '../../actions/lobby';
import Spinner from '../layout/Spinner';
import LobbyItem from './LobbyItem';

const Lobbies = ({ getLobbies, lobby: { lobbies, loading } }) => {
  useEffect(() => {
    getLobbies();
  }, [getLobbies]);
  return loading ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className="large text-primary">Lobbies</h1>
      <p className="lead">
        <i className="fas fa-user" /> Choose lobby to join
      </p>
      {/*<LobbyForm />*/}
      <div className="lobbies">
        {lobbies.map((lobby) => (
          <LobbyItem key={lobby._id} lobby={lobby} />
        ))}
      </div>
    </Fragment>
  );
};

Lobbies.propTypes = {
  getLobbies: PropTypes.func.isRequired,
  lobby: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
});

export default connect(mapStateToProps, { getLobbies })(Lobbies);
