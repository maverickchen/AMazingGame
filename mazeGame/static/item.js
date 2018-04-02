// A class to represent an item
"use strict";

module.exports = class Item {
    constructor(id) {
        this.x = Math.floor(Math.random() *Math.floor(width));
        this.y = Math.floor(Math.random() *Math.floor(height));
        this.type; // 'Potion' or 'Ammo'
    }

    use(player) {
        if (this.type == 'Potion') {
            player.health += 25;
        } else { // Ammo
            player.bullets += 3;
        }
    }
};