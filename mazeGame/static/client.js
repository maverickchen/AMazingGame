/* 
Client-side code to display our maze game. Runs in the browser. 
Client side prediction code is heavily based off of: 
https://github.com/underscorediscovery/realtime-multiplayer-in-html5
*/

// make a client socket
var socket = io();

// Model variables
var inputs = []; // a log of this player's last few inputs
var input_seq = 0;
var serverStates = []; // log of most recent server updates
var localState = {}; // client-side model of game state
var myID; // the server-generated ID
var netOffset = 100;
var offsetData = [];
var gameInProgress = false;

var updateViewFn;
var physicsUpdateHandle;

var currTime = new Date().getTime();
var ping = 0;
const WALL_WIDTH = 100;
var maze;

var lighting;

// View variables
// sprite animation frames
var p1Frames = {};
var p2Frames = {};
var potionFrames = []; // frames are needed to build more sprites dynamically

// created sprites
var potionSprites = [];
var ammoSprites = [];
var playerSprites = {};
var wallSprites = [];
var floorSprites = [];
var bulletSprites = {lefts:[], rights:[], ups:[], downs:[]};
var bkgMusic;

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


var backButton;

// make a PIXI canvas
var app = new PIXI.Application({
          width: 1280, 
          height: 624,
          antialiasing: true, 
          transparent: false, 
          resolution: 1
        });

// Display the PIXI canvas
document.body.appendChild(app.view);
// create the stage instead of container - needed for layers
app.stage = new PIXI.display.Stage();

/* Make Containers to manage separate sprite groups */

// Container for game ID input
//var gameID = new PIXI.Container();
//app.stage.addChild(gameID);

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

var mazeSpritesContainer = new PIXI.Container();
mazeContainer.addChild(mazeSpritesContainer);

var itemContainer = new PIXI.Container();
mazeContainer.addChild(itemContainer);

var charContainer = new PIXI.Container();
mazeContainer.addChild(charContainer);
charContainer.x += 21;
charContainer.y += 33;

var localPlayerContainer = new PIXI.Container();
gameView.addChild(localPlayerContainer);
localPlayerContainer.x += 21;
localPlayerContainer.y += 33;

var gameUI = new PIXI.Container();
gameScreen.addChild(gameUI);

var endGameContainer = new PIXI.Container();
app.stage.addChild(endGameContainer);
endGameContainer.visible = false;

// Should come last because we want the tutorial screen to be over everything
var tutorialScreen = new PIXI.Container();
app.stage.addChild(tutorialScreen);
tutorialScreen.visible = false;

// app.renderer.view.style.position = "absolute"
// app.renderer.view.style.width = window.innerWidth - 50 + "px";
// app.renderer.view.style.height = window.innerHeight - 50 + "px";
// app.renderer.view.style.display = "block";

//To change the background color
app.renderer.backgroundColor = 0x061639;
var graphics = new PIXI.Graphics();

window.onload = chooseTeam;

socket.on('onconnected', function(msg){
    myID = msg.id;
});

/* --------------------------------------------------------------------------
-----------------------------------------------------------------------------

                START SCREEN FUNCTIONS

-----------------------------------------------------------------------------
-------------------------------------------------------------------------- */

var team1_ppl = 0;
var team2_ppl = 0;


// Style for UI text
var style = new PIXI.TextStyle({
    fontFamily: "\"Lucida Console\", Monaco, monospace",
    fontSize: 18,
    fontWeight: 'bold',
    fill: ['#ffffff'] // gradient
});
var team1_text;
var team2_text;
socket.on('peopleInTeam', function(arr) {
        //console.log("received");
        var index = startScreen.children.indexOf(team1_text);
        if (index !== -1) startScreen.removeChild(team1_text);
        var index = startScreen.children.indexOf(team2_text);
        if (index !== -1) startScreen.removeChild(team2_text);

        team1_ppl = arr[0];
        team2_ppl = arr[1];
        team1_text = new PIXI.Text('There are ' + team1_ppl + ' / 2 people in team 1', style);
        team1_text.x = 300;
        team1_text.y = app.screen.height / 2 - 150;
        startScreen.addChild(team1_text);
        team2_text = new PIXI.Text('There are ' + team2_ppl + ' / 2 people in team 2', style);
        team2_text.x = app.screen.width - 550;
        team2_text.y = app.screen.height / 2 - 150;
        startScreen.addChild(team2_text);
});

// StartScreen UI Buttons
var team1;
var team2;
var ready;
// Startscreen UI text
var text1;
var text2;
var msg;
var cantEnter;
var waitText;

