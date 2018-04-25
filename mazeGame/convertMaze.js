exports.convertMaze = function(maze_cell) {
    var newMaze = [];
    // initialize newMaze
    for (var i = 0; i < maze_cell.length*2 + 1; i++) {
        var newRow = [];
        for (var j = 0; j < maze_cell.length*2 + 1; j++) {
            newRow.push(0);
        }
        newMaze.push(newRow);
    }

    for (var oldRow = 0; oldRow < maze_cell.length; oldRow++) {
        for (var oldCol = 0; oldCol < maze_cell.length; oldCol++) {
            old = maze_cell[oldRow][oldCol];
            newRow = 2*oldRow + 1;
            newCol = 2*oldCol + 1;
            newMaze[newRow][newCol] = 1;
            if (old.left) {
                newMaze[newRow][newCol-1] = 0;
            } else newMaze[newRow][newCol-1] = 1;
            if (old.right) {
                newMaze[newRow][newCol+1] = 0;
            } else newMaze[newRow][newCol+1] = 1;
            if (old.top) {
                newMaze[newRow-1][newCol] = 0;
            } else newMaze[newRow-1][newCol] = 1;
            if (old.bottom) {
                newMaze[newRow+1][newCol] = 0;
            } else newMaze[newRow + 1][newCol] = 1;
        }
    }
    
    return newMaze;
} 