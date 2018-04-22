// Apply all queued inputs
function physicsUpdate() {
    var dt = .015; // 15 ms input checking rate
    var player = this.localState.players[this.myID];
    // apply local player position
    for (var i = 0; i < this.inputs.length; i++) {
        var input = this.inputs[i];
        // var tmp_x = player.x + input.x_dir*speed*dt;
        // var tmp_y = player.y + input.y_dir*speed*dt;

        // check if you collide with maze at any step of the way
        var x1 = Math.floor((player.x + speed*dt*input.x_dir) / 100);
        var x2 = Math.floor((player.x + player.width + speed*dt*input.x_dir) / 100);
        var y1 = Math.floor((player.y + speed*dt*input.y_dir ) / 100);
        var y2 = Math.floor((player.y + player.height + speed*dt*input.y_dir) / 100);

        if (x1 < 0 || x1 >= maze[0].length) return; // x corresponds to COLUMNS
        if (y1 < 0 || y1 >= maze.length) return; // y corresponds to ROWS

        if (this.maze[y1][x1] == 1 && this.maze[y2][x1] == 1 && this.maze[y1][x2] == 1 && this.maze[y2][x2] == 1) {
            player.x = player.x + speed*dt*input.x_dir;
            player.y = player.y + speed*dt*input.y_dir;  
        } else { console.log('You are colliding with a wall'); }
    }
    this.inputs = []; // clear inputs
}

// function move() {
//         var x1 = Math.floor((player.x + speed*dt*input.x_dir) / 100);
//         var x2 = Math.floor((player.x + player.width + speed*dt*input.x_dir) / 100);
//         var y1 = Math.floor((player.y + speed*dt*input.y_dir ) / 100);
//         var y2 = Math.floor((player.y + player.height + speed*dt*input.y_dir) / 100);

//         // console.log("x1 " + x1);
//         // console.log("x2 " + x2);
//         // console.log("y1 " + y1);
//         // console.log("y2 " + y2);

        

//         if (x1 < 0 || x1 >= this.maze.length) return;
//         if (y1 < 0 || y1 >= this.maze[0].length) return;

//         // console.log("x1y1 " + maze[x1][y1]);
//         //     console.log("x1y2 " + maze[x1][y2]);
//         //     console.log("x2y1 " + maze[x2][y1]);
//         //     console.log("x2y2 " + maze[x2][y2]);

//         if (this.maze[x1][y1] == 1 && this.maze[x1][y2] == 1 && this.maze[x2][y1] == 1 && this.maze[x2][y2] == 1) {
            

//             player.x = player.x + speed*dt*input.x_dir;
//             player.y = player.y + speed*dt*input.y_dir;  
//         }
//     }