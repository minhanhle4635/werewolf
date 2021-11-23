import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGameInformation, submitVote } from '../../actions/game';

/**
 * useEffect a function to get room information when first access this screen.
 * if not having gameState then call getGameInformation()
 * TODO
 */
const GameItem = ({ submitVote, game: { gameState } }) => {
  const { _id, players, phase, turn, roles, playerStatus } = gameState;

  const [formData, setFormData] = useState({
    type: 'SKIP',
    targeted: null,
  });

  const { type, targeted } = formData;

  const onChange = (e) => {
    const selectValue = e.target.value;
    if (selectValue === 'SKIP') {
      setFormData({
        type: 'SKIP',
        targeted: null,
      });
    } else {
      setFormData({
        type: 'KILL',
        targeted: selectValue,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    console.log(
      players.filter((player) => playerStatus[player._id] === 'ALIVE')
    );
    submitVote(_id, formData);
  };

  return (
    <Fragment>
      <h3>Phase: {phase}</h3>
      <h3>Turn: {turn}</h3>
      <div>25s</div>
      <div>
        {players.map((player) => (
          <div>
            <img src={player.avatar} alt="" />
            <div>{player.name}</div>
            <div>{playerStatus[player._id]}</div>
          </div>
        ))}
        <div>{roles}</div>
      </div>
      <div>
        {phase === 'DAY' ? (
          <div>
            <form onSubmit={(e) => onSubmit(e)}>
              Villager Voting
              <select name="targeted" onChange={(e) => onChange(e)}>
                <option value="SKIP" defaultValue>
                  Skip
                </option>
                {players
                  .filter((player) => playerStatus[player._id] === 'ALIVE')
                  .map((player) => (
                    <option value={player._id}>{player.name}</option>
                  ))}
              </select>
              <button type="submit">Vote</button>
            </form>
          </div>
        ) : (
          <form>
            <div>Wolf Voting</div>
            <select></select>
          </form>
        )}
      </div>
    </Fragment>
  );
};

GameItem.propTypes = {
  game: PropTypes.object.isRequired,
  submitVote: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  game: state.game,
});

export default connect(mapStateToProps, { submitVote })(GameItem);
