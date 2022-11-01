import Phaser from "phaser";

export default class Chest extends Phaser.Physics.Arcade.Sprite {
    private _isOpened = false

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)

        this.play('chest-closed')
    }

    open() {
        if (this._isOpened) {
            return 0
        }
        this.play('chest-open')
        this._isOpened = true

        return Phaser.Math.Between(50, 200)
    }
}