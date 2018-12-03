# team3
## The URL for the game is: http://34.207.53.213:8080 (AWS)
Repository for team3

## How to Run:
	cd mazeGame
	node app.js

## Our Project: 
A multiplayer online team deathmatch maze game! Pick a team and explore our randomly generated maze with a partner, but beware! Another team is also lurking somewhere nearby, and the Maze Haze(TM) will slowly drain your health over time. Pick up health and bullets to prepare for any enemies and survive the harsh maze conditions!

## Tools + Resources Used:
pixi.js

socket.io

NodeJS

piskelapp.com

soundbible.com

Clientside prediction code (found in client.js) is largely based off:

https://github.com/underscorediscovery/realtime-multiplayer-in-html5

Presentation for Sprint 1:
https://docs.google.com/presentation/d/1Vqu5jBVtbk-YtsDbt7JHoOfFBxnFe5BgMcRvPhLHiMA/edit?usp=sharing

Presentation for Sprint 2:
https://docs.google.com/presentation/d/1iCLLIOb6F7LBdgQSFq89oVJAO1P8pGEHcp8UIhZaijs/edit#slide=id.g36e5ca5457_0_0

MinSun Park - I broke my computer so I'm using someone else's laptop for a month.
So my id in commits shows as "SChandra96'.

Our game's PIXI.Container hierarchy

	— app.stage

		- gameID Container
			- Text box where player can put their choice of ID in

		— startScreen Container
			—  UI Buttons and stuff
		
		— gameScreen
 			— gameView
				— mazeContainer (bottom)
					— mazeSpriteContainer 
						— wall sprites
 					— itemContainer
						— ammoSprites
						— potionSprites
					— charContainer
						— playerSprites
 				— lighting layer
 			— gameUI
 				— UI elements

		— endGameContainer
			— You won/lost text assets

		- tutorial Container
