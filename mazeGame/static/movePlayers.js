// make a client socket
var socket = io();

var inputs = []; // a log of this player's last few inputs
var myID; // the server generated ID
var local_time = 0.016;
var speed = 1;

// sprite animation frames
var skeletonFrames; 
var scottyFrames;
var otherPlayerSprites = [];

var left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

// make a PIXI canvas
var app = new PIXI.Application({
          width: 512, 
          height: 512,
          antialiasing: true, 
          transparent: false, 
          resolution: 1
        });
// Display the PIXI canvas
document.body.appendChild(app.view);

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
    app.stage.addChild(instructionText);

    // Bring in image assets
    var team1 = PIXI.Sprite.fromImage('/assets/Team1.png');
    var team2 = PIXI.Sprite.fromImage('/assets/Team2.png');
    var ready = PIXI.Sprite.fromImage('/assets/ReadyButton.png');

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

    // Style for UI text
    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: ['#ffffff'] // gradient
    });

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
        // First, get rid of previous text2
        var index = app.stage.children.indexOf(text2);
        if (index !== -1) app.stage.removeChild(text2);

        teamSelected = 1;
        text1 = new PIXI.Text('You Selected Team 1', style);
        text1.x = 50;
        text1.y = app.screen.height / 2 + 30;
        app.stage.addChild(text1);
    });

    // When team 2 is selected,
    team2.on('pointerdown', function() {
        // First, get rid of previous text1
        var index = app.stage.children.indexOf(text1);
        if (index !== -1) app.stage.removeChild(text1);

        teamSelected = 2;
        text2 = new PIXI.Text('You Selected Team 2', style);
        text2.x = app.screen.width - 220;
        text2.y = app.screen.height / 2 + 30;
        app.stage.addChild(text2);
    });

    // When Ready button is clicked,
    ready.on('pointerdown', function() {

        if (teamSelected === 0) {
            var msg = new PIXI.Text('You should select a team before you begin', style);
            msg.x = 70;
            msg.y = app.screen.height - 70;
            app.stage.addChild(msg);
        }

        else if (teamSelected === 1) {
            socket.emit('teamSelection', 1); // send out final selection
            // Disable ready button
            ready.interactive = false;
            ready.buttonMode = false;
        }

        else if (teamSelected === 2) {
            socket.emit('teamSelection', 2); // send out final selection
            // Disable ready button
            ready.interactive = false;
            ready.buttonMode = false;
        }
        
    });

    // Alternatively, use the mouse & touch events:
    // sprite.on('click', onClick); // mouse-only
    // sprite.on('tap', onClick); // touch-only

    app.stage.addChild(team1);
    app.stage.addChild(team2);
    app.stage.addChild(ready);
}

function onAssetsLoaded() {
    // create an array of textures from an image path
    var frames = [];
    // load each frame from spritesheet
    for (var i = 0; i < 4; i++) {
        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.fromFrame('ScottyPlayerLantern' + i + '.png'));
    }
    scottyFrames = frames;
    // create an AnimatedSprite
    player = new PIXI.extras.AnimatedSprite(scottyFrames);

    frames = [];
    for (var i = 0; i < 7; i++) {
        frames.push(PIXI.Texture.fromFrame('SkeletonWalk' + i + '.png'));
    }
    skeletonFrames = frames;

    /*
     * An AnimatedSprite inherits all the properties of a PIXI sprite
     * so you can change its position, its anchor, mask it, etc
     */
    player.width = 120;
    player.height = 120;
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
    player.anchor.set(0.5);
    player.animationSpeed = 0.05;
    player.play();

    app.stage.addChild(player);

    this.player = player;
    socket.on('newGameState', function(state){
        console.log(state);
        console.log(myID);
        var cnt = 0;
        for (var i = 0; i<state.length; i++) {
            if (myID == state[i].id) {
                player.x = state[i].x;
                player.y = state[i].y;
            } else {
                if (cnt < otherPlayerSprites.length) {
                    otherPlayerSprites[cnt].x = state[i].x;
                    otherPlayerSprites[cnt].y = state[i].y;
                } else { // generate more player sprites
                    var newSpr = newSprite(skeletonFrames, state[i].x, state[i].y, true);
                    otherPlayerSprites.push(newSpr);
                }
                cnt += 1;
            }
        }
        // destroy any extra sprites if players leave
        while (state.length-1 < otherPlayerSprites.length) {
            otherPlayerSprites.pop().destroy();
        }
    });
    this.update = update;
    // Ticker will call update to begin the game loop
    app.ticker.add(this.update.bind(this)); // pass current context to update function
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
    if (input.x_dir != 0 || input.y_dir != 0) {
        this.input_seq += 1;
        input.time = this.local_time;
        input.seq = this.input_seq;
        inputs.push(input);
        socket.emit('move', input);
    }
    player.x += input.x_dir*speed*delta;
    player.y += input.y_dir*speed*delta;
    return input;
}

socket.on('onconnected', function(msg){
    console.log('My server id is '+msg.id);
    myID = msg.id;
});

function update(delta) {
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

/* Constructs a sprite from the given frames and places it at the desired x and y
 * position. Will be visible if isVisible. 
 */
function newSprite(frames, x, y, isVisible) {
    var sprite = new PIXI.extras.AnimatedSprite(frames);
    sprite.width = 100;
    sprite.height = 100;
    sprite.x = x
    sprite.y = y
    sprite.anchor.set(0.5);
    sprite.animationSpeed = 0.1;
    sprite.play();
    app.stage.addChild(sprite);
    sprite.visible = isVisible;
    return sprite;
}
