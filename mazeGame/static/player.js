// A class to represent a player
"use strict"; 
var speed = 1;

module.exports = class Player {
    constructor(id) {
        this.x = 500;
        this.y = 500;
        this.id = id;
        this.health = 100;
        this.bullets = 0;
        this.connected = true;
        this.width = 42;
        this.height = 66;
        this.teamNumber;
    }

    move(direction, deltaT, maze) {
        var x = Math.floor((this.x + speed*deltaT*direction.x_dir) / 50);
        var y = Math.floor((this.y + speed*deltaT*direction.y_dir ) / 50) ;
        console.log("=======")
        console.log(x);
        console.log(y);
        console.log(maze[x][y]);

        if (maze[x][y] == 1) {
            console.log("what a day", maze[x][y]);
            this.x = this.x + speed*deltaT*direction.x_dir;
            this.y = this.y + speed*deltaT*direction.y_dir;
        } 
    }
};