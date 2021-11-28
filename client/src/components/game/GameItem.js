import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { endGame, submitVote, updateGameInfo } from '../../actions/game';
import { leaveLobby } from '../../actions/lobby';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
const GameItem = ({
  submitVote,
  game,
  auth,
  leaveLobby,
  endGame,
  updateGameInfo,
}) => {
  const { gameState, vote, gameOver } = game;
  const { _id, players, phase, turn, roles, playerStatus, turnTimeStamp } =
    gameState;

  const [countDown, setCountDown] = useState(0);
  const [runTimer, setRunTimer] = useState(false);

  //Một đoạn code lấy giờ trong timeStap ra
  //countDown = turnTimeStamp + 60s
  //

  useEffect(() => {
    let timerId;

    if (runTimer) {
      setCountDown(60 * 2);
      timerId = setInterval(() => {
        setCountDown((countDown) => countDown - 1);
      }, 1000);
    } else {
      clearInterval(timerId);
    }

    return () => clearInterval(timerId);
  }, [runTimer]);

  useEffect(() => {
    if (turnTimeStamp) {
      setRunTimer(true);
      setCountDown(60);
    }
    if (countDown < 0 && runTimer) {
      console.log('expired');
      setRunTimer(false);
      setCountDown(0);
    }
  }, [countDown, runTimer, turnTimeStamp]);

  const seconds = String(countDown % 60).padStart(2, 0);
  const minutes = String(Math.floor(countDown / 60)).padStart(2, 0);

  const [formData, setFormData] = useState({
    type: 'SKIP',
    targeted: null,
  });

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
    submitVote(_id, formData);
  };

  let socket = io('http://localhost:5000');

  useEffect(() => {
    socket.on('ABC', (room) => {
      debugger;
      updateGameInfo(room);
    });

    socket.on('GAME_END', (room) => {
      endGame();
    });
  }, []);

  return gameOver === false ? (
    <Fragment>
      <div className="flex h-full w-full">
        <div className="flex-1">
          <div className="flex items-center p-1 justify-between h-12 w-full">
            <div className="px-2 flex items-center justify-center border-2 border-green-600 h-10 w-30">
              Player alive:{' '}
              {
                players.filter((player) => playerStatus[player._id] === 'ALIVE')
                  .length
              }
            </div>
            <div>
              <Link to="/lobbies" onClick={(e) => leaveLobby(_id)}>
                <button className="px-2 flex items-center justify-center border-2 border-green-600 h-10 w-16">
                  Exit
                </button>
              </Link>
            </div>
          </div>
          {/* Change background between phase */}
          <div
            className={
              'flex flex-wrap items-start justify-start h-full w-full p-1 ' +
              (phase === 'DAY'
                ? 'bg-phase-day bg-cover'
                : 'bg-phase-night bg-cover')
            }
          >
            {game &&
              gameState &&
              players.map((player) => (
                <div
                  key={player._id}
                  className={
                    'flex flex-col p-4 rounded bg-gray-100 hover:shadow-lg shadow mr-4 border-2' +
                    (playerStatus[player._id] !== 'ALIVE'
                      ? 'opacity-20 border-red-500 cursor-not-allowed'
                      : '') +
                    (auth && auth.user && auth.user._id === player._id
                      ? ' border-blue-600'
                      : 'border-transparent')
                  }
                >
                  <img
                    className="w-40 h-40 rounded-full object-cover object-center"
                    src={player.avatar}
                    alt=""
                  />
                  <h1 className={'text-lg text-center mt-2 font-bold '}>
                    {player.name}
                  </h1>
                </div>
              ))}
          </div>
        </div>
        <div className="w-80">
          <div className="border-2 bg-gray-300">
            <h3>Phase: {phase}</h3>
          </div>
          <div className="border-2 bg-gray-300">
            <h3>Turn: {turn}</h3>
          </div>
          <div className="bg-red-400 border-2">
            Timer: {minutes} : {seconds}
          </div>
          <div className="border-2 bg-yellow-300">Your role: {roles}</div>
          <div className="text-center h-30 mb-5 items-center">
            {vote ? (
              <div>Your vote has been submited</div>
            ) : (
              <div>
                {phase === 'DAY' ? (
                  <div className="items-center">
                    <form onSubmit={(e) => onSubmit(e)}>
                      <div>Villager Voting</div>
                      <select
                        className="border-2"
                        name="targeted"
                        onChange={(e) => onChange(e)}
                      >
                        <option value="SKIP" defaultValue>
                          Skip
                        </option>
                        {auth &&
                          auth.user &&
                          players
                            .filter(
                              (player) =>
                                playerStatus[player._id] === 'ALIVE' &&
                                player._id !== auth.user._id
                            )
                            .map((player) => (
                              <option key={player._id} value={player._id}>
                                {player.name}
                              </option>
                            ))}
                      </select>
                      <button className="border-2" type="submit">
                        Vote
                      </button>
                    </form>
                  </div>
                ) : (
                  <form>
                    <div>Wolf Voting</div>
                    {players.find((player) =>
                      player.roles === 'WOLF' ? (
                        <div>
                          <select
                            className="border-2"
                            name="targeted"
                            onChange={(e) => onChange(e)}
                          >
                            <option value="SKIP" defaultValue>
                              Skip
                            </option>
                            {players
                              .filter(
                                (player) => playerStatus[player._id] === 'ALIVE'
                              )
                              .map((player) => (
                                <option key={player._id} value={player._id}>
                                  {player.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : (
                        <div>Waiting for night end</div>
                      )
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
          <div>Chat</div>
        </div>
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div>
        <div>
          {players.filter(
            (player) =>
              playerStatus[player._id] === 'ALIVE' &&
              roles[player._id] === 'WOLF'
          ) ? (
            players.filter((player) => roles[player._id] === 'WOLF') ? (
              <div>You win</div>
            ) : (
              <div>You lose</div>
            )
          ) : players.filter((player) => roles[player._id] !== 'WOLF') ? (
            <div>You win</div>
          ) : (
            <div>You lose</div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

GameItem.propTypes = {
  game: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  submitVote: PropTypes.func.isRequired,
  leaveLobby: PropTypes.func.isRequired,
  endGame: PropTypes.func.isRequired,
  updateGameInfo: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  game: state.game,
  auth: state.auth,
});

export default connect(mapStateToProps, {
  submitVote,
  leaveLobby,
  endGame,
  updateGameInfo,
})(GameItem);
