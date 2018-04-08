var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var Player = require('./static/player');
var Item = require('./static/item');
var Collision = require('./static/collides');
var Maze = require('./static/maze');


var idCounter = 0; // idCounter. Replace with server gen ID later.

/************ Set of data used throughout the game ******************/
var gameState = {};
var players = []; // list of players
var items = [];
var team1 = []; // list of players in each team
var team2 = [];
var maze = Maze.returnPath();
/******************************************************************/

app.use(express.static(path.join(__dirname,'static')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'/views/index.html'));
});

io.on('connection', function(socket) {
    // For now: Only the first time: on first connection, place the items
    if (idCounter == 0) {
        for (var i = 0; i < 5; i++) {
            potion = new Item('Potion');
            ammo = new Item('Ammo');
            items.push(potion);
            items.push(ammo);
        }
    }

    var id = idCounter;
    idCounter += 1;
    var player = new Player(id); // current player
    players.push(player);
    console.log('a user connected with id ' + id);
    console.log('There are now '+players.length+' player(s) in the room');

    socket.emit('onconnected', {id: id}); // send the client their server id 

    socket.on('move', function(direction) {
        // update game state based off new input

        // Maze collision here
        player.move(direction, 1, maze);
        var i;
        for (i = 0; i < items.length; i++) {  
            if (Collision.collides(player, items[i])) {
                console.log('Collision detected');
                items[i].use(player);
                break;
            }
        }
        items.splice(i,1); // 
        gameState.players = players;
        gameState.items = items;
        
        // send 
        gameState.maze = maze;

        io.emit('newGameState', gameState); // tell all players the new game state
        
    });

    socket.on('disconnect', function() {
        var i;
        for (i = 0; i < players.length; i++) {
            if (id == players[i].id) {
                // players[i].connected = false; // to let player reconnect later possibly? 
                break;
            }
        }
        players.splice(i,1); // delete the player from the list
        console.log('user '+id+' disconnected. There are '+players.length+' remaining player(s)');
    });

    // Send to client (movePlayers.js) - the # of people in each team
    io.emit('peopleInTeam', [team1.length, team2.length]);    

    // When one user selects a team
    socket.on('teamSelection', function(teamNum) { // receives info - from movePlayers.js
        console.log("teamSelection");
        if (teamNum == 1) { // If player selected team 1
            if (team1.length == 2) { // Check if this selection is valid. If not, send a message
                socket.emit('validChoice', false);
                socket.emit('message', "You can't enter Team1: it already has 2 players");
            }
            else { // Update players info
                player.teamNumber = teamNum;
                team1.push(player);
                socket.emit('validChoice', true);
                socket.emit('peopleInTeam', [team1.length, team2.length]);
            }
        }
        if (teamNum == 2) { // If player selected team 2
            if (team2.length == 2) {
                socket.emit('validChoice', false);
                socket.emit('message', "You can't enter Team2: it already has 2 players");
            }
            else {
                player.teamNumber = teamNum;
                team2.push(player);
                socket.emit('validChoice', true);
                socket.emit('peopleInTeam', [team1.length, team2.length]);
            }
        }
        // Check if there are 2 players are in each team - ready to start
        if ((team1.length === 2) && (team2.length === 2)) {
            io.emit('canStartGame', true);
        }
        else {
            io.emit('canStartGame', false);
        }
    });
});

var SERVPORT = 8080;
server.listen(SERVPORT,'0.0.0.0', function () {
  console.log('App listening on port ' + SERVPORT);
});