function chooseTeam() {

    // Style for instructionText
    var instructionStyle = new PIXI.TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        fontSize: 30,
        fontWeight: 'bold',
        fill: ['#E84F2E'] // gradient
    });
    instructionText = new PIXI.Text('Choose Your Team!', instructionStyle);
    instructionText.anchor.set(0.5);
    instructionText.x = app.screen.width / 2;
    instructionText.y = 70;
    startScreen.addChild(instructionText);

    // Test if input box works - TODO if we have time
    //var PIXI = require("pixi.js");
    //var PixiTextInput = require('pixitextinput');
    //var inputField = new PIXITextInput('hello', instructionStyle);
    //inputField.x = 115;
    //inputField.y = 100;
    //startScreen.addChild(inputField);

    // Bring in image assets
    team1 = PIXI.Sprite.fromImage('/assets/Team1.png');
    team2 = PIXI.Sprite.fromImage('/assets/Team2.png');
    ready = PIXI.Sprite.fromImage('/assets/ReadyButton.png');
    var questionMark = PIXI.Sprite.fromImage('/assets/Instruction.png');
    // Maze 
    var wall = PIXI.Sprite.fromImage('/assets/wall.png');

    // Set the initial position and scale
    team1.anchor.set(0.5);
    team1.x = app.screen.width / 3;
    team1.y = app.screen.height / 2 - 50;
    team1.scale.x *= 0.3;
    team1.scale.y *= 0.3;

    team2.anchor.set(0.5);
    team2.x = app.screen.width / 3 * 2;
    team2.y = app.screen.height / 2 - 50;
    team2.scale.x *= 0.3;
    team2.scale.y *= 0.3;

    ready.anchor.set(0.5);
    ready.x = app.screen.width / 2;
    ready.y = app.screen.height / 5 * 4 - 50;
    ready.scale.x *= 0.3;
    ready.scale.y *= 0.3;

    questionMark.anchor.set(0.5);
    questionMark.x = 100;
    questionMark.y = 100;
    questionMark.scale.x *= 1;
    questionMark.scale.y *= 1;

    // Opt-in to interactivity
    team1.interactive = true;
    team2.interactive = true;
    ready.interactive = true;
    questionMark.interactive = true;

    

    // Shows hand cursor
    team1.buttonMode = true;
    team2.buttonMode = true;
    ready.buttonMode = true;
    questionMark.buttonMode = true;

    team1.on('pointerover', () => {
                // Add sound effect to the button in the home page
                PIXI.sound.Sound.from({
                    url: 'assets/backToMainPage.mp3',
                    autoPlay: true,
                });
                 team1.scale.x *= 1.5; 
                 team1.scale.y *= 1.5; 
            })
            .on('pointerout', () => {
                team1.scale.x /= 1.5; 
                team1.scale.y /= 1.5; 
    });
    team2.on('pointerover', () => {
                PIXI.sound.Sound.from({
                    url: 'assets/backToMainPage.mp3',
                    autoPlay: true,
                });
                team2.scale.x *= 1.5; 
                team2.scale.y *= 1.5;
            })
            .on('pointerout', () => {
                team2.scale.x /= 1.5; 
                team2.scale.y /= 1.5;
    });
    ready.on('pointerover', () => {
                PIXI.sound.Sound.from({
                    url: 'assets/backToMainPage.mp3',
                    autoPlay: true,
                });
                ready.scale.x *= 2; 
                ready.scale.y *= 2;
            })
            .on('pointerout', () => {
                ready.scale.x /= 2;
                 ready.scale.y /= 2;
                });
    
    // Load tutorial assets
    var panel = PIXI.Sprite.fromImage('assets/TutorialPage.png');
    panel.anchor.set(0.5);
    panel.x = app.screen.width / 2;
    panel.y = app.screen.height / 2 + 70;
    panel.scale.x *= 8;
    panel.scale.y *= 5;
    tutorialScreen.addChild(panel);

    var tutorial_style = new PIXI.TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        fontSize: 20,
        fontWeight: 'bold',
        fill: ['#121314'] // gradient
    });

    var tutorial_text = "You're locked in a dungeon! \nYour only way out is to shoot and kill" +
    " everyone in the other team. \nMove with the ARROW keys. \nShoot with SPACE bar." + 
    "\nYour health decreases whether or not you're moving, \n so be sure to keep navigating" +
    " to pick up bullets and health potions! \n \nGOOD LUCK!";
    var tutorialText = new PIXI.Text(tutorial_text, tutorial_style);
    tutorialText.anchor.set(0.5);
    tutorialText.x = app.screen.width / 2;
    tutorialText.y = app.screen.height / 2;
    tutorialScreen.addChild(tutorialText);

    // When user hovers over question mark,
    questionMark.on('pointerover', function() {
        // Render instruction screen
        PIXI.sound.Sound.from({
            url: 'assets/backToMainPage.mp3',
            autoPlay: true,
        });
        tutorialScreen.visible = true;
    });
    questionMark.on('pointerout', function() {
        // Hide instruction screen
        tutorialScreen.visible = false;
    });

    text1 = new PIXI.Text('', style);
    text1.x = 335;
    text1.y = app.screen.height / 2 + 30;
    startScreen.addChild(text1);
    text2 = new PIXI.Text('', style);
    text2.x = app.screen.width - 515;
    text2.y = app.screen.height / 2 + 30;
    startScreen.addChild(text2);
    var teamSelected = 0;

    // When team 1 is selected,
    team1.on('pointerdown', function() {
        text1.text = 'You Selected Team 1';
        text2.text = '';
        teamSelected = 1;
    });

    // When team 2 is selected,
    team2.on('pointerdown', function() {
        text1.text = '';
        text2.text = 'You Selected Team 2';
        teamSelected = 2;
    });

    msg = new PIXI.Text('', style);
    msg.x = app.screen.width / 2 - 170;
    msg.y = app.screen.height - 70;
    startScreen.addChild(msg);

    cantEnter = new PIXI.Text('',style);
    cantEnter.x = app.screen.width / 2;
    cantEnter.y = app.screen.height - 50;
    startScreen.addChild(cantEnter);

    waitText = new PIXI.Text('', style);
    waitText.anchor.set(0.5);
    waitText.x = app.screen.width / 2;
    waitText.y = app.screen.height - 70;
    startScreen.addChild(waitText);

    // When Ready button is clicked,
    ready.on('pointerdown', function() {

        if (teamSelected === 0) {
            msg.text = 'You should select a team before you begin';
        }

        else if (teamSelected === 1 || teamSelected === 2) {
            socket.emit('teamSelection', teamSelected); // send out final selection
            // Check if the selection was valid (already 2 players in the team?)
            socket.on('validChoice', function(isValid) {
                if (isValid) {
                    // Disable ready button
                    ready.interactive = false;
                    ready.buttonMode = false;
                    team1.interactive = false;
                    team1.buttonMode = false;
                    team2.interactive = false;
                    team2.buttonMode = false;
                    // Display "Waiting for other players to get ready..." until game starts
                    msg.text = '';
                    waitText.text = 'Waiting for other players to get ready...';
                }
                else {
                    // Display the msg: You can't enter Team x ...
                    socket.on('message', function(msg) {
                        cantEnter.text = msg;
                    });
                }
            });
        }
    });

    startScreen.addChild(team1);
    startScreen.addChild(team2);
    startScreen.addChild(ready);
    app.stage.addChild(questionMark);
}


