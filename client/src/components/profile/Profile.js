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
          <div className="mx-auto space-y-4 sm:w-96 md:w-8/12 lg:w-4/5 py-8">
            <div className="flex justify-between">
              <button>
                <Link to="/homepage">Back to HomePage</Link>
              </button>
              <button>
                {auth.isAuthenticated &&
                  auth.loading === false &&
                  auth.user._id === profile.user._id && (
                    <button>
                      <Link to="/edit-profile" className="btn btn-dark">
                        Edit Profile
                      </Link>
                    </button>
                  )}
              </button>
            </div>
            <div className="flex flex-col space-y-2 rounded p-2 shadow bg-white">
              <div className="text-sm items-center flex space-x-2 text-gray-600">
                <ProfileTop profile={profile} />
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
