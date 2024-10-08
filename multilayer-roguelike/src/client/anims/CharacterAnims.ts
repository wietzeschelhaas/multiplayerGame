import Phaser from "phaser"
const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'faune-idle-down',
        frames: [{ key: 'playerAtlas', frame: 'walk-down-3.png' }]
    })

    anims.create({
        key: 'faune-idle-up',
        frames: [{ key: 'playerAtlas', frame: 'walk-up-3.png' }]
    })

    anims.create({
        key: 'faune-idle-side',
        frames: [{ key: 'playerAtlas', frame: 'walk-side-3.png' }]
    })

    anims.create({
        key: 'faune-run-down',
        frames: anims.generateFrameNames('playerAtlas', { start: 1, end: 8, prefix: 'run-down-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })

    anims.create({
        key: 'faune-run-up',
        frames: anims.generateFrameNames('playerAtlas', { start: 1, end: 8, prefix: 'run-up-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })

    anims.create({
        key: 'faune-run-side',
        frames: anims.generateFrameNames('playerAtlas', { start: 1, end: 8, prefix: 'run-side-', suffix: '.png' }),
        repeat: -1,
        frameRate: 15
    })
    anims.create({
        key: 'faune-faint',
        frames: anims.generateFrameNames('playerAtlas', { start: 1, end: 4, prefix: 'faint-', suffix: '.png' }),
        frameRate: 15
    })

}

export {
    createCharacterAnims
}