// Wait for everyone to get ready - start game when they do
// (Transition into GAME SCREEN code)
socket.on('canStartGame', function(initialGameState) {
    // suppress all the startScreen messages
    if (text1) text1.text = '';
    if (text2) text2.text = '';
    if (msg) msg.text = '';
    if (cantEnter) cantEnter.text = '';
    if (waitText) waitText.text = '';

    startGame(initialGameState);
});

/* --------------------------------------------------------------------------
-----------------------------------------------------------------------------

                GAME SCREEN FUNCTIONS

-----------------------------------------------------------------------------
-------------------------------------------------------------------------- */


var gameTextStyle = new PIXI.TextStyle({
        fontFamily: "\"Lucida Console\", Monaco, monospace",
        fontSize: 20,
        fontWeight: 'bold',
        fill: ['#05090c'] // gradient
    });

PIXI.loader.add('assets/Player1Up.json')
    .add('assets/Player1Down.json')
    .add('assets/Player1Left.json')
    .add('assets/Player1Right.json')
    .add('assets/Player1ShootDown.json')
    .add('assets/Player1ShootUp.json')
    .add('assets/Player1ShootLeft.json')
    .add('assets/Player1ShootRight.json')
    .add('assets/Player2Up.json')
    .add('assets/Player2Down.json')
    .add('assets/Player2Left.json')
    .add('assets/Player2Right.json')
    .add('assets/Player2ShootDown.json')
    .add('assets/Player2ShootUp.json')
    .add('assets/Player2ShootLeft.json')
    .add('assets/Player2ShootRight.json')
    .add('assets/Potion.json')
    .load(onAssetsLoaded);


function onAssetsLoaded() {
    bkgMusic = PIXI.sound.Sound.from({
            url: 'assets/bkgMusic.mp3',
            loop: true,
            volume: 0.6,
    });

    /*************** Display Panel **************/
    var panel = PIXI.Sprite.fromImage('assets/Panel.png');
    panel.x = app.screen.width / 3 * 2;
    panel.y = 30;
    panel.scale.x *= 3.5;
    panel.scale.y *= 4;
    gameUI.addChild(panel);

    // Display Health Potion sprite on panel
    var healthSprite = PIXI.Sprite.fromImage('assets/PotionExample.png');
    healthSprite.x = app.screen.width - 335;
    healthSprite.y = 270;
    healthSprite.scale.x *= 0.3;
    healthSprite.scale.y *= 0.3;
    gameUI.addChild(healthSprite);

    // Display Bullet sprite on panel
    var bulletSprite = PIXI.Sprite.fromImage('assets/Ammo.png');
    bulletSprite.x = app.screen.width - 340;
    bulletSprite.y = 400;
    bulletSprite.scale.x *= 0.15;
    bulletSprite.scale.y *= 0.15;
    gameUI.addChild(bulletSprite);

    hpObj = newHPSprite();
    hpBkg = hpObj.spriteBkg;
    hp = hpObj.spriteHP;

    bulletsNum = new PIXI.Text('', gameTextStyle); // Text to display the number of bullets - updated everytime newGameState is changed
    bulletsNum.x = app.screen.width - 200;
    bulletsNum.y = 410;

    healthText = new PIXI.Text('', gameTextStyle);
    healthText.x = app.screen.width - 235;
    healthText.y = 290;

    gameUI.addChild(bulletsNum);
    gameUI.addChild(healthText);

    /*
    this.gameTextStyle = gameTextStyle;
    var healthPointText = new PIXI.Text('HP:', gameTextStyle);
    healthPointText.x = app.screen.width - 350;
    healthPointText.y = 115;
    gameUI.addChild(healthPointText);
    */

    /*
    // Display user's id - hardcoded for now
    var userID = new PIXI.Text('User', gameTextStyle);
    userID.x = app.screen.width - 350;
    userID.y = 155;
    gameUI.addChild(userID);
    */

    /*
    // Display bullet remaining - also hardcoded
    var bulletsRemaining = new PIXI.Text('Bullets Left:', gameTextStyle);
    bulletsRemaining.x = app.screen.width - 350;
    bulletsRemaining.y = 235;
    gameUI.addChild(bulletsRemaining);
    */

    /*
    // Leave space for customized maze
    var mazeText = new PIXI.Text('Your Maze:', gameTextStyle);
    mazeText.x = app.screen.width - 350;
    mazeText.y = 275;
    gameUI.addChild(mazeText);
    */

    // make the background dark by putting a layer over it
    lighting = new PIXI.display.Layer();
    lighting.on('display', function (element) {
        element.blendMode = PIXI.BLEND_MODES.ADD
    });
    lighting.useRenderTexture = true;
    lighting.clearColor = [0.03, 0.03, 0.03, 1]; // dark gray

    gameView.addChild(lighting);

    var lightingSprite = new PIXI.Sprite(lighting.getRenderTexture());
    lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    gameView.addChild(lightingSprite);
    
    loadSpriteFrames(lighting);
    loadMazeSprites();
    loadBulletSprites();
    loadEndgameAssets();
}


var panelPlayerSprite;
var panelUserTeam;
/* 
 * initPanel: redraw round-specific information on the panel
 */
function initPanel() {

    if (panelPlayerSprite) panelPlayerSprite.destroy();

    // Display Player Sprite on Panel
    if (localState.players[myID].teamNumber === 1) {
        panelPlayerSprite = PIXI.Sprite.fromImage('assets/Player1Example.png');
    } else {
        panelPlayerSprite = PIXI.Sprite.fromImage('assets/Player2Example.png');
    }
    panelPlayerSprite.x = app.screen.width - 340;
    panelPlayerSprite.y = 125;
    panelPlayerSprite.scale.x *= 0.4;
    panelPlayerSprite.scale.y *= 0.4;
    gameUI.addChild(panelPlayerSprite);

    // Display user's team
    if (panelUserTeam) panelUserTeam.text = "Team " + localState.players[myID].teamNumber;
    else {
        panelUserTeam = new PIXI.Text("Team " + localState.players[myID].teamNumber, gameTextStyle);
        panelUserTeam.x = app.screen.width - 230;
        panelUserTeam.y = 150;
        gameUI.addChild(panelUserTeam);
    }
}


