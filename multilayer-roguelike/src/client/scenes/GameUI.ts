import Phaser from "phaser";

import { sceneEvents } from "../events/EventsCenter";
import { GameEvents } from "../events/GameEvents";

export default class GameUI extends Phaser.Scene {
    private hearts!: Phaser.GameObjects.Group
    constructor() {
        super({ key: 'game-ui' })
    }

    create() {
        this.add.image(6, 26, 'treasureAtlas', 'coin_anim_f0.png')
        const coinsLabel = this.add.text(12, 20, '0', {
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
                y: 10,
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