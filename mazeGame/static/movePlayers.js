// make a client socket
var socket = io();

var inputs = []; // a log of this player's last few inputs
var myID; // the server generated ID
var local_time = 0.016;
var speed = 1;
var maze;

// sprite animation frames
var p1Frames = {};
var p2Frames = {}; 
var potionFrames = [];
var otherPlayerSprites = [];

var potionSprites = [];
var ammoSprites = [];
var playerSprites = {};
var wallSprites = [];
const WALL_WIDTH = 100;



var left = keyboard(37), // arrowkeys
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40),
    shoot = keyboard(32); // spacebar


var w = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var h = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

// make a PIXI canvas
var app = new PIXI.Application({
          width: w, 
          height: h,
          antialiasing: true, 
          transparent: false, 
          resolution: 1
        });
// Display the PIXI canvas
document.body.appendChild(app.view);
// create the stage instead of container - needed for layers
app.stage = new PIXI.display.Stage();

/* Make Containers to manage separate sprite groups */
// Container for all start screen assets
var startScreen = new PIXI.Container();
app.stage.addChild(startScreen);

// Container for all in game assets
var gameScreen = new PIXI.Container();
app.stage.addChild(gameScreen);
gameScreen.visible = false;

var gameView = new PIXI.Container();
gameScreen.addChild(gameView);

// Maze 
var mazeContainer = new PIXI.Container();
gameView.addChild(mazeContainer);

var itemContainer = new PIXI.Container();
mazeContainer.addChild(itemContainer);

var charContainer = new PIXI.Container();
mazeContainer.addChild(charContainer);

var gameUI = new PIXI.Container();
gameScreen.addChild(gameUI);


// app.renderer.view.style.position = "absolute"
// app.renderer.view.style.width = window.innerWidth - 50 + "px";
// app.renderer.view.style.height = window.innerHeight - 50 + "px";
// app.renderer.view.style.display = "block";

//The `renderer.view` is just an ordinary `<canvas>` element.
//Here's how you can reference to add an optional dashed 
//border around the canvas 
// app.renderer.view.style.border = "1px dashed black";
//To resize the canvas
// app.renderer.resize(512, 512);
//To change the background color
app.renderer.backgroundColor = 0x061639;
var graphics = new PIXI.Graphics();

//app.ticker.add(chooseTeam);
window.onload = chooseTeam;

/*
var outlineFilterBlue = new PIXI.filters.OutlineFilter(2, 0x99ff99);
var outlineFilterRed = new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5);

function filterOn() {
    this.filters = [outlineFilterRed]
}
function filterOff() {
    this.filters = [outlineFilterBlue]
}
*/

var team1_ppl = 0;
var team2_ppl = 0;


// Style for UI text
    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: ['#ffffff'] // gradient
    });
var team1_text;
var team2_text;
socket.on('peopleInTeam', function(arr) {
        console.log("received");
        var index = startScreen.children.indexOf(team1_text);
        if (index !== -1) startScreen.removeChild(team1_text);
        var index = startScreen.children.indexOf(team2_text);
        if (index !== -1) startScreen.removeChild(team2_text);

        team1_ppl = arr[0];
        team2_ppl = arr[1];
        team1_text = new PIXI.Text('There are ' + team1_ppl + ' people in team 1', style);
        team1_text.x = 80;
        team1_text.y = app.screen.height / 2 - 100;
        startScreen.addChild(team1_text);
        team2_text = new PIXI.Text('There are ' + team2_ppl + ' people in team 2', style);
        team2_text.x = app.screen.width - 300;
        team2_text.y = app.screen.height / 2 - 100;
        startScreen.addChild(team2_text);
});

function chooseTeam() {
    // Style for instructionText
    var instructionStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 30,
        fontWeight: 'bold',
        fill: ['#E84F2E'] // gradient
    });
    instructionText = new PIXI.Text('Choose Your Team!', instructionStyle);
    instructionText.x = 115;
    instructionText.y = 50;
    startScreen.addChild(instructionText);

