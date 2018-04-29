var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var Player = require('./static/player');
var Item = require('./static/item');
var Updates = require('./serverUpdates');

var generator = require('generate-maze');
var converter = require('./convertMaze');
const width = 8;

var idCounter = 0; // idCounter. Replace with server gen ID later.
var physicsLoop;
var updateClientsLoop;

/************ Set of data used throughout the game ******************/
var gameInProgress = false;
var gameState = {};
var clientSockets = {}; // dictionary mapping player id to socket
var players = {}; // dictionary mapping player id to player
var maze = converter.convertMaze(generator(width)); // gen maze of dimension width * width
var items = [];
var team1 = []; // list of players in each team
var team2 = [];
/******************************************************************/

function initItems() {
    var pathCount = 0;
    for (var i=0; i<maze.length; i++) {
        for (var j=0; j<maze.length; j++) {
            if (maze[i][j] === 1) pathCount++;
        }
    }
    var itemNum = Math.floor(pathCount * 0.25);
    console.log(itemNum);
    for (var i = 0; i < itemNum; i++) {
        potion = new Item('Potion', maze);
        ammo = new Item('Ammo', maze);
        items.push(potion);
        items.push(ammo);
    }
}
app.use(express.static(path.join(__dirname,'static')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'/views/index.html'));
});

io.on('connection', function(socket) {
    var player;
    var id = idCounter;
    idCounter += 1;

    socket.emit('onconnected', {id: id}); // send the client their server id 

    socket.on('move', function(direction) {
        // store the input to be processed in the physics loop later
        // (See serverUpdates.js: updatePhysics)
        if (player) {
            player.inputs.push(direction);
        }
    });

    socket.on('disconnect', function() {
        for (var i = 0; i < team1.length; i++) {
            if (team1[i].id == id) {
                team1.splice(i,1);
                break;
            }
        }
        for (var j = 0; j < team2.length; j++) {
            if (team2[j].id == id) {
                team2.splice(j,1);
                break;
            }
        }
        if (players[id]) delete players[id];
        if (clientSockets[id]) delete clientSockets[id];
    });

    // Send to client (client.js) - the # of people in each team
    io.emit('peopleInTeam', [team1.length, team2.length]);    
    
    // When one user selects a team
    socket.on('teamSelection', function(teamNum) { // receives info - from client.js
        if (teamNum == 1) { // If player selected team 1
            if (team1.length == 2) { // Check if this selection is valid. If not, send a message
                socket.emit('validChoice', false);
                socket.emit('message', "You can't enter Team1: it already has 2 players");
            }
            else { // Update players info
                player = new Player(id, teamNum, maze); // current player
                team1.push(player);
                players[id] = player; // player successfully added to player roster
                clientSockets[id] = socket; // subscribe client socket to server updates
                if (gameInProgress) {
                    joinGame(id);
                    return;
                }
                if ((team1.length === 2) && (team2.length === 2)) {
                    if (!gameInProgress) startGame();
                } else {
                    socket.emit('validChoice', true);
                    io.emit('peopleInTeam', [team1.length, team2.length]);
                }
            }
        }
        if (teamNum == 2) { // If player selected team 2
            if (team2.length == 2) {
                socket.emit('validChoice', false);
                socket.emit('message', "You can't enter Team2: it already has 2 players");
            }
            else {
                player = new Player(id, teamNum, maze); // current player
                team2.push(player);
                players[id] = player; // player successfully added to game roster
                clientSockets[id] = socket; // add client socket to server updates
                if (gameInProgress) {
                    joinGame(id);
                    return;
                }
                if ((team1.length === 2) && (team2.length === 2)) {
                    if (!gameInProgress) startGame();
                } else {
                    socket.emit('validChoice', true);
                    io.emit('peopleInTeam', [team1.length, team2.length]);
                }
            }
        }
    });
});


function onGameOver() {
    if (gameInProgress) {
        gameInProgress = false;
        // clear game loops
        if (physicsLoop) clearInterval(physicsLoop);
        if (updateClientsLoop) clearInterval(updateClientsLoop);
        // reinitialize model data
        players = {};
        clientSockets = {};
        items = [];
        team1 = [];
        team2 = [];
        maze = converter.convertMaze(generator(width));
        io.emit('peopleInTeam', [team1.length, team2.length]);
    }
}

function startGame() {
    gameInProgress = true;
    initItems();
    this.players = players;
    this.team1 = team1;
    this.team2 = team2;
    this.items = items;
    this.maze = maze;
    this.clientSockets = clientSockets;

    initialGameState = {};
    initialGameState.players = players;
    initialGameState.items = []; // for now send nothing
    initialGameState.maze = maze;
    initialGameState.t = new Date().getTime();

    io.emit('canStartGame', initialGameState);
    physicsLoop = setInterval(Updates.updatePhysics.bind(this), 15);
    updateClientsLoop = setInterval(Updates.updateClients.bind(this), 45);
}


function joinGame(id) {
    this.players = players;
    this.team1 = team1;
    this.team2 = team2;
    this.items = items;
    this.maze = maze;
    this.clientSockets = clientSockets;

    initialGameState = {};
    initialGameState.players = players;
    initialGameState.items = []; // for now send nothing
    initialGameState.maze = maze;
    initialGameState.t = new Date().getTime();

    clientSockets[id].emit('canStartGame', initialGameState);
}

var SERVPORT = 8080;
server.listen(SERVPORT,'0.0.0.0', function () {
  console.log('App listening on port ' + SERVPORT);
});