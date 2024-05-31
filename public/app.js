const squares = Array(9).fill(-1);
const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const cells = document.getElementsByClassName('cell');
const resetButton = document.getElementById('reset');
const form = document.getElementById('form');
const content = document.getElementById('content');
const usernameInput = document.getElementById('username');
const you = document.getElementById('you');
const opponentTag = document.getElementById('opponent');
const playingAs = document.getElementById('playingAs');
const turnDisplay = document.getElementById('turn');
const loading = document.getElementById('loading');

let currentPlayer = 1;
let playerNumber;
let playerName;
let opponentName;

const socket = io();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    playerName = usernameInput.value;
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    socket.emit('joinGame', playerName);
    document.body.classList.add('show-loading', 'hide-form');
});

socket.on('playerNumber', (number) => {
    playerNumber = number;
    playingAs.innerText = `You are playing as ${playerNumber === 1 ? 'X' : 'O'}`;
});

socket.on('startGame', (opponent) => {
    opponentName = opponent;
    you.innerText = `You: ${playerName}`;
    opponentTag.innerText = `Opponent: ${opponentName}`;
    document.body.classList.remove('show-loading');
    content.style.display = 'block';
    turnDisplay.innerText = `Turn: ${currentPlayer === 1 ? 'X' : 'O'}`;
});

socket.on('click', (data) => {
    squares[data.number] = data.player;
    const box = document.getElementById(`cell${data.number}`);
    box.innerText = data.player === 1 ? 'X' : 'O';
    box.classList.add('changed');
    currentPlayer = data.player === 1 ? 2 : 1;
    turnDisplay.innerText = `Turn: ${currentPlayer === 1 ? 'X' : 'O'}`;
    checkWin();
});

const handleClick = (number, event) => {
    if (playerNumber !== currentPlayer) {
        alert("It's not your turn!");
        return;
    }
    
    const box = event.target;
    if (box.classList.contains('changed')) {
        return;
    }
    
    socket.emit('click', { player: currentPlayer, number: number });
    squares[number] = currentPlayer;
    box.innerText = currentPlayer === 1 ? 'X' : 'O';
    box.classList.add('changed');
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    turnDisplay.innerText = `Turn: ${currentPlayer === 1 ? 'X' : 'O'}`;
    checkWin();
};

const checkWin = () => {
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] !== -1 && squares[a] === squares[b] && squares[a] === squares[c]) {
            alert(`Player ${squares[a] === 1 ? 'X' : 'O'} wins!`);
            reset();
            return;
        }
    }
    if (!squares.includes(-1)) {
        alert('It\'s a draw!');
        reset();
    }
}

const reset = () => {
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('changed');
    }
    squares.fill(-1);
    currentPlayer = 1;
    turnDisplay.innerText = `Turn: X`;
    socket.emit('reset');
}

resetButton.addEventListener('click', reset);

socket.on('reset', () => {
    reset();
});
