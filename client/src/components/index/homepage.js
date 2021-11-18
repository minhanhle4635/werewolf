import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const homepage = (props) => {
  return (
    <Fragment>
      <Link to="/lobbies">Find Room</Link>
      <Link to="/create_room">Create a new Room</Link>
      <Link to="/profile/:id">My Profile</Link>
    </Fragment>
  );
};

homepage.propTypes = {};

export default homepage;
