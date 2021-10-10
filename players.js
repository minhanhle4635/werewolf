const players = [];

const addPlayer = ({ id, playerId, name, room }) => {
  const numberOfPlayersInRoom = players.length;
  if (numberOfPlayersInRoom === 10) return { error: 'Room full' };

  const newPlayer = { id, playerId, name, room };
  players.push(newPlayer);
  return { newPlayer };
};

const removePlayer = (id) => {
  const removeIndex = players.findIndex((player) => player.id === id);

  if (removeIndex !== -1) return players.splice(removeIndex, 1)[0];
};

const getPlayer = (id) => {
  return players.find((player) => player.id === id);
};

const getPlayersInRoom = (room) => {
  return players.filter((player) => player.room === room);
};

module.exports = { addPlayer, removePlayer, getPlayer, getPlayersInRoom };
