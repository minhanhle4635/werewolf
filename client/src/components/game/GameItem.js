import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGameInformation, submitVote } from '../../actions/game';

const GameItem = ({ submitVote, game: { gameState, vote }, auth }) => {
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
      <div className="flex h-full w-full">
        <div className="flex-1">
          <div className="flex items-center p-1 justify-between h-12 w-full">
            <div className="px-2 flex items-center justify-center border-2 border-green-600 h-10 w-30">
              Player alive: 10
            </div>
            <div className="px-2 flex items-center justify-center border-2 border-green-600 h-10 w-16">
              Exit
            </div>
          </div>
          <div className="flex h-full w-full p-1">
            {players.map((player) => (
              <div>
                <img
                  className="w-40 h-40 rounded-full"
                  src={player.avatar}
                  alt=""
                />
                {auth && auth.user && auth.user._id === player._id ? (
                  playerStatus[player._id] === 'ALIVE' ? (
                    <div className="font-bold text-center">{player.name}</div>
                  ) : (
                    <div className="font-bold text-center opacity-25">
                      {player.name}
                    </div>
                  )
                ) : (
                  <div className="text-center">{player.name}</div>
                )}

                <div>{playerStatus[player._id]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-80">
          <h3 className="">Phase: {phase}</h3>
          <h3>Turn: {turn}</h3>
          <div>25s</div>
          <div>{roles}</div>
          <div>
            {vote ? (
              <div>Your vote has been submited</div>
            ) : (
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
                          .filter(
                            (player) => playerStatus[player._id] === 'ALIVE'
                          )
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
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

GameItem.propTypes = {
  game: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  submitVote: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  game: state.game,
  auth: state.auth,
});

export default connect(mapStateToProps, { submitVote })(GameItem);
