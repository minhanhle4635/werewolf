import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';
import { Link } from 'react-router-dom';
import ProfileTop from './ProfileTop';
import ProfileAbout from './ProfileAbout';

const Profile = ({
  getCurrentProfile,
  profile: { profile, loading },
  auth,
}) => {
  useEffect(() => {
    getCurrentProfile();
  }, []);

  return (
    <Fragment>
      {profile === null || loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <div className="flex w-full h-full bg-profile-cover bg-cover">
            <div className="flex">
              <div>
                <button className="bg-blue-400 border-blue-400 m-8 p-4 shadow-lg">
                  <Link to="/homepage" className="btn btn-light">
                    Back to HomePage
                  </Link>
                </button>
              </div>
              <div>
                {auth.isAuthenticated &&
                  auth.loading === false &&
                  auth.user._id === profile.user._id && (
                    <button className="bg-blue-400 border-blue-400 m-8 p-4 shadow-lg">
                      <Link to="/edit-profile" className="btn btn-dark">
                        Edit Profile
                      </Link>
                    </button>
                  )}
              </div>
              <div className="flex items-center">
                <div className="bg-gray-500 text-center p-20 flex m-10 text-white ">
                  <ProfileTop profile={profile} />
                </div>
                <ProfileAbout profile={profile} />
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profile.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps, { getCurrentProfile })(Profile);