function startGame(initialGameState) {
    gameInProgress = true;

    // zero out / initialize any existing game model data
    inputs = [];
    input_seq = 0;
    netOffset = 100;
    serverStates = [];
    offsetData = [];
    localState = initialGameState;
    serverStates.push(initialGameState);
    localState.lastServerUpdate = initialGameState.t;

    ping = new Date().getTime() - initialGameState.t;
    currTime = initialGameState.t - netOffset;

    if (bkgMusic) bkgMusic.play();

    // suppress the startScreen UI elements and show the game screen
    startScreen.visible = false;
    gameScreen.visible = true;

    maze = initialGameState.maze;
    this.localState = localState;
    this.update = update;
    this.inputs = inputs;
    this.maze = maze;
    this.mazeContainer = mazeContainer;
    this.WALL_WIDTH = WALL_WIDTH;

    initPanel();
    loadPlayerSprites(initialGameState);
    updatePlayerSprites(localState, gameTextStyle);
    updateItemSprites(localState);
    updateMazeSprites(localState);
    
    // start game loops
    updateViewFn = update.bind(this);
    updatePhysicsFn = physicsUpdate.bind(this);
    app.ticker.add(updateViewFn); 
    physicsUpdateHandle = setInterval(updatePhysicsFn, 15); // run every 15ms
}

/* --------------------------------------------------------------------------
-----------------------------------------------------------------------------

                UPDATE FUNCTIONS

-----------------------------------------------------------------------------
-------------------------------------------------------------------------- */

function update(delta) {
    handleInput(delta);
    processServerUpdates(currTime,delta);
    updatePlayerSprites(localState, this.gameTextStyle);
    updateItemSprites(localState);
    updateBulletSprites(localState);
    updateMazeSprites(localState);
}

socket.on('newGameState', function(state){
    if (gameInProgress) {
        serverStates.push(state);
        ping = new Date().getTime() - state.t;
        currTime = state.t - netOffset;
        if (serverStates.length >= 60*2) { // keep 2 seconds worth of serverStates
            serverStates.splice(0,1); 
        }
        if (inputs.length) { 
            offset = new Date().getTime() - inputs[0].time; 
            offsetData.push(offset/2);
            netOffset = getAvg(offsetData);
            if (offsetData.length >= 20) offsetData.splice(0,1);
        }
        replayUsingKnownPos(serverStates, inputs);
    }
});

// Taken from stackoverflow. Gets the average value of an array.
function getAvg(times) {
    return times.reduce(function (p, c) {
        return p + c;
    }) / times.length;
}

var shootPressedBefore = false;

function handleInput(delta) {
    if (localState.players[myID].health > 0) {
        var input = {};
        input.x_dir = 0;
        input.y_dir = 0;
        input.shooting = false;
        if (left.isDown) input.x_dir += -1; 
        if (right.isDown) input.x_dir += 1; 
        if (up.isDown) input.y_dir += -1;
        if (down.isDown) input.y_dir += 1; 
        if (shoot.isDown) shootPressedBefore = true; // guarantee 1 space bar press => 1 bullet
        if (shoot.isUp && shootPressedBefore) {
            input.shooting = true; 
            shootPressedBefore = false;
            PIXI.sound.Sound.from({
                    url: 'assets/GunShot.mp3',
                    autoPlay: true,
            });
        }
        if (input.x_dir != 0 || input.y_dir != 0 || input.shooting) {
            input_seq += 1;
            input.time = new Date().getTime();
            input.seq = input_seq;
            socket.emit('move', input);
            inputs.push(input);
            // change the player's sprite based off movement

            if (input.x_dir == 1) setSprite(playerSprites[myID].right, myID);
            else if (input.x_dir == -1) setSprite(playerSprites[myID].left, myID);
            else if (input.y_dir == 1) setSprite(playerSprites[myID].down, myID);
            else if (input.y_dir == -1) setSprite(playerSprites[myID].up, myID);
            else if (input.shooting) {
                if (input.x_dir == 0 && input.y_dir == 0) {
                    var facing = localState.players[myID].orientation;
                    if (facing == 'r') {
                        setSprite(playerSprites[myID].shootRight, myID);
                    } else if (facing == 'l') {
                        setSprite(playerSprites[myID].shootLeft, myID);
                    } else if (facing == 'u') {
                        setSprite(playerSprites[myID].shootUp, myID);
                    } else {
                        setSprite(playerSprites[myID].shootDown, myID);
                    }
                } else {
                    if (input.x_dir == 1) setSprite(playerSprites[myID].shootRight, myID);
                    else if (input.x_dir == -1) setSprite(playerSprites[myID].shootLeft, myID);
                    else if (input.y_dir == 1) setSprite(playerSprites[myID].shootDown, myID);
                    else setSprite(playerSprites[myID].shootUp, myID);
                }
            }
        }
    }
}


/*
 * getRelevantTiles: returns the bounds of tiles in the maze that are close
 * enough to be seen by the player
 */
function getRelevantTiles(maze, player) {
    row = Math.floor(player.y / WALL_WIDTH); 
    col = Math.floor(player.x / WALL_WIDTH);
    bounds = {};
    bounds.l = Math.max(0, col - 5);
    bounds.u = Math.max(0, row - 5);
    bounds.r = Math.min(col + 5, maze[0].length);
    bounds.d = Math.min(row + 5, maze.length);
    return bounds;
}

/* 
 * processServerUpdates: update the position of other players using server data
 * interpolates between the last known server position and a new target position using 
 * more recent server data
 * Note if there aren't any serverStates, we can't do anything.
 */
