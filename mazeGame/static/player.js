// A class to represent a player
"use strict"; 
var speed = 150;

module.exports = class Player {
    constructor(id, teamNumber, maze) {
        this.teamNumber = teamNumber;
        // Place the player on upper top left
        if (teamNumber === 1) {
            // Find path (not wall) on upper top left on the maze
            var x = 0;
            var y = 0;
            while (maze[y][x] === 0) {
                x++;
                y++;
            }
            this.x = x*100 + 50;
            this.y = y*100 + 25;
        }
        else {
            // Find path (not wall) on lower bottom right on the maze
            var x = maze.length - 1;
            var y = maze.length - 1;
            while (maze[y][x] === 0) {
                x--;
                y--;
            }
            this.x = x*100 + 50;
            this.y = y*100 + 25;
        }
        
        this.id = id;
        this.health = 100;
        this.bullets = 0;
        this.connected = true;
        this.width = 42;
        this.height = 66;
        this.inputs = [];
        
    }

    move(direction, deltaT, maze) {
        var x1 = Math.floor((this.x + speed*deltaT*direction.x_dir) / 100);
        var x2 = Math.floor((this.x + this.width + speed*deltaT*direction.x_dir) / 100);
        var y1 = Math.floor((this.y + speed*deltaT*direction.y_dir ) / 100);
        var y2 = Math.floor((this.y + this.height + speed*deltaT*direction.y_dir) / 100);

        if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
        if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS

        if (maze[y1][x1] == 1 && maze[y2][x1] == 1 && maze[y1][x2] == 1 && maze[y2][x2] == 1) {
            this.x = this.x + speed*deltaT*direction.x_dir;
            this.y = this.y + speed*deltaT*direction.y_dir;  
        }
    }
};