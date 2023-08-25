
export default class Player extends Phaser.Physics.Arcade.Sprite {
    //rectangle to show where server sees the player
    remoteRef: Phaser.GameObjects.Rectangle;

    private keyW: Phaser.Input.Keyboard.Key;
    private keyA: Phaser.Input.Keyboard.Key;
    private keyS: Phaser.Input.Keyboard.Key;
    private keyD: Phaser.Input.Keyboard.Key;

    movementInput = {
        left: false,
        right: false,
        up: false,
        down: false,
    };
    
    isMoving(){
        return this.movementInput.left || this.movementInput.right || this.movementInput.down || this.movementInput.up
    }

    getNetworkPayload(playerId) {
        return `${playerId},${this.movementInput.right ? 1 : 0},${this.movementInput.left ? 1 : 0},${this.movementInput.up ? 1 : 0},${this.movementInput.down ? 1 : 0}`
    }

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame)

        this.keyW = scene.input.keyboard.addKey('W');
        this.keyA = scene.input.keyboard.addKey('A');
        this.keyS = scene.input.keyboard.addKey('S');
        this.keyD = scene.input.keyboard.addKey('D');

        this.remoteRef = scene.add.rectangle(0, 0, this.width, this.height);
        this.remoteRef.setStrokeStyle(1, 0xff0000);

        scene.add.existing(this)
        scene.physics.world.enableBody(this, Phaser.Physics.Arcade.DYNAMIC_BODY)
        this.setSize(10,10)
        this.anims.play('faune-idle-down')
    }
    update() {
        const leftDown = this.keyA.isDown
        const rightDown = this.keyD.isDown
        const upDown = this.keyW.isDown
        const downDown = this.keyS.isDown

        this.movementInput.left = leftDown
        this.movementInput.right = rightDown
        this.movementInput.up = upDown
        this.movementInput.down = downDown

        const isMoving = leftDown || rightDown || upDown || downDown

        const speed = 200;
         if (leftDown) {
            this.anims.play('faune-run-side', true)
            this.setVelocityX(-speed)

            this.scaleX = -1
            this.body.offset.x = 24
        }
        if (rightDown) {
            this.anims.play('faune-run-side', true)
            this.setVelocityX(speed)

            this.scaleX = 1
            this.body.offset.x = 8
        }
        if (upDown) {
            this.anims.play('faune-run-up', true)
            this.setVelocityY(-speed)
        }
        if (downDown) {
            this.anims.play('faune-run-down', true)
            this.setVelocityY(speed)
        }
        if (!isMoving) {
            const parts = this.anims.currentAnim.key.split('-')
            parts[1] = 'idle'
            this.anims.play(parts.join('-'))
            this.setVelocity(0,0)
        }
    }
}