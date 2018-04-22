// A class to represent an item
"use strict";

module.exports = class Item {
    constructor(type, maze) {
        this.type = type; // 'Potion' or 'Ammo'

        // width_screen = width_maze * 100
        // Place the items only on the path, not on the walls
        var tempX = Math.floor(Math.random() * (maze.length-1));
        var tempY = Math.floor(Math.random() * (maze.length-1));
        // Until it finds path
        while (maze[tempX][tempY] === 0) {
            tempX = Math.floor(Math.random() * (maze.length-1));
            tempY = Math.floor(Math.random() * (maze.length-1));
        }
        // randomX, randomY = 0 ~ 100 (within one block of maze)
        var randomX = Math.floor(Math.random() * 100);
        var randomY = Math.floor(Math.random() * 100);
        this.x = tempX * 100 + randomX;
        this.y = tempY * 100 + randomY;

        if (this.type == 'Potion') {
            this.width = 30.8;
            this.height = 46.2;
        } else {
            this.width = 44.8;
            this.height = 29.4;
        }
    }

    use(player) {
        if (this.type == 'Potion') {
            player.health += 25;
            if (player.health > 100) player.health = 100;
        } else { // Ammo
            player.bullets += 3;
        }
    }
};