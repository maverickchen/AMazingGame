var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var Player = require('./static/player');


var idCounter = 0; // idCounter. Replace with server gen ID later.
var players = []; // list of players
var team1 = []; // list of players in each team
var team2 = [];

app.use(express.static(path.join(__dirname,'static')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname,'/views/index.html'));
});

io.on('connection', function(socket) {
    var id = idCounter;
    idCounter += 1;
    var player = new Player(id); // current player
    players.push(player);
    console.log('a user connected with id ' + id);
    console.log('There are now '+players.length+' player(s) in the room');

    socket.emit('onconnected', {id: id}); // send the client their server id 


    socket.on('move', function(direction) {
        // console.log('Input received from player '+id+': '+direction);
        player.move(direction,1); // update game state based off new input
        io.emit('newGameState', players); // tell all players the new game state
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

    // When one user selects a team
    socket.on('teamSelection', function(teamNum) {
        // Check if this selection is valid
        if ((teamNum1 == 1) && (team1.length == 2)) {
            io.emit('message', "You can't enter Team1: it already has 2 players");
        }
        // Update players info
        player.teamNumber = teamNum;
        if (teamNum == 1) team1.push(player);
        if (teamNum == 2) team2.push(player);

        // Send client # of people in each team
        io.emit('peopleInTeam', players);
    })
});

var SERVPORT = 8080;
server.listen(SERVPORT,'0.0.0.0', function () {
  console.log('App listening on port ' + SERVPORT);
});