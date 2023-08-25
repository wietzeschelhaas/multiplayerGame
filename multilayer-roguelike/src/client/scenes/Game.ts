import Phaser from 'phaser'

import { debugDraw } from '../utils/debug'
import { generateDungeon} from '../utils/dungeonCreator'
import { createCharacterAnims } from '../anims/CharacterAnims'
import { createChestAnims } from '../anims/TreasureAnims'

import NetworkedPLayer from '../characters/NetworkPlayer'
import Player from '../characters/Player';
import { ClientChannel } from '@geckos.io/client';

import {State} from '../../../../common/stateContract'
import { serverFps } from '../../../../common/consts'
import { SnapshotInterpolation, Vault} from '@geckos.io/snapshot-interpolation'

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

    SI = new SnapshotInterpolation(serverFps)
    playerVault = new Vault();


    constructor() {
        super('game')
    }

    init({ channel, posX, posY, initalState }) {
        this.channel = channel
        this.spawnPosX = parseFloat(posX) * this.tileWidth // Multiply with 16, one tile is 16x16 pixels, the server send tile pos
        this.spawnPosY = parseFloat(posY) * this.tileHeight
        this.playerSessionId = this.channel.id
        this.initState = initalState

        console.log("Spawning at")
        console.log(this.spawnPosX)
        console.log(this.spawnPosY)

    }

    preload() {
    }

    handlePlayerUpdate(snapshot) {
        this.SI.snapshot.add(snapshot)
    }
    /*handlePlayerUpdate(playerData) {
        let playerUpdate = playerData.toString().split(',');
        let networkedPlayerId = playerUpdate[0]
        let posX = parseFloat(playerUpdate[1])
        let posY = parseFloat(playerUpdate[2])
        let direction = playerUpdate[3]

        if (networkedPlayerId === this.playerSessionId) {
            //this.currentPlayer.remoteRef.x = posX
            //this.currentPlayer.remoteRef.y = posY
            this.currentPlayer.x = posX
            this.currentPlayer.y = posY

        } else if (Object.keys(this.playerEntities).includes(networkedPlayerId)) {

            // do not update player immediately, instead save the coordinates and lerp
            this.playerEntities[networkedPlayerId].serverX = posX
            this.playerEntities[networkedPlayerId].serverY = posY
            this.playerEntities[networkedPlayerId].serverDirection = direction

        } else {
            const entity = new NetworkedPLayer(this, posX, posY, 'playerAtlas', 'run-side-4.png');
            this.playerEntities[networkedPlayerId] = entity;
        }

    }*/

    async create() {
        this.scene.run('game-ui')
        createCharacterAnims(this.anims)
        createChestAnims(this.anims)

        const dungeon = generateDungeon(this,this.initState.dungeonSeed)
        
        //turn this on to draw  the client side collision rects for the walls
        //debugDraw(dungeon.wallLayer, this)

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

        //add collision for player with walls
        this.physics.add.collider(this.currentPlayer,dungeon.wallLayer)

        this.channel.on('onUpdate', snapshot => {
            this.handlePlayerUpdate(snapshot)
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

    clientSidePrediction = () => {
        this.currentPlayer.update()

        //this vault is needed for server reconciliation 
        this.playerVault.add(
            //TODO create a common class for the state below, the server also uses this.
            this.SI.snapshot.create([{ id: this.playerSessionId, x: this.currentPlayer.x, y: this.currentPlayer.y }])
        )
    }

    serverReconciliation = () =>{
        //get latest snapshot from server
        const serverSnapshot = this.SI.vault.get();
        //get player snapshot that is as cloas as possible to server snapshot time 
        let playerSnapshot = null
        if(serverSnapshot)
             playerSnapshot = this.playerVault.get(serverSnapshot.time, true)

        if(playerSnapshot && serverSnapshot){
            const {state} = serverSnapshot
            
            //let serverPos = state.filter(s => s.id === this.playerSessionId)[0]
            let serverPos
            for(let i in state){
                if(state[i].id === this.playerSessionId)
                    serverPos = state[i]
            }
            
        
            //calc offset between server and client
            const offSetX = playerSnapshot.state[0].x - serverPos.x
            const offSetY = playerSnapshot.state[0].y - serverPos.y

            const isMoving = this.currentPlayer.isMoving()
            
            const correction = isMoving ? 60: 180;

            this.currentPlayer.x -= offSetX / correction;
            this.currentPlayer.y -= offSetY / correction;
        }
    }
    update(t: number, dt: number) {
        if (this.currentPlayer) {

            //the update function here does clientside prediction
            this.clientSidePrediction()

            this.serverReconciliation()

        }
        //send player position to server
        if (this.channel && this.currentPlayer) {
            this.channel.emit('posUpdate', this.currentPlayer.getNetworkPayload(this.playerSessionId))
        }

        const snapshot = this.SI.calcInterpolation('x y')
        if(snapshot){
            const { state } = snapshot

            for(let i in state){

                const { id, x, y } = state[i]

                if(id == this.playerSessionId) {
                    this.currentPlayer.remoteRef.x = parseFloat(x.toString())
                    this.currentPlayer.remoteRef.y = parseFloat(y.toString())
                }else if (Object.keys(this.playerEntities).includes(id)) {
                    this.playerEntities[id].x = parseFloat(x.toString())
                    this.playerEntities[id].y = parseFloat(y.toString())
                }else{
                    const entity = new NetworkedPLayer(this, parseFloat(x.toString()), parseFloat(y.toString()), 'playerAtlas', 'run-side-4.png');
                    this.playerEntities[id] = entity;
                }
            }
        }
    }
}
