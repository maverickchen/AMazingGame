// A class to represent a bullet
"use strict";
// The speed of the bullets 
var speed = 1200;
module.exports = class Bullet {
    constructor(x, y, orientation, teamID) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        // Initialize the direction of bullets
        // x_dir is -1 means go left, 1 means go right
        // y_dir is -1 means go up, 1 means go down
        this.y_dir = 0;
        this.x_dir = 0;
        // Add x direction and y direction to the bullet,
        // orientation is pass from the serverUpdate.js
        if (orientation == 'd') this.y_dir = 1;
        else if (orientation == 'u') this.y_dir = -1;
        else if (orientation == 'l') this.x_dir = -1;
        else if (orientation == 'r') this.x_dir = 1;

        
        this.owner = teamID; // id of the player that shot this bullet
    }

    
    use(player) {
        player.health -= 10;
        if (player.health < 0) player.health = 0;
    }
    move(deltaT, maze) {
        var x1 = Math.floor((this.x + speed*deltaT*this.x_dir) / 100);
        var x2 = Math.floor((this.x + this.width + speed*deltaT*this.x_dir) / 100);
        var y1 = Math.floor((this.y + speed*deltaT*this.y_dir ) / 100);
        var y2 = Math.floor((this.y + this.height + speed*deltaT*this.y_dir) / 100);

        if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
        if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS
        if (x2 < 0 || x2 >= maze[0].length) return;
        if (y2 < 0 || y2 >= maze.length) return;

        // If there is a path, the bullet could go through
        if (maze[y1][x1] == 1 && maze[y2][x1] == 1 && maze[y1][x2] == 1 && maze[y2][x2] == 1) {
            this.x = this.x + speed*deltaT*this.x_dir;
            this.y = this.y + speed*deltaT*this.y_dir;
            return false;
        }
        else {
            return true;
        }
    }
};