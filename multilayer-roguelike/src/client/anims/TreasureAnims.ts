import Phaser from "phaser"

const createChestAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'chest-open',
        frames: anims.generateFrameNames('treasureAtlas', { start: 0, end: 2, prefix: 'chest_empty_open_anim_f', suffix: '.png' }),
        frameRate: 5
    })

    anims.create({
        key: 'chest-closed',
        frames: [{ key: 'treasureAtlas', frame: 'chest_empty_open_anim_f0.png' }]
    })

}

export {
    createChestAnims
}