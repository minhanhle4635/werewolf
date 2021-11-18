const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

//connect to db
connectDB();

//Init middleware
app.use(express.json({ extended: false }));

//setup socket
let http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// Socket is the fuckin client
// socket will emit event, which is why we have to listen it
io.on('connection', (socket) => {
  /**
   * Create room event (emit from client)
   */
  socket.on('CREATE_ROOM', (roomInformation) => {
    socket.join(roomInformation._id);
  });

  /**
   * Join room event
   * client join
   */
  socket.on('JOIN_ROOM', ({ roomInformation, userJoined }) => {
    socket.join(roomInformation._id);
    io.to(roomInformation._id).emit('USER_JOINED', userJoined);
  });

  /**
   * Join room event
   * client join
   */
  socket.on('RE_JOIN_ROOM', ({ roomInformation, userJoined }) => {
    io.to(roomInformation._id).emit('USER_RE_JOINED', userJoined);
  });

  /**
   * Leave room event
   * client leave
   * socket.leave(room._id, user);
   */
  socket.on('LEAVE_ROOM', ({ roomInformation, userLeave }) => {
    if (roomInformation.owner === userLeave._id) {
      // this user is the owner, we need to discard this room.
      messageReturn = 'This room is now disbanded.';
      io.to(roomInformation._id).emit('DISBAND_ROOM', null);
    } else {
      socket.to(roomInformation._id).emit('USER_LEAVE', userLeave);
    }
    socket.leave(roomInformation._id);
  });
});

//Define Route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/room', require('./routes/api/room'));
app.use('/api/game', require('./routes/api/game'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} `));
