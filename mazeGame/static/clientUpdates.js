// Apply all queued inputs
function physicsUpdate() {
    var dt = .015; // 15 ms input checking rate
    // apply local player position
    for (var i = 0; i < this.inputs.length; i++) {
        var input = this.inputs[i];
        var tmp_x = this.localState.players[this.myID].x + input.x_dir*speed*dt;
        var tmp_y = this.localState.players[this.myID].y + input.y_dir*speed*dt;

        // check if you collide with maze at any step of the way
        row = Math.floor(tmp_x / this.WALL_WIDTH);
        col = Math.floor(tmp_y / this.WALL_WIDTH);
        if (row < 0 || row >= this.maze.length) continue;
        if (col < 0 || col >= this.maze[0].length) continue;
        if (this.maze[row][col] == 1) {
            this.localState.players[this.myID].x = tmp_x;
            this.localState.players[this.myID].y = tmp_y;
        }
    }
    this.inputs = []; // clear inputs
}