/*
    socket.on('peopleInTeam', function(arr) {
        console.log("received");
        team1_ppl = arr[0];
        team2_ppl = arr[1];
        var team1_text = new PIXI.Text('There are ' + team1_ppl + ' people in team 1', style);
        team1_text.x = 80;
        team1_text.y = app.screen.height / 2 - 100;
        app.stage.addChild(team1_text);
        team2_text = new PIXI.Text('There are ' + team2_ppl + ' people in team 2', style);
        team2_text.x = app.screen.width - 300;
        team2_text.y = app.screen.height / 2 - 100;
        app.stage.addChild(team2_text);
    });
*/
    // Bring in image assets
    var team1 = PIXI.Sprite.fromImage('/assets/Team1.png');
    var team2 = PIXI.Sprite.fromImage('/assets/Team2.png');
    var ready = PIXI.Sprite.fromImage('/assets/ReadyButton.png');
    // Maze 
    var wall = PIXI.Sprite.fromImage('/assets/wall.png');

    // Set the initial position and scale
    team1.anchor.set(0.5);
    team1.x = app.screen.width / 3;
    team1.y = app.screen.height / 2;
    team1.scale.x *= 0.3;
    team1.scale.y *= 0.3;

    team2.anchor.set(0.5);
    team2.x = app.screen.width / 3 * 2;
    team2.y = app.screen.height / 2;
    team2.scale.x *= 0.3;
    team2.scale.y *= 0.3;

    ready.anchor.set(0.5);
    ready.x = app.screen.width / 2;
    ready.y = app.screen.height / 5 * 4;
    ready.scale.x *= 0.3;
    ready.scale.y *= 0.3;

    // Opt-in to interactivity
    team1.interactive = true;
    team2.interactive = true;
    ready.interactive = true;

    // Shows hand cursor
    team1.buttonMode = true;
    team2.buttonMode = true;
    ready.buttonMode = true;

    var text1;
    var text2;
    var teamSelected = 0;

    // Pointers normalize touch and mouse

    /*
    // Red glow when a mouse is hovered over buttons
    team1.on('pointerover', filterOn)
        .on('pointerout', filterOff );
    filterOff.call(team1);
    team2.on('pointerover', filterOn)
        .on('pointerout', filterOff );
    filterOff.call(team2);
    ready.on('pointerover', filterOn)
        .on('pointerout', filterOff );
    filterOff.call(ready);
    */

    // When team 1 is selected,
    team1.on('pointerdown', function() {
        // First, get rid of previous text1, text2
        var index = startScreen.children.indexOf(text1);
        if (index !== -1) startScreen.removeChild(text1);
        var index = startScreen.children.indexOf(text2);
        if (index !== -1) startScreen.removeChild(text2);

        teamSelected = 1;
        text1 = new PIXI.Text('You Selected Team 1', style);
        text1.x = 80;
        text1.y = app.screen.height / 2 + 30;
        startScreen.addChild(text1);
    });

    // When team 2 is selected,
    team2.on('pointerdown', function() {
        // First, get rid of previous text1, text2
        var index = startScreen.children.indexOf(text1);
        if (index !== -1) startScreen.removeChild(text1);
        var index = startScreen.children.indexOf(text2);
        if (index !== -1) startScreen.removeChild(text2);

        teamSelected = 2;
        text2 = new PIXI.Text('You Selected Team 2', style);
        text2.x = app.screen.width - 300;
        text2.y = app.screen.height / 2 + 30;
        startScreen.addChild(text2);
    });

    var msg;
    var cantEnter;
    // When Ready button is clicked,
    ready.on('pointerdown', function() {

        if (teamSelected === 0) {
            // First, get rid of previous msg
            var index = startScreen.children.indexOf(msg);
            if (index !== -1) startScreen.removeChild(msg);
            msg = new PIXI.Text('You should select a team before you begin', style);
            msg.x = 70;
            msg.y = app.screen.height - 70;
            startScreen.addChild(msg);
        }

        else if (teamSelected === 1 || teamSelected === 2) {
            socket.emit('teamSelection', teamSelected); // send out final selection
            // Check if the selection was valid (already 2 players in the team?)
            socket.on('validChoice', function(isValid) {
                if (isValid) {
                    // Disable ready button
                    ready.interactive = false;
                    ready.buttonMode = false;
                    // Display "Waiting for other players to get ready..." until game starts
                    var index = startScreen.children.indexOf(msg);
                    if (index !== -1) startScreen.removeChild(msg);
                    var waitText = new PIXI.Text('Waiting for other players to get ready...', style);
                    waitText.x = app.screen.width / 2;
                    waitText.y = app.screen.height - 50;
                    startScreen.addChild(waitText);
                }
                else {
                    // Display the msg: You can't enter Team x ...
                    socket.on('message', function(msg) {
                        // Get rid of previous text first
                        var index = startScreen.children.indexOf(cantEnter);
                        if (index !== -1) startScreen.removeChild(cantEnter);
                        cantEnter = new PIXI.Text(msg, style);
                        cantEnter.x = app.screen.width / 2;
                        cantEnter.y = app.screen.height - 50;
                        startScreen.addChild(cantEnter);
                    });
                }
            });
        }
    });

    // Alternatively, use the mouse & touch events:
    // sprite.on('click', onClick); // mouse-only
    // sprite.on('tap', onClick); // touch-only

    startScreen.addChild(team1);
    startScreen.addChild(team2);
    startScreen.addChild(ready);

 
}

