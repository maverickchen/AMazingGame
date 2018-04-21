// A class to represent a player
"use strict"; 
var speed = 150;

module.exports = class Player {
    constructor(id) {
        this.x = 350;
        this.y = 500;
        this.id = id;
        this.health = 100;
        this.bullets = 0;
        this.connected = true;
        this.width = 42;
        this.height = 66;
        this.inputs = [];
        this.teamNumber;
    }

    move(direction, deltaT, maze) {
        var row = Math.floor((this.x + speed*deltaT*direction.x_dir) / 100);
        var col = Math.floor((this.y + speed*deltaT*direction.y_dir ) / 100);
        if (row < 0 || row >= maze.length) return;
        if (col < 0 || col >= maze[0].length) return;
        if (maze[row][col] == 1) {
            this.x = this.x + speed*deltaT*direction.x_dir;
            this.y = this.y + speed*deltaT*direction.y_dir;
        }
    }
};