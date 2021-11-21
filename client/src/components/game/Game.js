import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGameInfo } from '../../actions/game';
import GameItem from './GameItem';
import Spinner from '../layout/Spinner';

const Game = ({ getGameInfo, match }) => {
  const gameStateStatic = {
    _id: '6199f1be92cd7533824401c4',
    players: ['6195806cc70f178f96b03b83', '61968ba069cb1a75b6832c2e'],
    phase: 'DAY',
    turn: 1,
    lobbyName: 'Lê Minh Anh',
    owner: '6195806cc70f178f96b03b83',
    date: '2021-11-20T16:02:56.035Z',
    description: '1231231231',
    maxParticipants: 10,
    status: 'PLAYING',
    __v: 1,
    playerStatus: {
      '6195806cc70f178f96b03b83': 'ALIVE',
      '61968ba069cb1a75b6832c2e': 'ALIVE',
    },
    roles: 'VILLAGER',
  };
  // useEffect(() => {
  //   getGameInfo(match.params.id);
  // }, []);

  // save first data to localStorage so that F5 wont lose data

  // get data from server

  //poll  vote
  return gameStateStatic === null ? <Spinner /> : <GameItem />;
};

Game.propTypes = {
  gameState: PropTypes.object.isRequired,
  getGameInfo: PropTypes.func.isRequired,
  gameStateStatic: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  game: state.game,
});

export default connect(mapStateToProps, { getGameInfo })(Game);
