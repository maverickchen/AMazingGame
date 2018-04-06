// A class to represent a player
"use strict"; 
var speed = 1;

module.exports = class Player {
    constructor(id) {
        this.x = 350;
        this.y = 300;
        this.id = id;
        this.health = 100;
        this.bullets = 0;
        this.connected = true;
        this.width = 42;
        this.height = 66;
        this.teamNumber;
    }

    move(direction, deltaT) {
        this.x += speed*deltaT*direction.x_dir;
        this.y += speed*deltaT*direction.y_dir;
    }
};