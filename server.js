const express = require('express');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();

//Connect DB
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API running'));

//Socket.io setup
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
  console.log('co nguoi ket noi');
});

//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/lobby', require('./routes/api/lobby'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
