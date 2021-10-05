import React, { useState, useEffect } from 'react';

const Game = () => {
  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [phase, setPhase] = useState('');

  const ROLES = ['villager', 'wolf', 'prophet'];
  const players = [];
  const alivedPlayers = [];
  const RIP = [];

  useEffect(() => {
    //Random role for players
  }, []);

  const playerHandler = (playerRole) => {
    //check phase
    //players perform actions in a loop checking wolf number and human number
    //If it's day phase
    //Chatting in 60s
    //Voting in 30s (has skip options)
    // if it's night phase
    //Perform actions from specific roles
    //Prophet can choose the player in alivePlayer[] to know what is the chosen player's role
    //Wolf can choose player in alivedPlayer[] to eat
    //Player that die will be moved to RIP[]
    //Return to day phase
    //Game end when wolf number >= human number || wolf number = 0
  };

  return <div></div>;
};

export default Game;
