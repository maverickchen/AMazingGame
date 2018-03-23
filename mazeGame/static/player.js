// A class to represent a player
"use strict"; 
var speed = 1;

module.exports = class Player {
    constructor(id) {
        this.x = 256;
        this.y = 256;
        this.id = id;
        this.health = 100;
        this.bullets = 0;
        this.connected = true;
    }

    move(direction, deltaT) {
        this.x += speed*deltaT*direction.x_dir;
        this.y += speed*deltaT*direction.y_dir;
    }
};