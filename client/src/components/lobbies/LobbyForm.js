import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createLobby } from '../../actions/lobby';

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

  // const history = useHistory();
  // function handleClick() {
  //   history.push('/room/:id');
  // }

  return (
    <div className="flex  w-full h-full flex-col items-start justify-items-center p-8 space-y-2 bg-create-room-cover bg-cover">
      <div className="bg-primary mx-auto">
        <h3 className="text-2xl font-bold">Creating new Room</h3>
      </div>
      <form
        className="w-80 mx-auto bg-blue-800 p-4"
        onSubmit={(e) => onSubmit(e)}
      >
        <div className="text-white">
          Name:
          <input
            type="text"
            name="lobbyName"
            value={lobbyName}
            onChange={(e) => onChange(e)}
            requireds
          />
        </div>
        <div className="text-white">
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
        <div className="text-white">
          Description:
          <textarea
            name="description"
            value={description}
            onChange={(e) => onChange(e)}
          />
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
