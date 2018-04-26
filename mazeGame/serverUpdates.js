var Collision = require('./static/collides');
var bullet = require('./static/bullet');

/*
 * updatePhysics: given a list of clientInputs, process them and calculate 
 * collisions. 
 */

var gameOver = false;
var bullet_list = [];

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
                if (player.inputs[i].shooting) {
                    //console.log("Shooting");
                    // If the player myID is shooting, add the bullet to the bullet_list and
                    // then add it to the input. Pass the x direction and y direction as input
                    // directly.  
                    // FIND ME
                    var newBullet = new bullet(player.x, player.y, player.orientation, id);                       
                    bullet_list[bullet_list.length] = newBullet;                     
                }
                player.move(player.inputs[i], dt, this.maze);
            }

            //console.log("before the remove " + bullet_list.length);

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

            // FIND ME
            // move the bullet
            //console.log("bullet list length " + bullet_list.length);

            for(var i = 0; i < bullet_list.length; i++) {

                //console.log("in for loop");
                var collide_wall = bullet_list[i].move(dt, this.maze);
                //console.log("under");

                if (collide_wall) {
                    //console.log("Show the dt in bullet list");
                    bullet_list.splice(i,1);
                }
            }

            // Chech for bullet collisions
            for(var i = 0; i < bullet_list.length; i++) {
                if(Collision.collides(bullet_list[i], id)) {
                    if (bullet_list[i].owner != player) {

                        console.log("bullet_list " + bullet_list[i]);

                        bullet_list[i].use(player);
                        bullet_list.splice(i,1);
                        break;
                    }
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
                bullets: this.bullet_list,
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