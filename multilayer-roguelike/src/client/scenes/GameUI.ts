import Phaser from "phaser";

import { sceneEvents } from "../events/EventsCenter";
import { GameEvents } from "../events/GameEvents";

export default class GameUI extends Phaser.Scene {
    private hearts!: Phaser.GameObjects.Group
    private miniMap : Phaser.Cameras.Scene2D.Camera
    constructor() {
        super({ key: 'game-ui' })
    }
    init({player, mainScene}) {
        this.miniMap = mainScene.cameras.add(4, 10, 135, 110).setZoom(0.1).setName('mini');
        this.miniMap.setBackgroundColor(0x002244);

        this.miniMap.startFollow(player,true)

    }

    create() {
        this.add.image(70, 130, 'treasureAtlas', 'coin_anim_f0.png')

        //TODO find a way to not hardcode these numbers
        let miniMap = this.add.image(150/2, 125/2, 'miniMap')
        miniMap.setScale(150/miniMap.width,125 / miniMap.height)
        const coinsLabel = this.add.text(76, 125, '0', {
            fontSize: '12'
        })

        sceneEvents.on(GameEvents.PLAYER_COINS_CHANGED, (coins: number) => {
            coinsLabel.text = coins.toLocaleString()
        })

        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })

        this.hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10,
                y: 130,
                stepX: 16
            },
            quantity: 3
        })

        //sceneEvents.on(GameEvents.PLAYER_HEALTH_CHANGED, this.handlePlayerHealthChanged, this)

        // if we dont do this cleanup, every time we recreate this scene, we will register another player health changed event, and it will emit twice
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            //sceneEvents.off(GameEvents.PLAYER_HEALTH_CHANGED, this.handlePlayerHealthChanged, this)
            sceneEvents.off(GameEvents.PLAYER_COINS_CHANGED)
        })
    }

    //private handlePlayerHealthChanged(health: number) {
        //this.hearts.children.each((go, idx) => {
            //const heart = go as Phaser.GameObjects.Image
            //if (idx < health) {
                //heart.setTexture('ui-heart-full')
            //} else {
                //heart.setTexture('ui-heart-empty')
            //}
        //})
    //}
}