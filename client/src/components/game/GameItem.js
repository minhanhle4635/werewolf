import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGameInfo, submitVote } from '../../actions/game';

const GameItem = ({ submitVote }) => {
  const gameStateStatic = {
    _id: '619a16977b117e747bf8694c',
    players: [
      {
        _id: '6195806cc70f178f96b03b83',
        name: 'MAL',
        avatar:
          '//www.gravatar.com/avatar/43b43a8ada1de62cfe086d89d883e38f?s=200&r=pg&d=mm',
      },
      {
        _id: '619a16707b117e747bf86941',
        name: 'guest2',
        avatar:
          '//www.gravatar.com/avatar/21644c1915ce7fe92823d4f3ac3ab75e?s=200&r=pg&d=mm',
      },
      {
        _id: '61968ba069cb1a75b6832c2e',
        name: 'ABC',
        avatar:
          '//www.gravatar.com/avatar/caa23f75efae3886bdbd6498acc3fb91?s=200&r=pg&d=mm',
      },
    ],
    phase: 'DAY',
    turn: 1,
    lobbyName: 'Lê Minh Anh',
    owner: '6195806cc70f178f96b03b83',
    date: '2021-11-21T09:44:59.275Z',
    description: '123123123',
    maxParticipants: 10,
    status: 'PLAYING',
    __v: 2,
    playerStatus: {
      '6195806cc70f178f96b03b83': 'ALIVE',
      '619a16707b117e747bf86941': 'ALIVE',
      '61968ba069cb1a75b6832c2e': 'ALIVE',
    },
    roles: 'WOLF',
  };
  const auth = {
    _id: '6195806cc70f178f96b03b83',
  };
  const { _id, players, phase, turn, roles, playerStatus } = gameStateStatic;

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

  useEffect(()=>{
    
  },[])

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
  gameState: PropTypes.object.isRequired,
  getGameInfo: PropTypes.func.isRequired,
  submitVote: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  gameState: state.gameState,
});

export default connect(mapStateToProps, { submitVote })(GameItem);
