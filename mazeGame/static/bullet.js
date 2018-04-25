// A class to represent a bullet
"use strict";
var speed = 200;
module.exports = class Bullet {
    constructor(type, x, y, dir, ownerID) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.dir = dir;
        this.owner = ownerID; // id of the player that shot this bullet
    }

    use(player) {
        player.health -= 25;
        if (player.health < 0) player.health = 0;
    }

    // returns false if 
    move(deltaT, maze) {
        var x1 = Math.floor((this.x + speed*deltaT*dir.x_dir) / 100);
        var x2 = Math.floor((this.x + this.width + speed*deltaT*dir.x_dir) / 100);
        var y1 = Math.floor((this.y + speed*deltaT*dir.y_dir ) / 100);
        var y2 = Math.floor((this.y + this.height + speed*deltaT*dir.y_dir) / 100);

        if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
        if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS
        if (x2 < 0 || x2 >= maze[0].length) return;
        if (y2 < 0 || y2 >= maze.length) return;

        if (maze[y1][x1] == 1 && maze[y2][x1] == 1 && maze[y1][x2] == 1 && maze[y2][x2] == 1) {
            this.x = this.x + speed*deltaT*dir.x_dir;
            this.y = this.y + speed*deltaT*dir.y_dir;  
            return true;
        }
        else {
            return false;
        }
    }
};