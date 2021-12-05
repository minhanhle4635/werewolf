import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

const Landing = ({ isAuthenticated }) => {
  if (isAuthenticated) {
    return <Redirect to="/homepage" />;
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div className="mt-10">
        <h1 className="text-center font-bold">WereWolf Online</h1>
        <p className="lead">
          A survior game that you can play with your friend
        </p>
        <div className="flex h-20 justify-center items-center">
          <Link
            to="/register"
            className="w-24 hover:bg-gray-200 cursor-pointer text-center rounded py-2 px-3"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="ml-4 text-white hover:bg-blue-700 cursor-pointer bg-blue-600 w-24 shadow-md text-center rounded py-2 px-3"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
