import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const homepage = (props) => {
  return (
    <Fragment>
      <div className="flex w-full h-full justify-center items-center bg-homepage-cover bg-no-repeat bg-cover">
        <div className="border-2 border-purple-700 bg-purple-200">
          <div>
            <button className="block p-2 m-4 w-80 cursor-pointer text-white bg-yellow-800 rounded shadow">
              <Link to="/lobbies">Find Room</Link>
            </button>
          </div>
          <div>
            <button className="block p-2 m-4 w-80 cursor-pointer text-white bg-yellow-800 rounded shadow">
              <Link to="/create_room">Create a new Room</Link>
            </button>
          </div>
          <div>
            <button className="block p-2 m-4 w-80 cursor-pointer text-white bg-yellow-800 rounded shadow">
              <Link to="/profile/:id">My Profile</Link>
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

homepage.propTypes = {};

export default homepage;
