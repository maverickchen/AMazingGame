// A class to represent a bullet
"use strict";
var speed = 1000;
module.exports = class Bullet {
    constructor(x, y, orientation, teamID) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.y_dir = 0;
        this.x_dir = 0;
        // Add x direction and y direction to the bullet
        if (orientation == 'd') this.y_dir = 1;
        else if (orientation == 'u') this.y_dir = -1;
        else if (orientation == 'l') this.x_dir = -1;
        else if (orientation == 'r') this.x_dir = 1;

        /*this.x_dir = x_dir;
        this.y_dir = y_dir;*/
        
        //console.log(this.x_dir);
        //console.log(this.y_dir);

        this.owner = teamID; // id of the player that shot this bullet
    }

    use(player) {
        player.health -= 25;
        if (player.health < 0) player.health = 0;
    }

    // returns false if 
    move(deltaT, maze) {

        //console.log("x_dir in the bullet " + this.x_dir);
        //console.log("x in the bullet " + this.x);


        var x1 = Math.floor((this.x + speed*deltaT*this.x_dir) / 100);
        var x2 = Math.floor((this.x + this.width + speed*deltaT*this.x_dir) / 100);
        var y1 = Math.floor((this.y + speed*deltaT*this.y_dir ) / 100);
        var y2 = Math.floor((this.y + this.height + speed*deltaT*this.y_dir) / 100);

        if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
        if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS
        if (x2 < 0 || x2 >= maze[0].length) return;
        if (y2 < 0 || y2 >= maze.length) return;

        // If there is a path, the bullet could go through
        //console.log("x1 in bullet " + x1);
        //console.log("y1 in bullet " + y1);

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