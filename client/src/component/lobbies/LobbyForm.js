import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createLobby } from '../../actions/lobby';
// import Select from 'react-select';

//options setting
// const options = [
//   { value: 10, label: '10' },
//   { value: 15, label: '15' },
// ];

const LobbyForm = ({ createLobby }) => {
  const [formData, setFormData] = useState({
    lobbyName: '',
    description: '',
    maxParticipants: 10,
    privacyStatus: 'Public',
    password: '',
  });

  const { lobbyName, description, maxParticipants, privacyStatus, password } =
    formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    createLobby(formData);
  };

  return (
    <div className="post-form">
      <div className="bg-primary p">
        <h3>Creating new Lobby</h3>
      </div>
      <form className="form my-1" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group">
          Name:
          <input
            type="text"
            name="lobbyName"
            value={lobbyName}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className="form-group">
          Max number of participants:
          <select
            name="maxParticipants"
            value={parseInt(maxParticipants)}
            onChange={(e) => onChange(e)}
            required
          >
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>
        <div className="form-group">
          Description:
          <textarea
            name="description"
            value={description}
            onChange={(e) => onChange(e)}
          />
        </div>
        <div className="form-group">
          Privacy Status: {privacyStatus}
          <select
            name="privacyStatus"
            value={privacyStatus}
            onChange={(e) => onChange(e)}
            required
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          {privacyStatus === 'Private' && (
            <div className="form-group">
              Password
              <input
                type="text"
                name="password"
                value={password}
                onChange={(e) => onChange(e)}
              />
            </div>
          )}
        </div>
        <input type="submit" className="btn btn-dark my-1" value="Submit" />
      </form>
    </div>
  );
};

LobbyForm.propTypes = {
  createLobby: PropTypes.func.isRequired,
};

export default connect(null, { createLobby })(LobbyForm);
