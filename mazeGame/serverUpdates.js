var Collision = require('./static/collides');

/*
 * updatePhysics: given a list of clientInputs, process them and calculate 
 * collisions. 
 */
exports.updatePhysics = function() {
    dt = .015; // change this later; 15ms
    for (var id in this.players) {
        player = this.players[id];

        // Decrease health points
        player.health -= 1/1000;

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

/* 
 * updateClients: given a list of client sockets and current gameState, 
 * send each client an updated gameState. 
 */ 
exports.updateClients = function() {
    gameState = {
                    players : this.players, 
                    items : this.items,
                    t : new Date().getTime()
                };
    for (var id in this.clientSockets) {
        this.clientSockets[id].emit('newGameState', gameState);
    }
}