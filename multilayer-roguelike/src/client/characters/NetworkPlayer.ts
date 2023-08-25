
import Phaser from "phaser";

export default class NetworkedPLayer extends Phaser.Physics.Arcade.Sprite {
    serverX: number;
    serverY: number;

    serverDirection: string;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)
        this.serverX = x
        this.serverY = y
        scene.add.existing(this)
        //scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.anims.play('faune-idle-down')

    }

    update() {
        //this.x = Phaser.Math.Linear(this.x, this.serverX, 0.2);
        //this.y = Phaser.Math.Linear(this.y, this.serverY, 0.2);


        if (this.serverDirection === "u") {
            this.anims.play('faune-run-up', true)
        }
        else if (this.serverDirection === "d") {
            this.anims.play('faune-run-down', true)
        }
        else if (this.serverDirection === "l") {
            this.anims.play('faune-run-side', true)
            this.scaleX = -1
        }
        else if (this.serverDirection === "r") {
            this.anims.play('faune-run-side', true)
            this.scaleX = 1
        }
        else if (this.serverDirection === "s") {
            this.anims.play('faune-idle-down', true)
        }

    }
}