// Wait for everyone to get ready - start game when they do
socket.on('canStartGame', function(initialGameState) {
    initGameState = initialGameState;
    PIXI.loader.add('assets/Player1Up.json')
    .add('assets/Player1Down.json')
    .add('assets/Player1Left.json')
    .add('assets/Player1Right.json')
    .add('assets/Player1Shoot.json')
    .add('assets/Player2Up.json')
    .add('assets/Player2Down.json')
    .add('assets/Player2Left.json')
    .add('assets/Player2Right.json')
    .add('assets/Player2Shoot.json')
    .add('assets/Potion.json')
    .load(onAssetsLoaded);
});

/* 
 * loadMaze: load 100 wall sprites to be used and recycled.
 */
function loadMaze() {
    for (var i = 0; i < 100; i++) {
        mazeContainer.addChild(newWallSprite(0,0));
    }
}


/* 
 * loadFrames: loads ALL the sprite animations and stores them in the global 
 * vars p1Frames and p2Frames {.left .right .up .down .shoot}
 * Also creates a sprite for each direction the local player can face, and stores 
 * them in the var playerSprites{.left .right .up .down .shoot}
 */
function loadFrames(lighting) {
    // Player 1's animations:
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1Up' + i + '.png'));
    }
    p1Frames.up = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1Down' + i + '.png'));
    }
    p1Frames.down = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1Left' + i + '.png'));
    }
    p1Frames.left = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1Right' + i + '.png'));
    }
    p1Frames.right = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1Shoot' + i + '.png'));
    }
    p1Frames.shoot = frames;
    // Player 2's animations: 
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2Up' + i + '.png'));
    }
    p2Frames.up = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2Down' + i + '.png'));
    }
    p2Frames.down = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2Left' + i + '.png'));
    }
    p2Frames.left = frames;
    frames = []
    for (var i = 0; i < 4; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2Right' + i + '.png'));
    }
    p2Frames.right = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2Shoot' + i + '.png'));
    }
    p2Frames.shoot = frames;
    // Load Potion frames
    frames = []
    for (var i = 0; i < 10; i++) {
        frames.push(PIXI.Texture.fromFrame('Potion' + i + '.png'));
    }
    potionFrames = frames;

    // create an AnimatedSprite for each possible direction.
    playerSprites.down = newSprite(p1Frames.down, app.screen.width/2, app.screen.height/2, true);  
    playerSprites.up = newSprite(p1Frames.up, app.screen.width/2, app.screen.height/2, false); 
    playerSprites.left = newSprite(p1Frames.left, app.screen.width/2, app.screen.height/2, false);
    playerSprites.right = newSprite(p1Frames.right, app.screen.width/2, app.screen.height/2, false);
    playerSprites.shoot = newSprite(p1Frames.shoot, app.screen.width/2, app.screen.height/2, false);
    for (var i = 0; i < 5; i++) {
        var lightbulb = new PIXI.Graphics();
        lightbulb.beginFill(0x706050, 1.0);
        lightbulb.drawCircle(0, 0, 300);
        lightbulb.endFill();
        lightbulb.parentLayer = lighting;
        if (i == 0) playerSprites.down.addChild(lightbulb);
        if (i == 1) playerSprites.up.addChild(lightbulb);
        if (i == 2) playerSprites.left.addChild(lightbulb);
        if (i == 3) playerSprites.right.addChild(lightbulb);
        if (i == 4) playerSprites.shoot.addChild(lightbulb);
    }
}

