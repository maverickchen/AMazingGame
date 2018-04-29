var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var Player = require('./static/player');
var Item = require('./static/item');
var Collision = require('./static/collides');
var Bullet = require('./static/bullet');
var Updates = require('./serverUpdates');

var generator = require('generate-maze');
var converter = require('./convertMaze');
const width = 3;

var idCounter = 0; // idCounter. Replace with server gen ID later.
var physicsLoop;
var updateClientsLoop;
var checkGameOverLoop;

/************ Set of data used throughout the game ******************/
var gameInProgress = false;
var gameState = {};
var clientSockets = {}; // dictionary mapping player id to socket
var players = {}; // dictionary mapping player id to player
var maze = converter.convertMaze(generator(width)); // gen maze of dimension width * width
var items = [];
var bullet_list = [];
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
        var team = team1;
        if (teamNum == 2) { // If player selected team 2
            team = team2;
        }
        if (team.length == 2) { // Check if this selection is valid. If not, send a message
            socket.emit('validChoice', false);
            socket.emit('message', "You can't enter Team " +teamNum+ ": it already has 2 players");
        }
        else { // Update players info
            player = new Player(id, teamNum, maze); // current player
            team.push(player);
            players[id] = player; // player successfully added to player roster
            clientSockets[id] = socket; // subscribe client socket to server updates
            io.emit('peopleInTeam', [team1.length, team2.length]);
            if (gameInProgress) {
                joinGame(id);
                return;
            }
            if ((team1.length === 2) && (team2.length === 2)) {
                if (!gameInProgress) startGame();
            } else {
                socket.emit('validChoice', true);
            }
        }
    });
});


function startGame() {
    gameInProgress = true;
    initItems();

    for (var id in players) {
        joinGame(id);
    }
    physicsLoop = setInterval(updatePhysics, 15);
    updateClientsLoop = setInterval(updateClients, 45);
    checkGameOverLoop = setInterval(checkGameOver, 50);
}


function joinGame(id) {
    var initialGameState = {
        players : players,
        items : [], // send nothing now, will be initialized in next update
        maze : maze,
        t : new Date().getTime(),
    };
    clientSockets[id].emit('canStartGame', initialGameState);
}


function updatePhysics() {
    dt = .015; // change this later; 15ms
    if (gameInProgress) { // Check again since it might have changed in checkGameOver
        while (items.length < 40) {
            potion = new Item('Potion', maze);
            ammo = new Item('Ammo', maze);
            items.push(potion);
            items.push(ammo);
        }
        // Go through the bullets list to check if there are any collision
        // with the wall
        for (var i = 0; i < bullet_list.length; i++) {
            var collide_wall = bullet_list[i].move(dt, maze);
            // If it is collision with wall, we remove the bullet from our
            // bullet list
            if (collide_wall) {
                bullet_list.splice(i,1);
            }
        }
        // Game has not ended yet!
        for (var id in players) {
            player = players[id];
            if (player.health > 0) {
                // Decrease health points
                player.health -= .015; // 5 per 15 seconds
                if (player.health < 0) player.health = 0;
                // Re-render players
                for (var i = 0; i < player.inputs.length; i++) {
                    if (player.inputs[i].shooting) {
                        // If the player myID is shooting, add the bullet to the bullet_list and
                        // then add it to the input. Pass the x direction and y direction as input
                        // directly.  
                        // If the player have bullets
                        if (player.bullets > 0) {
                            // When the player is shooting, deduct the bullets
                            // number of this player
                            player.bullets -= 1;
                            // Make new bullets for each player when they shooting,
                            // the start position for the bullets should from the central of the 
                            // player
                            var newBullet = new Bullet(player.x + player.width / 2, player.y + player.height / 2, player.orientation, player.teamNumber);                       
                            bullet_list.push(newBullet); 
                        } 
                    }
                    player.move(player.inputs[i], dt, maze);
                }

                player.inputs = []; // clear their inputs
                // check item collisions
                for (var i = 0; i < items.length; i++) {
                    if (Collision.collides(items[i],player)) {
                        //console.log('Item collision');
                        items[i].use(player);
                        items.splice(i,1);
                        break;
                    }
                }

                // Chech for bullet collisions
                for(var i = 0; i < bullet_list.length; i++) {
                    // If the bullet hit one of the player
                    if (Collision.collides(bullet_list[i], player)) {
                        // Hit others, if the bullet hit the team member or himself
                        // ignore the hit.
                        if (bullet_list[i].owner != player.teamNumber) {
                            // Dedect the points of this player
                            bullet_list[i].use(player);
                            bullet_list.splice(i,1);
                            break;
                        }
                    }
                }
            }
        }
    }
}


function checkGameOver() {
    // Determine if the game has ended, and determine if they won or lost
    var team1_dead = 0;
    for (var i=0; i < team1.length; i++) {
        if (team1[i].health === 0) team1_dead++;
    }
    var team2_dead = 0;
    for (var i=0; i < team2.length; i++) {
        if (team2[i].health === 0) team2_dead++;
    }

    if ((team1_dead === team1.length) || (team2_dead === team2.length)) {
        // end the game and notify the winners / losers
        gameInProgress = false;
        var winningTeam = 1;
        if (team1_dead === team1.length) { // Team 1 LOST
            winningTeam = 2;
        }
        for (var id in players) {
            var result = (players[id].teamNumber === winningTeam);
            clientSockets[id].emit('wonGame', result);
        }
        // reinitialize all game data for the next round
        team1 = [];
        team2 = [];
        players = {};
        items = [];
        bullet_list = [];
        maze = converter.convertMaze(generator(width));
        io.emit('peopleInTeam', [team1.length, team2.length]);
        clearInterval(physicsLoop);
        clearInterval(updateClientsLoop);
        clearInterval(checkGameOverLoop);
    }
}

/* 
 * updateClients: given a list of client sockets and current gameState, 
 * send each client an updated gameState. 
 */ 
function updateClients() {
    if (gameInProgress) {
        for (var id in clientSockets) {
            gameState = {
                players : players, 
                items : getRelevantItems(items, players[id]),
                bullets_list: bullet_list,
                t : new Date().getTime(),
            };
            clientSockets[id].emit('newGameState', gameState);
        }
    }
}


/* 
 * getRelevantItems: given a player, only send them items that are nearby
 */
function getRelevantItems(itemList, player) {
    var arr = [];
    for (var i = 0; i < itemList.length; i++) {
        // Only render items that are at most 500 pixels from the player
        var x_squared = Math.pow(player.x - itemList[i].x, 2);
        var y_squared = Math.pow(player.y - itemList[i].y, 2);
        if (Math.sqrt(x_squared + y_squared) < 500) {
            arr.push(itemList[i]);
        }
    }
    return arr;
}


var SERVPORT = 8080;
server.listen(SERVPORT,'0.0.0.0', function () {
  console.log('App listening on port ' + SERVPORT);
});