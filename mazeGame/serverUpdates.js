var Collision = require('./static/collides');

/*
 * updatePhysics: given a list of clientInputs, process them and calculate 
 * collisions. 
 */

var gameOver = false;

exports.updatePhysics = function() {
    dt = .015; // change this later; 15ms

    if (!gameOver) {
        // First check if game is over by checking the health of all players
        checkGameOver();
    }
    if (!gameOver) { // Check again since it might have changed in checkGameOver
        // Game has not ended yet!
        for (var id in this.players) {
            player = this.players[id];

            // Decrease health points
            player.health -= 0.01; // 1 per 15
            if (player.health < 0) player.health = 0;

            // Re-render players
            for (var i = 0; i < player.inputs.length; i++) {
                player.move(player.inputs[i], dt, this.maze);
            }

            player.inputs = []; // clear their inputs
            // check item collisions
            for (var i = 0; i < this.items.length; i++) {
                if (Collision.collides(this.items[i],player)) {
                    //console.log('Item collision');
                    this.items[i].use(player);
                    this.items.splice(i,1);
                    break;
                }
            }
        }
    }
}

function checkGameOver() {
    // Determine if the game has ended, and determine if they won or lost
    var team1_dead = 0;
    for (var i=0; i<this.team1.length; i++) {
        if (this.team1[i].health === 0) team1_dead++;
    }
    var team2_dead = 0;
    for (var i=0; i<this.team2.length; i++) {
        if (this.team2[i].health === 0) team2_dead++;
    }

    // Only emit socket when game is finished
    if ((team1_dead === team1.length) || (team2_dead === team2.length)) {
        gameOver = true;
        if (team1_dead === 2) { // Team 1 LOST
            for (var id in this.players) {
                if (this.players[id].teamNumber === 1) this.clientSockets[id].emit('wonGame', false);
                else this.clientSockets[id].emit('wonGame', true);
            }
        }
        if (team2_dead === 2) { // Team 2 LOST
            for (var id in this.players) {
                if (this.players[id].teamNumber === 1) this.clientSockets[id].emit('wonGame', true);
                else this.clientSockets[id].emit('wonGame', false);
            }
        }
    }
}

/* 
 * updateClients: given a list of client sockets and current gameState, 
 * send each client an updated gameState. 
 */ 
exports.updateClients = function() {

    if (!gameOver) {
        for (var id in this.clientSockets) {
            gameState = {
                players : this.players, 
                items : getRelevantItems(this.items, this.players[id]),
                t : new Date().getTime()
            };
            this.clientSockets[id].emit('newGameState', gameState);
        }
    }
    
}

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