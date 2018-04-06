// A class to represent an item
"use strict";

module.exports = class Item {
    constructor(type) {
        this.type = type; // 'Potion' or 'Ammo'
        this.x = Math.floor(Math.random() *Math.floor(700));
        this.y = Math.floor(Math.random() *Math.floor(600));
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
        } else { // Ammo
            player.bullets += 3;
        }
    }
};