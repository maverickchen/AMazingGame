/*
* Use prim's algorithm to generate a 2D maze.
*/

/* Array to store the maze location. If there is a wall, set that location
* to 0 and if there is a road, set that location to 1 in the array.
*/ 

//wallArray = [];
// M is the width of the maze and N is the height of the maze
M = 512;
N = 512;



// width and height are the same to the moveplayer UI
var width = N;
var height = M;

// The left most and right most 
<<<<<<< HEAD
var limit_X = 508;
var limit_Y = 508;
=======
var limit_X = 511;
var limit_Y = 511;
>>>>>>> fbbf95c087c6dd2442eca70c912eeb25bb800fe5

// Initialize the first grid and end grid
var startPoint;
var endPoint;

// The location of each grid
function Unit(x, y) {
    this.x = x;
    this.y = y;
    this.nextX = 0;
    this.nextY = 0;
    this.beRemove = false;
    this.choosed = false;
    this.theNear();
}

function Maze() {
    this.road = [];
    this.walls = [];
    this.grids = [];
    this.path = [];
    this.init();
}

Unit.prototype.theNear = function() {
    var x = this.x;
    var y = this.y;
    this.neighbor = [];
    if(y > 0) {
        this.neighbor.push({
            x: x,
            y: y - 2
        });
    }
    if(y < limit_Y) {
        this.neighbor.push({
        x: x,
        y: y + 2
    });
    }
    if(x > 0) {
        this.neighbor.push({
        x: x - 2,
        y: y 
        });
    }
    if(x < limit_X) {
        this.neighbor.push({
        x: x + 2,
        y: y
        });
    }
    this.neighbor.sort(function() {
        return 0.5 - Math.random();
        });
    };

Unit.prototype.findNear = function() {
    var x, y, neighbor, ret = [];

    this.choosed = true;

    for(var i = 0; i < this.neighbor.length; i++) {
        x = this.neighbor[i].x;
        y = this.neighbor[i].y;

        neighbor = maze.grids[y][x];

        neighbor.wallX = this.x + (x - this.x)/2;
        neighbor.wallY = this.y + (y - this.y)/2;

        if(!neighbor.choosed) {
            ret.push(neighbor);
        }
    }
    return ret;
};

Maze.prototype.init = function() {
    for(var i = 0; i <= limit_Y; i++) {
        this.grids[i] = [];
        for(var j = 0; j <= limit_X; j++) {
            this.grids[i][j] = new Unit(j, i);
        }
    }  
    startPoint = this.grids[0][0];
    endPoint = this.grids[limit_X][limit_Y];
};

Maze.prototype.findRoad = function() {
//function findRoad(){
    var curr = startPoint;
    var walls = this.walls;
    var index;
    
    var tmp;
    tmp = curr.findNear();

    curr.beRemove = true;

    walls.push.apply(walls, tmp);

    while(walls.length) {
        index = (Math.random() * walls.length) >> 0;

        wall = walls[index];

        if(!wall.beRemove) {
            wall.beRemove = true;

            this.road.push({
                x: wall.wallX,
                y: wall.wallY
            });

            tmp = wall.findNear();

            walls.push.apply(walls, tmp);
        } else {
            walls.splice(index, 1);
        }
    }
//console.log("walls "  + walls.length);
};

Maze.prototype.drawRoad = function() {
//function drawRoad() {
    var i;
    /*ctx.fillStyle = 'black';

    for(i = 0; i <= 512; i+=20) {
        //ctx.fillRect(0, i, 510, 10);
        //ctx.fillRect(i, 0, 10, 510);
    }

    ctx.fillStyle = 'white';

    for(i = 0; i < this.road.length; i++) {
        //ctx.fillRect(10 + this.road[i].x * 10, 10 + this.road[i].y * 10, 10, 10);
    }*/
    //console.log('THE PATH',this.path);
    this.path = [];
    //console.log('THE NEW PATH', this.path);
    for (var i = 0; i < M; i++) {
        row = [];
        // this.path[i] = [];
        for (var j = 0; j < N; j++) {
            row.push(0);
            // this.path[i][j] = 0;
        }
        //console.log('A ROW',row);
        this.path.push(row);
    }

    //console.log(this.path);

    for (i = 0; i  < M; i++) {
        for (j = 0; j < N; j++) {
            if (i % 2 != 0 && j % 2 != 0) {
                this.path[i][j] = 1;
            }
            
        }
    }

    for (i = 0; i < this.road.length; i++) {
        var x = this.road[i].x;
        var y = this.road[i].y;
        //console.log(x);
        //console.log(y);
        this.path[x][y] = 1;

    }
    return this.path;

}

exports.returnPath = function() {
    maze = new Maze();
    maze.findRoad();
    //maze.drawRoad();
    
    return maze.drawRoad();
}

var maze;
//maze.drawRoad();




