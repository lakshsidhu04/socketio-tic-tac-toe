const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

let waitingPlayer = null;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('user logged in with id ' + socket.id);

    socket.on('joinGame', (name) => {
        socket.playerName = name;
        if (waitingPlayer === null) {
            waitingPlayer = socket;
            socket.emit('playerNumber', 1);
        } else {
            socket.emit('playerNumber', 2);
            waitingPlayer.emit('startGame', socket.playerName);
            socket.emit('startGame', waitingPlayer.playerName);
            waitingPlayer = null;
        }
    });
    
    socket.on('click', (data) => {
        io.emit('click', data);
    });

    socket.on('reset', () => {
        io.emit('reset');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected with id ' + socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
