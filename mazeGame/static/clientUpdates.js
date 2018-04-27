// Apply all queued inputs
const speed = 150;
var playingAmmoSound = false;
var playingPotionSound = false;

function physicsUpdate() {
    if (this.localState.players[this.myID].health > 0) {
        var dt = .015; // 15 ms input checking rate
        var player = this.localState.players[this.myID];

        // apply local player position
        var input;
        for (var i = 0; i < this.inputs.length; i++) {
            input = this.inputs[i];
            if (input.seq > player.clientLastInputSeq) {
                move(player, input, dt, this.maze);
            }
        }
        if (input) player.clientLastInputSeq = input.seq;

        // check item collisions
        for (var i = 0; i < this.localState.items.length; i++) {
            if (collides(this.localState.items[i], player)) {
                if (this.localState.items[i].type == 'Ammo') {
                    if (!playingAmmoSound) {
                        playingAmmoSound = true;
                        PIXI.sound.Sound.from({
                            url: 'assets/reloadSound.mp3',
                            autoPlay: true,
                            loop: false,
                            complete: function() {
                                playingAmmoSound = false;
                            }
                        });
                    }
                } else if (this.localState.items[i].type == 'Potion') {
                    if (!playingPotionSound) {
                        playingPotionSound = true;
                        PIXI.sound.Sound.from({
                            url: 'assets/PopCork.mp3',
                            autoPlay: true,
                            loop: false,
                            volume: 3,
                            complete: function() {
                                playingPotionSound = false;;
                            }
                        });
                    }
                }
                break;
            }
        }
    }
}

function move(player, direction, deltaT, maze) {
    // check if you collide with maze at any step of the way
    var x1 = Math.floor((player.x + speed*deltaT*direction.x_dir) / 100);
    var x2 = Math.floor((player.x + player.width + speed*deltaT*direction.x_dir) / 100);
    var y1 = Math.floor((player.y + player.height*0.7 + speed*deltaT*direction.y_dir ) / 100);
    var y2 = Math.floor((player.y + player.height + speed*deltaT*direction.y_dir) / 100);

    if (direction.x_dir < 0) {
        player.orientation = 'l';
    } else if (direction.x_dir > 0) {
        player.orientation = 'r';
    } else if (direction.y_dir < 0) {
        player.orientation = 'u';
    } else if (direction.y_dir > 0) {
        player.orientation = 'd';
    }

    if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
    if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS
    if (x2 < 0 || x2 >= maze[0].length) return;
    if (y2 < 0 || y2 >= maze.length) return;

    if (maze[y1][x1] == 1 && maze[y2][x1] == 1 && maze[y1][x2] == 1 && maze[y2][x2] == 1) {
        player.x = player.x + speed*deltaT*direction.x_dir;
        player.y = player.y + speed*deltaT*direction.y_dir;  
    }
}