/* 
 * setSprite: given an animatedSprite from var playerSprites{.left.right.up.down.shoot}
 * make the new sprite visible with the right coordinates and the old sprite invisble
 */
function setSprite(animation) {
    if (player !== animation) {
        offsetX = 1; // account for shooting sprite's different size 
        offsetY = 4;
        newDirSprite = animation;
        if (animation === playerSprites.shoot) {
            newDirSprite.x = player.x - offsetX;
            newDirSprite.y = player.y - offsetY;
        } else if (player === playerSprites.shoot) {
            newDirSprite.x = player.x + offsetX;
            newDirSprite.y = player.y + offsetY;
        } else {
            newDirSprite.x = player.x;
            newDirSprite.y = player.y;
        }
        newDirSprite.visible = true;
        player.visible = false;
        player = newDirSprite;
    }
}

function checkCollisions() {

}


function onAssetsLoaded() {
    PIXI.sound.Sound.from({
            url: 'assets/bkgMusic.mp3',
            autoPlay: true,
            loop: true,
    });
    // suppress the startScreen UI elements and show the game screen
    startScreen.visible = false;
    gameScreen.visible = true;

    /*************** Display Panel **************/
    var panel = PIXI.Sprite.fromImage('assets/Panel.png');
    panel.x = app.screen.width / 3 * 2;
    panel.y = 30;
    panel.scale.x *= 3.5;
    panel.scale.y *= 4;
    gameUI.addChild(panel);

    // Display "HP:"
    var gameTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: ['#05090c'] // gradient
    });
    var healthPointText = new PIXI.Text('HP:', gameTextStyle);
    healthPointText.x = app.screen.width - 350;
    healthPointText.y = 115;
    gameUI.addChild(healthPointText);

    // Display user's id - hardcoded for now
    var userID = new PIXI.Text('User', gameTextStyle);
    userID.x = app.screen.width - 350;
    userID.y = 155;
    gameUI.addChild(userID);

    // Display user's team - also hardcoded
    var userTeam = new PIXI.Text('Team', gameTextStyle);
    userTeam.x = app.screen.width - 350;
    userTeam.y = 195;
    gameUI.addChild(userTeam);

    // Display bullet remaining - also hardcoded
    var bulletsRemaining = new PIXI.Text('Bullet Left:', gameTextStyle);
    bulletsRemaining.x = app.screen.width - 350;
    bulletsRemaining.y = 235;
    gameUI.addChild(bulletsRemaining);

    // Leave space for customized maze
    var mazeText = new PIXI.Text('Your Maze:', gameTextStyle);
    mazeText.x = app.screen.width - 350;
    mazeText.y = 275;
    gameUI.addChild(mazeText);

    // make the background dark by putting a layer over it
    var lighting = new PIXI.display.Layer();
    lighting.on('display', function (element) {
        element.blendMode = PIXI.BLEND_MODES.ADD
    });
    lighting.useRenderTexture = true;
    lighting.clearColor = [0.03, 0.03, 0.03, 1]; // dark gray

    gameView.addChild(lighting);

    var lightingSprite = new PIXI.Sprite(lighting.getRenderTexture());
    lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    gameView.addChild(lightingSprite);
    
    loadFrames(lighting);

    hpObj = newHPSprite(lighting);
    hpBkg = hpObj.spriteBkg;
    hp = hpObj.spriteHP;

    // initialize player to the downward facing sprite
    var player;
    player = playerSprites.down;

    this.player = player;
    
    maze = initGameState.maze;
    loadMaze();
    updatePlayers(initGameState, gameTextStyle);
    updateItems(initGameState);
    updateMaze(initGameState);
    recenterView();

    socket.on('newGameState', function(state){
        console.log(state);
        console.log(myID);
        updatePlayers(state);
        updateItems(state);
        updateMaze(state)
        recenterView();
    });
    this.update = update;
    // Ticker will call update to begin the game loop
    app.ticker.add(this.update.bind(this)); // pass current context to update function
}

/* 
 * updateMaze: given a game state object (state), update the location of all 
 * maze sprites
 */ 