function processServerUpdates(time, delta) {
    if (serverStates.length) {
        var next;
        var prev;
        var latest = serverStates[serverStates.length - 1];
        for (var i = 0; i < serverStates.length - 1; i++) {
            if (serverStates[i].t < time && 
                time < serverStates[i+1].t) {
                next = serverStates[i+1];
                prev = serverStates[i];
                break;
            }
        }
        if (next && prev) {
            progress = time - prev.t;
            totalTime = next.t - prev.t;
            var ratio = progress/totalTime;
            // apply item changes immediately
            localState.items = prev.items;
            localState.bullets_list = prev.bullets_list;
            localState.players[myID].bullets = prev.players[myID].bullets;
            localState.players[myID].health = prev.players[myID].health;
            for (var id in localState.players) {
                if (myID != id) {
                    // interpolate player position
                    if (prev.players[id] && next.players[id]) {
                        smoothInterpolatePlayer(prev, next, id, ratio, delta);
                        localState.players[id].health = prev.players[id].health;
                        localState.players[id].orientation = prev.players[id].orientation;
                    }
                }
            }
        } else { // (!next && !prev)
            // no states to interpolate between; just snap other players to 
            // oldest server position
            oldest = serverStates[0];
            localState.items = oldest.items;
            localState.bullets_list = oldest.bullets_list;
            localState.players[myID].bullets = oldest.players[myID].bullets;
            localState.players[myID].health = oldest.players[myID].health;
            for (var id in localState.players) {
                if (myID != id) {
                    if (oldest.players[id]) {
                        localState.players[id] = oldest.players[id];
                        localState.players[id].health = oldest.players[id].health;
                        localState.players[id].orientation = oldest.players[id].orientation;
                    }
                }
            }
        }
    }
}

/* 
 * smoothInterpolatePlayer: given two server states and a player, interpolate between 
 * that player's positions at each state but use smoothing
 */
function smoothInterpolatePlayer(prev, next, id, ratio, delta) {
    var smoothingAmount = (delta * 16.666666 / 1000) * 25;
    var px = prev.players[id].x;
    var py = prev.players[id].y;
    var nx = next.players[id].x;
    var ny = next.players[id].y;
    var intX = px + (nx - px)*ratio;
    var intY = py + (ny - py)*ratio;
    var playX = localState.players[id].x;
    var playY = localState.players[id].y;
    localState.players[id].x = playX + (intX - playX) * smoothingAmount;
    localState.players[id].y = playY + (intY - playY) * smoothingAmount;
}


// Using the last received information from the server, we reapply all client 
// inputs from that point forward to the server information to ensure that our 
// player is still at the right place
function replayUsingKnownPos(serverStates, clientInputs) {
    lastServerState = serverStates[serverStates.length - 1]
    if (lastServerState) {
        lastServerStateTime = lastServerState.t;
        // delete client inputs that have been processed by the server already
        var i = 0;
        while (i < clientInputs.length && clientInputs[i].seq <= lastServerState.players[myID].serverLastInputSeq) {
            i++;
        }
        clientInputs.splice(0,i);

        // replay pending client inputs from the confirmed server position
        localState.players[myID].x = lastServerState.players[myID].x;
        localState.players[myID].y = lastServerState.players[myID].y;
        localState.players[myID].clientLastInputSeq = lastServerState.players[myID].serverLastInputSeq;
        this.localState = localState;
        this.inputs = inputs;
        this.myID = myID;
        this.maze = maze;
        physicsUpdate.bind(this)(); // <-- reapply the remaining inputs
    }
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


/* --------------------------------------------------------------------------
-----------------------------------------------------------------------------

                DRAWING / VIEW / SPRITE FUNCTIONS

-----------------------------------------------------------------------------
-------------------------------------------------------------------------- */

// LOADING SPRITES
/* 
 * loadMazeSprites: load 100 wall and floor sprites to be used and recycled.
 */
function loadMazeSprites() {
    for (var i = 0; i < 100; i++) {
        wallSprites.push(newWallSprite(0,0));
    }
    for (i = 0; i < 100; i++) {
        floorSprites.push(newFloorSprite(0,0));
    }
}


/* 
 * loadBulletSprites: creates bullet sprites and stores them to be recycled
 */
function loadBulletSprites() {
    for (var i = 0; i < 15; i++) {
        bulletSprites.lefts.push(newBulletSprite('l'));
        bulletSprites.rights.push(newBulletSprite('r'));
        bulletSprites.ups.push(newBulletSprite('u'));
        bulletSprites.downs.push(newBulletSprite('d'));
    }
}


/* 
 * loadSpriteFrames: loads ALL the sprite animations and stores them in the global 
 * vars p1Frames p2Frames {.left .right .up .down .shoot} and potionFrames
 */
function loadSpriteFrames(lighting) {
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
        frames.push(PIXI.Texture.fromFrame('Player1ShootDown' + i + '.png'));
    }
    p1Frames.shootDown = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1ShootUp' + i + '.png'));
    }
    p1Frames.shootUp = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1ShootLeft' + i + '.png'));
    }
    p1Frames.shootLeft = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player1ShootRight' + i + '.png'));
    }
    p1Frames.shootRight = frames;

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
        frames.push(PIXI.Texture.fromFrame('Player2ShootDown' + i + '.png'));
    }
    p2Frames.shootDown = frames;

    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2ShootUp' + i + '.png'));
    }
    p2Frames.shootUp = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2ShootLeft' + i + '.png'));
    }
    p2Frames.shootLeft = frames;
    frames = []
    for (var i = 0; i < 8; i++) {
        frames.push(PIXI.Texture.fromFrame('Player2ShootRight' + i + '.png'));
    }
    p2Frames.shootRight = frames;

    // Load Potion frames
    frames = []
    for (var i = 0; i < 10; i++) {
        frames.push(PIXI.Texture.fromFrame('Potion' + i + '.png'));
    }
    potionFrames = frames;
}

/* 
 * playerSprites is an object mapping a player's id to their collection of sprites. 
 * playerSprites[id] is player id's set of sprites
 * playerSprites[id].current is the current sprite displayed for that player
 */
