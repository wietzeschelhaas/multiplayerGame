import Phaser from 'phaser'
import geckos from '@geckos.io/client'
import axios from 'axios'

let once = true;
export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('tilesImage', 'tiles/dungeon_tiles.png')
        this.load.tilemapTiledJSON('dungeonDataJson', 'tiles/dungeon-01.json')

        this.load.atlas('playerAtlas', 'characters/faune.png', 'characters/faune.json');
        this.load.atlas('lizardAtlas', 'characters/lizard.png', 'characters/lizard.json');
        this.load.atlas('treasureAtlas', 'items/treasure.png', 'items/treasure.json')

        this.load.image('ui-heart-empty', 'ui/ui_heart_empty.png')
        this.load.image('ui-heart-full', 'ui/ui_heart_full.png')

        this.load.image('knife', 'weapons/weapon_knife.png')


        //testimage for showing networked player
        this.load.image('ship', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png');

    }
    async create() {

        const channel = geckos({ port: 3002,url:'http://192.168.1.164'})

        //let initalState = await axios.get(`${location.protocol}//${location.hostname}:3000/getState`)
        let initalState = await axios.get(`http://192.168.1.164:3002/getState`)

        channel.onConnect(error => {
            if (error) console.error(error.message)

            channel.on('ready', playerPos => {
                // do this once per client, otherwise the ready message will be handled every time a new client connects
                // TODO make this more elegant later
                if (once) {

                    let playerPosParts = playerPos.toString().split(',');

                    this.scene.start('game', { channel: channel, posX: playerPosParts[0], posY: playerPosParts[1], initalState: initalState.data })
                    console.log(initalState.data)
                    once = false;

                }
            })
        })
    }
}