function updateMaze(state) {
    var wallCnt = 0;
    mazeBounds = getRelevantTiles(maze, player);
    for (var i = mazeBounds.l; i < mazeBounds.r; i++) {
        for (var j = mazeBounds.u; j < mazeBounds.d; j++) {
            if (maze[i][j] == 0) {
                wallSprites[wallCnt].x = i * WALL_WIDTH;
                wallSprites[wallCnt].y = j * WALL_WIDTH;
                wallSprites[wallCnt].visible = true;
                wallCnt += 1;
            }
        }
    }
    // make any unused wall sprites invisible
    while (wallSprites[wallCnt].visible) {
        wallSprites[wallCnt].visible = false;
        wallCnt += 1;
    }
}

/* 
 * updatePlayers: given a game state object (state), update the location of all 
 * player sprites
 */ 
var bulletsNum; // Text to display the number of bullets - updated everytime newGameState is changed
function updatePlayers(state, gameTextStyle) {
    // draw player sprites
    var cnt = 0;
    for (var i = 0; i < state.players.length; i++) {
        // Update my character
        if (myID == state.players[i].id) {
            player.x = state.players[i].x;
            player.y = state.players[i].y;
            hp.width = (state.players[i].health/100) * hpBkg.width;

            // Create texts for number of bullets
            var index = gameUI.children.indexOf(bulletsNum);
            if (index !== -1) gameUI.removeChild(bulletsNum);
            bulletsNum = new PIXI.Text(state.players[i].bullets, gameTextStyle);
            bulletsNum.x = app.screen.width - 200;
            bulletsNum.y = 235;
            gameUI.addChild(bulletsNum);
        } else { 
            // Update other characters
            if (cnt < otherPlayerSprites.length) {
                otherPlayerSprites[cnt].x = state.players[i].x;
                otherPlayerSprites[cnt].y = state.players[i].y;
            } else { // generate more player sprites
                var newSpr = newSprite(p2Frames.down, state.players[i].x, state.players[i].y, true);
                otherPlayerSprites.push(newSpr);
            }
            cnt += 1;
        }
    }
    // destroy any extra sprites if players leave
    while (state.players.length-1 < otherPlayerSprites.length) {
        otherPlayerSprites.pop().destroy();
    }
}

/*
 * updateItems: given a game state object (state), update the location of all 
 * item sprites
 */
function updateItems(state) {
        // draw item sprites
        aS = 0;
        pS = 0;
        for (var i = 0; i < state.items.length; i++) {
            item = state.items[i];
            if (item.type == 'Ammo') {
                if (aS >= ammoSprites.length) {
                    ammoSprites.push(newAmmoSprite());
                }
                ammoSprites[aS].x = item.x;
                ammoSprites[aS].y = item.y;
                aS += 1;
            } else if (item.type == 'Potion') {
                if (pS >= potionSprites.length) {
                    potionSprites.push(newPotionSprite());
                }
                potionSprites[pS].x = item.x;
                potionSprites[pS].y = item.y;
                pS += 1;
            }
        }
        // delete unused ammo sprites
        while (aS < ammoSprites.length) {
            ammoSprites.pop().destroy();
        }
        // delete unused potion sprites
        while (pS < potionSprites.length) {
            potionSprites.pop().destroy();
        }
}

function recenterView() {
    xdiff = w/2 - player.worldTransform.tx;
    ydiff = h/2 - player.worldTransform.ty;
    mazeContainer.x += xdiff;
    mazeContainer.y += ydiff;
}

function handleInput(delta) {
    this.local_time += delta;
    var input = {};
    input.x_dir = 0;
    input.y_dir = 0;
    if (left.isDown){
        input.x_dir += -1;
    }
    if (right.isDown){
        input.x_dir += 1;
    }
    if (up.isDown){
        input.y_dir += -1;
    }
    if (down.isDown){
        input.y_dir += 1;
    }
    if (shoot.isDown){
        setSprite(playerSprites.shoot);
    }
    if (input.x_dir != 0 || input.y_dir != 0) {
        this.input_seq += 1;
        input.time = this.local_time;
        input.seq = this.input_seq;
        inputs.push(input);
        socket.emit('move', input);
        // change the player's sprite based off movement
        if (input.x_dir == 1) setSprite(playerSprites.right);
        else if (input.x_dir == -1) setSprite(playerSprites.left);
        else if (input.y_dir == 1) setSprite(playerSprites.down);
        else if (input.y_dir == -1) setSprite(playerSprites.up);
    }
   

    // maze
    //console.log(maze);
    //console.log(maze[Math.floor(tmp_x / 50)][Math.floor(tmp_y / 50)]);

    //console.log(maze == null);
    if (maze != null) {
        // console.log(maze);
        
        var tmp_x = player.x + input.x_dir*speed*delta;
        var tmp_y = player.y + input.y_dir*speed*delta;
        // console.log(maze[Math.floor(tmp_x / 100)][Math.floor(tmp_y / 100)]);
        if (maze[Math.floor(tmp_x / 100)][Math.floor(tmp_y / 100)] == 1) {
        
            player.x = tmp_x;
            player.y = tmp_y;
        }
    } else {
        

        player.x += input.x_dir*speed*delta;
        player.y += input.y_dir*speed*delta;
    }
    
    
    return input;
}