function loadPlayerSprites(initialGameState) {
    // Delete all old playerSprites from the last game to start fresh
    if (playerSprites) {
        for (var id in playerSprites) {
            for (var dir in playerSprites[id]) {
                playerSprites[id][dir].destroy();
            }
        }
    }
    playerSprites = {};

    for (var id in initialGameState.players) {
        var sprites = {};
        var x = 0;
        var y = 0;
        var container = charContainer;
        if (myID == id) {
            container = localPlayerContainer;
            x = app.screen.width / 3 + 21; // add half width of player sprite
            y = app.screen.height / 2 - 33; // subtract half-height of sprite
        }
        if (initialGameState.players[id].teamNumber == 1) {
            sprites.down = newPlayerSprite(p1Frames.down, x, y, true, container);  
            sprites.up = newPlayerSprite(p1Frames.up, x, y, false, container); 
            sprites.left = newPlayerSprite(p1Frames.left, x, y, false, container);
            sprites.right = newPlayerSprite(p1Frames.right, x, y, false, container);
            sprites.shootDown = newPlayerSprite(p1Frames.shootDown, x, y, false, container);
            sprites.shootUp = newPlayerSprite(p1Frames.shootUp, x, y, false, container);
            sprites.shootLeft = newPlayerSprite(p1Frames.shootLeft, x, y, false, container);
            sprites.shootRight = newPlayerSprite(p1Frames.shootRight, x, y, false, container);
            sprites.current = sprites.down;
        } else if (initialGameState.players[id].teamNumber == 2) {
            sprites.down = newPlayerSprite(p2Frames.down, x, y, true, container);  
            sprites.up = newPlayerSprite(p2Frames.up, x, y, false, container); 
            sprites.left = newPlayerSprite(p2Frames.left, x, y, false, container);
            sprites.right = newPlayerSprite(p2Frames.right, x, y, false, container);
            sprites.shootDown = newPlayerSprite(p2Frames.shootDown, x, y, false, container);
            sprites.shootUp = newPlayerSprite(p2Frames.shootUp, x, y, false, container);
            sprites.shootLeft = newPlayerSprite(p2Frames.shootLeft, x, y, false, container);
            sprites.shootRight = newPlayerSprite(p2Frames.shootRight, x, y, false, container);
            sprites.current = sprites.down;
        }

        // Add tombstone sprite
        sprites.dead = new PIXI.Sprite.fromImage('assets/Tombstone.png');
        sprites.dead.scale.x = 3;
        sprites.dead.scale.y = 3;
        sprites.dead.visible = false;
        sprites.dead.anchor.set(0.5);
        container.addChild(sprites.dead);

        if (myID == id) {
            for (var i = 0; i < 9; i++) {
                var lightbulb = new PIXI.Graphics();
                lightbulb.beginFill(0x706050, 1.0);
                lightbulb.drawCircle(0, 0, 500);
                lightbulb.endFill();
                lightbulb.parentLayer = lighting;
                if (i == 0) sprites.down.addChild(lightbulb);
                if (i == 1) sprites.up.addChild(lightbulb);
                if (i == 2) sprites.left.addChild(lightbulb);
                if (i == 3) sprites.right.addChild(lightbulb);
                if (i == 4) sprites.shootDown.addChild(lightbulb);
                if (i == 5) sprites.shootUp.addChild(lightbulb);
                if (i == 6) sprites.shootLeft.addChild(lightbulb);
                if (i == 7) sprites.shootRight.addChild(lightbulb);
                if (i == 8) sprites.dead.addChild(lightbulb);
            }
        }
        playerSprites[id] = sprites;
    }
}


/* 
 * setSprite: given an animatedSprite from var playerSprites{.left.right.up.down.shoot}
 * make the new sprite visible with the right coordinates and the old sprite invisble
 */
function setSprite(animation, id) {
    var isShooting = false;
    if (playerSprites[id].current === playerSprites[id].shootDown || 
        playerSprites[id].current === playerSprites[id].shootUp ||
        playerSprites[id].current === playerSprites[id].shootLeft ||
        playerSprites[id].current === playerSprites[id].shootRight) {
        isShooting = true;
    }
    if (playerSprites[id].current !== animation) {
        var goingToShoot = false;
        if (animation === playerSprites[id].shootDown || 
            animation === playerSprites[id].shootUp ||
            animation === playerSprites[id].shootLeft ||
            animation === playerSprites[id].shootRight) {
            goingToShoot = true;
        }
        offsetX = 1; // account for shooting sprite's different size 
        offsetY = 4;
        newDirSprite = animation;
        if (goingToShoot && !isShooting) {
            // shift sprite up and back and rewind to first frame
            newDirSprite.x = playerSprites[id].current.x - offsetX;
            newDirSprite.y = playerSprites[id].current.y - offsetY;
            animation.gotoAndPlay(4);
        } else if (!goingToShoot && isShooting) {
            newDirSprite.x = playerSprites[id].current.x + offsetX;
            newDirSprite.y = playerSprites[id].current.y + offsetY;
        } else if (animation === playerSprites[id].dead) {
            newDirSprite.x = playerSprites[id].current.x;
            newDirSprite.y = playerSprites[id].current.y;
        } else {
            // (!goingToShoot && !isShooting) || (goingToShoot && isShooting)
            newDirSprite.x = playerSprites[id].current.x;
            newDirSprite.y = playerSprites[id].current.y;
            if (goingToShoot) animation.gotoAndPlay(4);
        }
        newDirSprite.visible = true;
        playerSprites[id].current.visible = false;
        playerSprites[id].current = newDirSprite;
    } else if (isShooting) animation.gotoAndPlay(4);
}


/* 
 * updatePlayerSprites: given a game state object (state), update the location of all 
 * player sprites
 */ 
var bulletsNum;

var healthText;

