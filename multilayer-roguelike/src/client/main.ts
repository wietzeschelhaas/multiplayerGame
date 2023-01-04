import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import game from './scenes/Game'
import GameUI from './scenes/GameUI'

import {width,height } from '../../../common/consts'


export default new Phaser.Game({
	type: Phaser.AUTO,
	width: width,
	height: height,
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
