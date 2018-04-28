# team3
## The URL for the game is: 128.237.181.9:8080
Repository for team3

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