function updatePlayerSprites(state, gameTextStyle) {
    // draw player sprites
    for (var id in state.players) {
        // Update my character
        if (myID == id) {
            // move maze instead so that local player remains centered
            xdiff = app.screen.width / 3 + 21 - (state.players[id].x);
            ydiff = app.screen.height / 2 - 33 - (state.players[id].y);
            mazeContainer.x = xdiff;
            mazeContainer.y = ydiff;

            hp.width = (state.players[id].health/100) * hpBkg.width;

            // Update text for number of bullets
            bulletsNum.text = state.players[id].bullets;

            // Update text for health
            healthText.text = Math.round(state.players[id].health) + ' / 100';
        } 
        else { // nonlocal players
            if (state.players[id].health > 0) {
                // match sprite with direction of movement
                var facing = state.players[id].orientation;
                playerSprites[id].current.x = state.players[id].x;
                playerSprites[id].current.y = state.players[id].y;
                // if (input.shooting) {
                //     if (facing == 'r') setSprite(playerSprites[id].shootRight, id);
                //     else if (facing == 'u') setSprite(playerSprites[id].shootUp, id);
                //     else if (facing == 'l') setSprite(playerSprites[id].shootLeft, id);
                //     else setSprite(playerSprites[id].shootDown, id);
                // } else {
                if (facing == 'r') setSprite(playerSprites[id].right, id);
                else if (facing == 'u') setSprite(playerSprites[id].up, id);
                else if (facing == 'l') setSprite(playerSprites[id].left, id);
                else setSprite(playerSprites[id].down, id);
                // }
            }
        } 
        // Make player sprites tombstones if their HP is zero.
        if (state.players[id].health === 0) {
            setSprite(playerSprites[id].dead, id);
        }
    }
}


/*
 * updateBulletSprites: given a game state object (state), update the location of all 
 * bullet sprites
 */
function updateBulletSprites(state) {
    lCount = 0;
    rCount = 0;
    uCount = 0;
    dCount = 0;

    if (state.bullets_list != null) {
        for (var i = 0; i < state.bullets_list.length; i++) {
            if(state.bullets_list[i].x_dir == -1){
                if (lCount >= bulletSprites.lefts.length) {
                    bulletSprites.lefts.push(newBulletSprite());
                }
                bulletSprites.lefts[lCount].x = state.bullets_list[i].x;
                bulletSprites.lefts[lCount].y = state.bullets_list[i].y;
                bulletSprites.lefts[lCount].visible = true;
                lCount +=1;
            }
    
            if(state.bullets_list[i].x_dir == 1){
                if (rCount >= bulletSprites.rights.length) {
                    bulletSprites.rights.push(newBulletSprite());
                }
                bulletSprites.rights[rCount].x = state.bullets_list[i].x;
                bulletSprites.rights[rCount].y = state.bullets_list[i].y;
                bulletSprites.rights[rCount].visible = true;
                rCount +=1;
            }
    
            if(state.bullets_list[i].y_dir == -1){
                if(uCount >= bulletSprites.ups.length) {
                    bulletSprites.ups.push(newBulletSprite());
                }
                bulletSprites.ups[uCount].x = state.bullets_list[i].x;
                bulletSprites.ups[uCount].y = state.bullets_list[i].y;
                bulletSprites.ups[uCount].visible = true;
                uCount +=1;
            }
    
            if(state.bullets_list[i].y_dir == 1){
                if(dCount >= bulletSprites.downs.length) {
                    bulletSprites.downs.push(newBulletSprite());
                }
                bulletSprites.downs[dCount].x = state.bullets_list[i].x;
                bulletSprites.downs[dCount].y = state.bullets_list[i].y;
                bulletSprites.downs[dCount].visible = true;
                dCount +=1;
            }
        }
    
        // make any unused bullet sprites in the pool invisible
        while (lCount < bulletSprites.lefts.length && bulletSprites.lefts[lCount].visible) {
            bulletSprites.lefts[lCount].visible = false;
            lCount += 1;
        }
        while (rCount < bulletSprites.rights.length && bulletSprites.rights[rCount].visible) {
            bulletSprites.rights[rCount].visible = false;
            rCount += 1;
        }
        while (uCount < bulletSprites.ups.length && bulletSprites.ups[uCount].visible) {
            bulletSprites.ups[uCount].visible = false;
            uCount += 1;
        }
        while (dCount < bulletSprites.downs.length && bulletSprites.downs[dCount].visible) {
            bulletSprites.downs[dCount].visible = false;
            dCount += 1;
        }
    }
}

/*
 * updateItemSprites: given a game state object (state), update the location of all 
 * item sprites
 */
