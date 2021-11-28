import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Fragment } from 'react';
import { editProfile, getCurrentProfile } from '../../actions/profile';
import { Link, withRouter } from 'react-router-dom';

const EditProfile = ({
  profile: { profile, loading },
  editProfile,
  getCurrentProfile,
  history,
  match,
}) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    getCurrentProfile(match.params._id);

    setFormData({
      fullname: loading || !profile.fullname ? '' : profile.fullname,
      email: loading || !profile.email ? '' : profile.email,
      bio: loading || !profile.bio ? '' : profile.bio,
    });
  }, []);

  const { fullname, email, bio } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    editProfile(formData, match.params._id);
  };

  return (
    <Fragment>
      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            name="fullname"
            value={fullname}
            onChange={(e) => onChange(e)}
          />
          <small className="form-text">Your full name</small>
        </div>
        <div className="form-group">
          <textarea
            placeholder="A short bio of yourself"
            name="bio"
            value={bio}
            onChange={(e) => onChange(e)}
          ></textarea>
          <small className="form-text">Tell us a little about yourself</small>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => onChange(e)}
          />
        </div>

        <input type="submit" className="btn btn-primary my-1" />
        <Link className="btn btn-light my-1" to="/homepage">
          Go Back
        </Link>
      </form>
    </Fragment>
  );
};

EditProfile.propTypes = {
  editProfile: PropTypes.func.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
});

export default connect(mapStateToProps, { editProfile, getCurrentProfile })(
  withRouter(EditProfile)
);
