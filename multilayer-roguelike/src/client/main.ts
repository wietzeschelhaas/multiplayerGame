import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import game from './scenes/Game'
import GameUI from './scenes/GameUI'


export default new Phaser.Game({
	type: Phaser.AUTO,
	width: 800,
	height: 450,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true
		}
	},
	scene: [Preloader, game, GameUI],
	scale: {
		zoom: 2
	}
})
