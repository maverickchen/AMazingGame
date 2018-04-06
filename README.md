# team3
Repository for team3

Presentation for Sprint 1:
https://docs.google.com/presentation/d/1Vqu5jBVtbk-YtsDbt7JHoOfFBxnFe5BgMcRvPhLHiMA/edit?usp=sharing

MinSun Park - I broke my computer so I'm using someone else's laptop for a month.
So my id in commits shows as "SChandra96'.

pixi.js Container hierarchy

app.stage 
	— startScreen Container
		—  UI Buttons and stuff
	— game Container
 		— gameView Container
		— mazeContainer (bottom)
 			|- itemSprites Container
				— ammoSprites
				— potionSprites
			|- charSprites container
				— playerSprites
 		— Lighting layer (top)
 		— PanelContainer
 			— UI elements

	— EndGameContainer
		— You won/lost text assets