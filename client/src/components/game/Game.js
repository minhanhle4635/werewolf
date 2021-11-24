import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGameInformation } from '../../actions/game';
import GameItem from './GameItem';
import Spinner from '../layout/Spinner';
import io from 'socket.io-client';

let socket = io('http://localhost:5000');

/**
 * 1. call API getGameInformation -> update state -> continue play
 *    cons: must ensure checking state and API run first if not exist state
 *
 * 2. Not have state -> redirect user to room/:id -> then getGameInformation
 *    -> then redirect to game/:id
 *    cons: User jump 3 times, kinda annoying
 *
 * GOAL: ensure to have gameInfo to play!
 */
const Game = ({ game: { gameState, gameId, loading }, getGameInformation }) => {
  console.log(gameId);

  useEffect(() => {
    if (!gameState) {
      getGameInformation(gameId);
    }
  }, []);
  // if (!gameInfo) {
  //   await updateStateGameInfo();
  // }
  // OK we got game info (even after page reload)
  return loading || gameState === null ? <Spinner /> : <GameItem />;
};

Game.propTypes = {
  game: PropTypes.object.isRequired,
  getGameInformation: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  game: state.game,
});

export default connect(mapStateToProps, { getGameInformation })(Game);
