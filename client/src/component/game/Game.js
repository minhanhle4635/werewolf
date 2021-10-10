import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import shuffleArray from '../../utils/shuffleArray';
import io from 'socket.io-client';
const ROLES = [
  'villager',
  'villager',
  'villager',
  'villager',
  'villager',
  'villager',
  'villager',
  'villager',
  'wolf',
  'prophet',
];

let socket;

const ENDPOINT = 'http://localhost:5000';
//const ENDPOINT = ''

const Game = ({ lobby: { lobby, loading } }) => {
  //initial socket State
  const [gameOver, setGameOver] = useState(true);
  const [roomFull, setRoomFull] = useState(false);
  const [room, setRoom] = useState(lobby);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const connectionOptions = {
      forceNew: true,
      reconnectionAttempts: 'Infinity',
      timeout: 10000,
      transports: ['websocket'],
    };

    socket = io.connect(ENDPOINT, connectionOptions);

    socket.emit('join', { room: room }, (error) => {
      if (error) setRoomFull(true);
    });

    return function cleanup() {
      socket.emit('disconnect');
      socket.off();
    };
  }, [room]);

  //initial GameState
  const [phase, setPhase] = useState('DAY');
  const [allPlayers, setAllPlayers] = useState([]);
  const [humans, setHumans] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [wolves, setWolves] = useState([]);
  const [allAlivePlayers, setAllAlivePlayers] = useState([]);
  const [player, setPlayer] = useState({
    id: null,
    avatar: '',
    name: '',
    role: '',
    votes: 0,
  });

  const [isChatBoxHidden, setChatBoxHidden] = useState(true);
  //run once
  useEffect(() => {
    //push all players into allPlayers Array
    lobby.players.map((player) => allPlayers.push(player));

    //intial State of every player inside allPlayers array
    allPlayers.map((player) =>
      setPlayer({
        id: player.id,
        avatar: player.avatar,
        name: player.name,
        role: '',
      })
    );

    //shuffle all roles
    const shuffledRoles = shuffleArray(ROLES);
    console.log(shuffledRoles);

    //Provide role for each player
    for (var i = 0; i <= 10; i++) {
      var givenRole = shuffledRoles.splice(
        Math.floor(Math.random() * shuffledRoles.length),
        1
      );
      allPlayers[i].role = givenRole[0];
    }

    //Split Human and Wolf
    allPlayers.map((player) => {
      player.role !== 'wolf' ? humans.push(player.id) : wolves.push(player.id);
    });

    //A Join array for 2 factions
    const allAlivePlayers = [...humans, ...wolves];

    //send initial State to server
    socket.emit('initGameState', {
      gameOver: false,
      phase: 'DAY',
      allPlayers: [...allPlayers],
      humans: [...humans],
      wolves: [...wolves],
      allAlivePlayers: [...allAlivePlayers],
      graveyard: [...graveyard],
    });
  }, [allPlayers, graveyard, humans, lobby.players, wolves]);

  useEffect(() => {
    //receive initial Game State
    socket.on(
      'initGameState',
      ({
        gameOver,
        phase,
        allPlayers,
        humans,
        wolves,
        allAlivePlayers,
        graveyard,
      }) => {
        setGameOver(gameOver);
        setPhase(phase);
        setAllPlayers(allPlayers);
        setHumans(humans);
        setWolves(wolves);
        setAllAlivePlayers(allAlivePlayers);
        setGraveyard(graveyard);
      }
    );
    //receive update Game State
    socket.on(
      'updateGameState',
      ({ gameOver, phase, allAlivePlayers, graveyard }) => {
        gameOver && setGameOver(gameOver);
        phase && setPhase(phase);
        allAlivePlayers && setAllAlivePlayers(allAlivePlayers);
        graveyard && setGraveyard(graveyard);
      }
    );
    //receive messages
    socket.on('message', (message) => {
      setMessages((messages) => [...messages, message]);

      const chatBody = document.querySelector('.chat-body');
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }, []);

  //FUNCTIONS
  //Check Game Over
  const checkGameOver = (allAlivePlayers) => {
    const wolves = [];
    const humans = [];
    for (let i = 0; i < allAlivePlayers.length; i++) {
      if (allAlivePlayers[i].role === 'wolf') {
        wolves.push(allAlivePlayers[i]);
      } else {
        humans.push(allAlivePlayers[i]);
      }
    }
    if (humans.length > wolves.length && wolves.length > 0) return false;
  };

  //Toggle ChatBox
  const toggleChatBox = () => {
    const chatBody = document.querySelector('.chat-body');
    if (isChatBoxHidden) {
      chatBody.style.display = 'block';
      setChatBoxHidden(false);
    } else {
      chatBody.style.display = 'none';
      setChatBoxHidden(true);
    }
  };

  //Send messages
  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit('sendMessage', { message: message }, () => {
        setMessage('');
      });
    }
  };

  //prophet function
  const prophetHandler = (id) => {
    for (var i = 0; i < allAlivePlayers.length; i++) {
      if (allAlivePlayers[i].role === 'prophet') {
        const choosenPlayerId = id;
        for (var j = 0; j < allAlivePlayers.length; j++) {
          if (allAlivePlayers[j].id === choosenPlayerId) {
            const choosenPlayer = allAlivePlayers[j];
            alert(
              'Player: ' + choosenPlayer.name + 'is a' + choosenPlayer.role
            );
          }
        }
      }
    }
  };
  //wolf function
  const wolvesHandler = (id) => {
    for (var x = 0; x < allAlivePlayers.length; x++) {
      if (allAlivePlayers[x].role === 'wolf') {
        const choosenHumanId = id;
        for (var y = 0; y < allAlivePlayers.length; y++) {
          if (allAlivePlayers[y].id === choosenHumanId) {
            const choosenHuman = allAlivePlayers[y];
            allAlivePlayers.splice(y, 1);
            // allAlivePlayers.filter((player) => player.id !== choosenHumanId);
            graveyard.push(choosenHuman);
          }
        }
      }
    }
    socket.emit('updateGameState', {
      gameOver: checkGameOver(allAlivePlayers),
      phase: 'DAY',
      allAlivePlayers: [...allAlivePlayers],
      graveyard: [...graveyard],
    });
  };
  //voting function
  const votingFunction = (id) => {
    //Add vote to VOTING array
    const VOTING = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < allAlivePlayers.length; i++) {
      if (allAlivePlayers[i].id === id) {
        VOTING[i] = VOTING[i] + 1;
      } else {
        //Skipped vote
        VOTING[10] = VOTING[10] + 1;
      }
    }

    //Compare player's vote in array and add most voted player to graveyard
    const indexOfVotedPlayer = VOTING.indexOf(Math.max(...VOTING));
    for (var j = 0; j < allAlivePlayers.length; j++) {
      if (allAlivePlayers.indexOf(allAlivePlayers[j]) === indexOfVotedPlayer) {
        const mostVotedPlayer = allAlivePlayers[j];
        allAlivePlayers.splice(j, 1);
        graveyard.push(mostVotedPlayer);
      } else {
        alert('No on die in this voting session');
      }
    }

    socket.emit('updateGameState', {
      gameOver: checkGameOver(allAlivePlayers),
      phase: 'NIGHT',
      allAlivePlayers: [...allAlivePlayers],
      graveyard: [...graveyard],
    });
  };

  return phase === 'DAY' ? (
    // Must have choosenPlayer and choosenHuman
    <Fragment>
      Phase: {phase}
      {allPlayers.map((player) => (
        <div>{player}</div>
      ))}
      {/* Time to chat, end after 60s */}
      <div timeout="60000"> Time for discussion </div>
      {/* Time to vote, end after 60s */}
      <div timeout="60000">
        <h3>Time for Voting</h3>
        <form onSubmit={(e) => votingFunction(e.target.value)}>
          <select>
            {allAlivePlayers.map((player) => (
              <option value={player.id}>{player.name}</option>
            ))}
            <option value="skipped">Skip</option>
          </select>
          <button type="submit">Vote</button>
        </form>
      </div>
      {/* Chatting */}
      <div className="chatBoxWrapper">
        <div className="chat-box chat-box-player1">
          <div className="chat-head">
            <h2>Chat Box</h2>
            {!isChatBoxHidden ? (
              <span onClick={toggleChatBox} class="material-icons">
                keyboard_arrow_down
              </span>
            ) : (
              <span onClick={toggleChatBox} class="material-icons">
                keyboard_arrow_up
              </span>
            )}
          </div>
          <div className="chat-body">
            <div className="msg-insert">
              {messages.map((msg) => {
                if (msg.user === 'Player 2')
                  return <div className="msg-receive">{msg.text}</div>;
                if (msg.user === 'Player 1')
                  return <div className="msg-send">{msg.text}</div>;
              })}
            </div>
            <div className="chat-text">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyPress={(event) =>
                  event.key === 'Enter' && sendMessage(event)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  ) : (
    <Fragment>
      Phase: {phase}
      {allPlayers.map((player) => (
        <div>{player}</div>
      ))}
      {/* Time for prophet's action, end after 60s */}
      <div timeout="60000">
        <form onSubmit={(e) => prophetHandler(e.target.value)}>
          <select>
            {allAlivePlayers.map((player) => (
              <option value={player.id}>{player.name}</option>
            ))}
          </select>
          <button type="submit">Choose</button>
        </form>
      </div>
      {/* Time for wolves's action, end after 60s */}
      <div timeout="60000">
        <form onSubmit={(e) => wolvesHandler(e.target.value)}>
          <selec>
            {allAlivePlayers.map(
              (player) =>
                player.role !== 'wolf' && (
                  <option value={player.id}>{player.name}</option>
                )
            )}
          </selec>
          <button type="submit">Kill</button>
        </form>
      </div>
    </Fragment>
  );
};

Game.propsTypes = {
  lobby: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  lobby: state.lobby,
});

export default connect(mapStateToProps, {})(Game);
