# team3
Repository for team3

Presentation for Sprint 1:
https://docs.google.com/presentation/d/1Vqu5jBVtbk-YtsDbt7JHoOfFBxnFe5BgMcRvPhLHiMA/edit?usp=sharing

MinSun Park - I broke my computer so I'm using someone else's laptop for a month.
So my id in commits shows as "SChandra96'.

Our game's PIXI.Container hierarchy

	— app.stage

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
