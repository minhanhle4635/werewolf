import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const homepage = (props) => {
  return (
    <Fragment>
      <div className="container">
        <div className="landing-inner">
          <div className="buttons">
            <Link to="/lobbies">Find Room</Link>
          </div>
          <div className="buttons">
            <Link to="/create_room">Create a new Room</Link>
          </div>
          <div className="buttons">
            <Link to="/profile/:id">My Profile</Link>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

homepage.propTypes = {};

export default homepage;
