const express = require('express');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

//Connect DB
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

//Socket.io setup
const http = require('http');
const { addPlayer, getPlayersInRoom, removePlayer } = require('./players');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.on('join', (payload, callback) => {
    for (var i = 0; i < payload.players.length; i++) {
      const { error, newPlayer } = addPlayer({
        id: socket.id,
        playerId: payload.players[i].id,
        name: payload.players.map((player) => {
          player.id === playerId && player.name;
        }),
        room: payload.lobbyId,
      });
      if (error) return callback(error);
      socket.join(newPlayer.room);
    }
    io.to(newPlayer.room).emit('roomData', {
      room: newPlayer.room,
      players: getPlayersInRoom(newPlayer.room),
    });

    socket.emit('currentUserData', { name: newPlayer.name });
    callback();
  });

  socket.on('initGameState', (gameState) => {
    const player = getPlayer(socket.id);
    if (player) io.to(player.room).emit('initGameState', gameState);
  });

  socket.on('updateGameState', (gameState) => {
    const player = getPlayer(socket.id);
    if (player) io.to(player.room).emit('updateGameState', gameState);
  });

  socket.on('sendMessage', (payload, callback) => {
    const player = getPlayer(socket.id);
    io.to(player.room).emit('message', {
      player: player.name,
      text: payload.message,
    });
    callback();
  });

  socket.on('disconnect', () => {
    const player = removePlayer(socket.id);
    if (player)
      io.to(player.room).emit('roomData', {
        room: player.room,
        players: getPlayersInRoom(player.room),
      });
  });
});

//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/lobby', require('./routes/api/lobby'));

//Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  //Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