socket.on('onconnected', function(msg){
    console.log('My server id is '+msg.id);
    myID = msg.id;
});

function update(delta) {
    checkCollisions();
    handleInput(delta);
}

// A keyboard function to manage keypresses for the given keyCode
// Taken from this tutorial: https://github.com/kittykatattack/learningPixi#keyboard
function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
    if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
    }
    event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = event => {
    if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
    }
    event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
    "keydown", key.downHandler.bind(key), false);
    window.addEventListener(
    "keyup", key.upHandler.bind(key), false);
    return key;
}

// Maze sprite
function newWallSprite(x, y) {
    wall = PIXI.Sprite.fromImage('assets/Wall.png');
    wall.width = WALL_WIDTH;
    wall.height = WALL_WIDTH;
    wall.x = x * WALL_WIDTH;
    wall.y = y * WALL_WIDTH;
    wall.visible = false;
    wallSprites.push(wall);
    return wall;
}

function newAmmoSprite() {
    ammo = PIXI.Sprite.fromImage('assets/Ammo.png');
    ammo.scale.x *= .1;
    ammo.scale.y *= .1;
    itemContainer.addChild(ammo);
    return ammo;
}

function newPotionSprite() {
    sprite = new PIXI.extras.AnimatedSprite(potionFrames);
    sprite.scale.x *= .2;
    sprite.scale.y *= .2;
    sprite.anchor.set(0.5);
    sprite.animationSpeed = 0.1;
    sprite.play();
    itemContainer.addChild(sprite);
    return sprite;
}

function newHPSprite(lighting){
    spriteBkg = new PIXI.Sprite.fromImage('assets/HPBkg.png');
    spriteBkg.scale.x *= .4;
    spriteBkg.scale.y *= .4;
    spriteBkg.x = w - 250;
    spriteBkg.y = 110;
    spriteHP = new PIXI.Sprite.fromImage('assets/HP.png');
    spriteHP.scale.x *= .4;
    spriteHP.scale.y *= .4;
    spriteHP.x = w - 250;
    spriteHP.y = 110;
    gameUI.addChild(spriteBkg);
    gameUI.addChild(spriteHP);
    return {spriteBkg: spriteBkg, spriteHP: spriteHP};
}


/*
 * getRelevantTiles: returns the bounds of tiles in the maze that are close
 * enough to be seen by the player
 */
function getRelevantTiles(maze, player) {
    row = Math.floor(player.x / WALL_WIDTH); 
    col = Math.floor(player.y / WALL_WIDTH);
    bounds = {};
    bounds.l = Math.max(0,row - 6);
    bounds.u = Math.max(col - 6);
    bounds.r = Math.min(row + 6, maze.length);
    bounds.d = Math.min(col + 6, maze[0].length);
    return bounds;
}


/* 
 * Constructs a sprite from the given frames and places it at the desired x and y
 * position. Will be visible if isVisible. 
 */
function newSprite(frames, x, y, isVisible) {
    var sprite = new PIXI.extras.AnimatedSprite(frames);
    if (frames == p1Frames.shoot || frames == p2Frames.shoot) {
        sprite.width = 48;
        sprite.height = 76;
        // shift it back and up since shooting sprite is taller
        sprite.x = x - 6; 
        sprite.y = y - 11;
    } else {
        sprite.width = 42;
        sprite.height = 66;
        sprite.x = x;
        sprite.y = y;
    }
    sprite.anchor.set(0.5);
    sprite.animationSpeed = 0.1;
    sprite.play();
    charContainer.addChild(sprite);
    sprite.visible = isVisible;
    return sprite;
}
