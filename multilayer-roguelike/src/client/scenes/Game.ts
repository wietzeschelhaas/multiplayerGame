import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { generateDungeon} from '../utils/dungeonCreator'
import { createLizardAnims } from '../anims/EnemyAnims'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'


import NetworkedPLayer from '../characters/NetworkPlayer'
import Player from '../characters/Player';
import { ClientChannel } from '@geckos.io/client';

import {State} from '../../../../common/stateContract'

export default class Game extends Phaser.Scene {
    private currentPlayer: Player

    private playerSessionId: string

    spawnPosX: number
    spawnPosY: number
    initState: State

    tileHeight: number = 16;
    tileWidth: number = 16;


    // we will assign each player visual representation here
    // by their `sessionId`
    playerEntities: { [sessionId: string]: NetworkedPLayer } = {};

    private channel: ClientChannel

    constructor() {
        super('game')
    }

    init({ channel, posX, posY, initalState }) {
        this.channel = channel
        this.spawnPosX = parseFloat(posX) * this.tileWidth // Multiply with 16, one tile is 16x16 pixels, the server send tile pos
        this.spawnPosY = parseFloat(posY) * this.tileHeight
        this.playerSessionId = this.channel.id
        this.initState = initalState

    }

    preload() {
    }

    handlePlayerUpdate(playerData) {
        let playerUpdate = playerData.toString().split(',');
        let networkedPlayerId = playerUpdate[0]
        let posX = parseFloat(playerUpdate[1])
        let posY = parseFloat(playerUpdate[2])
        let direction = playerUpdate[3]

        if (networkedPlayerId === this.playerSessionId) {
            this.currentPlayer.remoteRef.x = posX
            this.currentPlayer.remoteRef.y = posY

        } else if (Object.keys(this.playerEntities).includes(networkedPlayerId)) {

            // do not update player immediately, instead save the coordinates and lerp
            this.playerEntities[networkedPlayerId].serverX = posX
            this.playerEntities[networkedPlayerId].serverY = posY
            this.playerEntities[networkedPlayerId].serverDirection = direction

        } else {
            const entity = new NetworkedPLayer(this, posX, posY, 'playerAtlas', 'run-side-4.png');
            this.playerEntities[networkedPlayerId] = entity;
        }

    }

    async create() {
        this.scene.run('game-ui')
        createCharacterAnims(this.anims)
        createChestAnims(this.anims)

        const dungeon = generateDungeon(this,this.initState.dungeonSeed)

        // make player spawn in random room
        // const x = dungeon.wallLayer.tileToWorldX(room.centerX) + 1
        //const y = dungeon.wallLayer.tileToWorldY(room.centerY)

        debugDraw(dungeon.wallLayer, this)

        for (let i = 0; i < this.initState.playerStates.length; i++) {
            let playerUpdate = this.initState.playerStates[i].toString().split(',');
            let networkedPlayerId = playerUpdate[0]
            let posX = parseFloat(playerUpdate[1])
            let posY = parseFloat(playerUpdate[2])
            let direction = playerUpdate[3]
            const entity = new NetworkedPLayer(this, posX, posY, 'playerAtlas', 'run-side-4.png');
            this.playerEntities[networkedPlayerId] = entity;
        }

        this.currentPlayer = new Player(this, this.spawnPosX, this.spawnPosY, 'playerAtlas', 'run-side-4.png')
        this.cameras.main.startFollow(this.currentPlayer, true)

        this.channel.on('onUpdate', playerData => {
            this.handlePlayerUpdate(playerData)
        })
        this.channel.on('removePlayer', removedPlayer => {
            const entity = this.playerEntities[removedPlayer.toString()];
            if (entity) {
                // destroy entity
                entity.destroy();

                // clear local reference
                delete this.playerEntities[removedPlayer.toString()];

            }
        })

    }

    update(t: number, dt: number) {
        for (let key in this.playerEntities) {
        }
        if (this.currentPlayer) {
            this.currentPlayer.update()
        }
        if (this.channel && this.currentPlayer) {
            this.channel.emit('posUpdate', this.currentPlayer.getNetworkPayload(this.playerSessionId))
        }

        for (let sessionId in this.playerEntities) {
            // interpolate all player entities
            const entity = this.playerEntities[sessionId];
            entity.update()
        }
    }
}