function updateItemSprites(state) {
        // draw item sprites
        aS = 0;
        pS = 0;
        for (var i = 0; i < state.items.length; i++) {
            item = state.items[i];
            // Item is around the player
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


/* 
 * updateMazeSprites: given a game state object (state), update the location of all 
 * maze sprites
 */ 
function updateMazeSprites(state) {
    var wallCnt = 0;
    var floorCnt = 0;
    mazeBounds = getRelevantTiles(maze, state.players[myID]);
    for (var row = mazeBounds.u; row < mazeBounds.d; row++) {
        for (var col = mazeBounds.l; col < mazeBounds.r; col++) {
            if (maze[row][col] == 0) {
                wallSprites[wallCnt].x = col * WALL_WIDTH;
                wallSprites[wallCnt].y = row * WALL_WIDTH;
                wallSprites[wallCnt].visible = true;
                wallCnt += 1;
            } else {
                floorSprites[floorCnt].x = col * WALL_WIDTH;
                floorSprites[floorCnt].y = row * WALL_WIDTH;
                floorSprites[floorCnt].visible = true;
                floorCnt += 1;                
            }
        }
    }
    // make any unused wall sprites invisible
    while (wallCnt < wallSprites.length) {
        wallSprites[wallCnt].visible = false;
        wallCnt += 1;
    }
    while (floorCnt < floorSprites.length) {
        floorSprites[floorCnt].visible = false;
        floorCnt += 1;
    }
}


// CONSTRUCTING NEW SPRITES

function newWallSprite(x, y) {
    wall = PIXI.Sprite.fromImage('assets/Wall.png');
    wall.width = WALL_WIDTH;
    wall.height = WALL_WIDTH;
    wall.x = x * WALL_WIDTH;
    wall.y = y * WALL_WIDTH;
    wall.visible = false;
    mazeSpritesContainer.addChild(wall);
    return wall;
}

function newFloorSprite(x, y) {
    floor = PIXI.Sprite.fromImage('assets/Floor.png');
    floor.width = WALL_WIDTH;
    floor.height = WALL_WIDTH;
    floor.x = x * WALL_WIDTH;
    floor.y = y * WALL_WIDTH;
    floor.visible = false;
    mazeSpritesContainer.addChild(floor);
    return floor;
}

function newAmmoSprite() {
    ammo = PIXI.Sprite.fromImage('assets/Ammo.png');
    ammo.scale.x *= .1;
    ammo.scale.y *= .1;
    itemContainer.addChild(ammo);
    return ammo;
}


function newBulletSprite(dir) {
    if (dir == 'l') {
        bullet = PIXI.Sprite.fromImage('assets/BulletLeft.png');
        bullet.scale.x = .06;
        bullet.scale.y = .1;
    } else if (dir == 'r') {
        bullet = PIXI.Sprite.fromImage('assets/BulletRight.png');
        bullet.scale.x = .06;
        bullet.scale.y = .1;
    } else if (dir == 'u') {
        bullet = PIXI.Sprite.fromImage('assets/BulletUp.png');
        bullet.scale.x = .1;
        bullet.scale.y = .06;
    } else {
        bullet = PIXI.Sprite.fromImage('assets/BulletDown.png');
        bullet.scale.x = .1;
        bullet.scale.y = .06;
    }
    itemContainer.addChild(bullet);
    return bullet;
}


function newPotionSprite() {
    sprite = new PIXI.extras.AnimatedSprite(potionFrames);
    sprite.scale.x *= .2;
    sprite.scale.y *= .2;
    sprite.animationSpeed = 0.1;
    sprite.play();
    itemContainer.addChild(sprite);
    return sprite;
}

function newHPSprite(){
    spriteBkg = new PIXI.Sprite.fromImage('assets/HPBkg.png');
    spriteBkg.scale.x *= .4;
    spriteBkg.scale.y *= .7;
    spriteBkg.x = app.screen.width - 260;
    spriteBkg.y = 270;
    spriteHP = new PIXI.Sprite.fromImage('assets/HP.png');
    spriteHP.scale.x *= .4;
    spriteHP.scale.y *= .7;
    spriteHP.x = app.screen.width - 260;
    spriteHP.y = 270;
    gameUI.addChild(spriteBkg);
    gameUI.addChild(spriteHP);
    return {spriteBkg: spriteBkg, spriteHP: spriteHP};
}


/* 
 * Constructs a player sprite from the given frames and places it at the 
 * desired x and y position. Will be visible if isVisible. 
 */
function newPlayerSprite(frames, x, y, isVisible, container) {
    var sprite = new PIXI.extras.AnimatedSprite(frames);
    if (frames == p1Frames.shootDown || frames == p2Frames.shootDown ||
        frames == p1Frames.shootUp || frames == p2Frames.shootUp ||
        frames == p1Frames.shootLeft || frames == p2Frames.shootLeft ||
        frames == p1Frames.shootRight || frames == p2Frames.shootRight) {
        sprite.width = 48;
        sprite.height = 76;
        // shift it back and up since shooting sprite is taller
        sprite.x = x - 6; 
        sprite.y = y - 11;
        sprite.loop = false;
        sprite.animationSpeed = 0.2;
    } else {
        sprite.width = 42;
        sprite.height = 66;
        sprite.x = x;
        sprite.y = y;
        sprite.animationSpeed = 0.1;
        sprite.play();
    }
    sprite.anchor.set(0.5);
    container.addChild(sprite);
    sprite.visible = isVisible;
    return sprite;
}

/************** End game screen *******************/

// This only runs when the game is finished
socket.on('wonGame', function(won) {
    gameScreen.visible = false;
    endGameContainer.visible = true;
    loadGameEnd(won);
});

/*
 * loadEndgameAssets: loads general end of game screen UI elements.  
 */
function loadEndgameAssets() {
    // Add the back button to go to the main page
    backButton = PIXI.Sprite.fromImage('assets/MainPage.png');
    backButton.anchor.set(0.5);
    backButton.scale.x = 0.28;
    backButton.scale.y = 0.28;
    backButton.x = 768; //app.screen.width * 4 / 5;
    backButton.y = 292; //app.screen.height / 2;
    endGameContainer.addChild(backButton);
    backButton.interactive = true;
    backButton.buttonMode = true;

    // When click the go to home page button, 
    // link to the home page
    backButton.on('pointerdown', function() {
        //console.log('Clicked');
        startScreen.visible = true;
        endGameContainer.visible = false;
    });

    // Add sound effect to when hover the button
    backButton.on('pointerover', () => {
        PIXI.sound.Sound.from({
            url: 'assets/backToMainPage.mp3',
            autoPlay: true,
        });
        backButton.scale.x *= 1.5;
        backButton.scale.y *= 1.5; 
    }).on('pointerout', () => { 
        backButton.scale.x /= 1.5;
        backButton.scale.y /= 1.5; 
    });
}

/*
 * loadGameEnd: loads round-specific information and handles game flow logic. 
 */
function loadGameEnd(won) {
    // Switch visible screen
    gameScreen.visible = false;
    endGameContainer.visible = true;

    gameInProgress = false;

    // stop game loop functions
    app.ticker.remove(updateViewFn);
    clearInterval(physicsUpdateHandle);

    if (bkgMusic) bkgMusic.stop();
    // My team won the game
    if (won) {
        result = PIXI.Sprite.fromImage('assets/YouWin.png');
    }
    // My team lost the game
    else {
        result = PIXI.Sprite.fromImage('assets/YouLose.png');
    }

    result.anchor.set(0.5);
    result.scale.x *= 3;
    result.scale.y *= 3;
    result.x = app.screen.width * 2 / 5;
    result.y = app.screen.height / 2;
    endGameContainer.addChild(result);

    // make start screen buttons clickable again
    ready.interactive = true; 
    ready.buttonMode = true;
    team1.interactive = true;
    team1.buttonMode = true;
    team2.interactive = true;
    team2.buttonMode = true;
}
