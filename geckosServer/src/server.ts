// import other libraries as CJS
import express from 'express'
import http from 'http'
import cors from 'cors'

import {config} from '../../common/consts'

import state = require('../../common/dist/stateContract.js')

import {createDungeon,getRandomRoom } from '../../common/dungeonUtils'
import { ArcadePhysics } from 'arcade-physics'
import { createCollisionRects } from './physics'
import { GenerateRandomSeed } from './utils'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { Player, handlePlayerInput} from './playerLogic'


let randomSeed : string = GenerateRandomSeed(5)



const physics = new ArcadePhysics(config)

const dungeon = createDungeon(randomSeed)

let staticRects = createCollisionRects(physics,dungeon)

const SI = new SnapshotInterpolation()

let players: { [id: string]: Player } = {};

function prepareToSync(playerId: string) {
  return `${playerId},${players[playerId].posX},${players[playerId].posY},${players[playerId].directoin},`
}

const app = express()
const server = http.createServer(app)

app.use(cors())
const port = 3000

const main = async () => {
  // import geckos as ESM

  const { geckos } = await import('@geckos.io/server')
  const io = geckos()

  io.addServer(server)
  let tick = 0

  // server loop
  const update = () => {
    physics.world.update(tick * 1000, 1000 / 60)
    tick++

    let worldState = []

    //send state with 30 fps
    if(tick % 2 == 0){

      for (let key in players) {
        worldState.push({id: key, x: players[key].posX, y: players[key].posY })
        //io.emit('onUpdate',playerStatesToSend[key])
      }
      const snapshot = SI.snapshot.create(worldState)
      SI.vault.add(snapshot);
      io.emit('onUpdate',snapshot)

    }
  }
setInterval(update,1000/60)

  io.onConnection(channel => {
    console.log('player connected with id : ' + channel.id)

    let randomRoom = getRandomRoom(dungeon)
    //send spawn point
    io.room(channel.roomId).emit('ready', `${randomRoom.centerX},${randomRoom.centerY}`)
    
    const player = physics.add.body(randomRoom.centerX*16, randomRoom.centerY*16, 32, 32)
    player.setSize(10,10)
    
    for (let key in players) {
      physics.add.collider(player,players[key].body)
    }

    staticRects.forEach((rect) => {
      physics.add.collider(player,rect)
    });

    players[channel.id!] = { posX: randomRoom.centerX*16, posY: randomRoom.centerY*16, directoin: 's',body: player }


    channel.onDisconnect(() => {
      console.log('Disconnect user ' + channel.id)

      delete players[channel.id!]

      channel.room.emit('removePlayer', channel.id!)
    })

    channel.on('posUpdate', data => {
      let playerMovement = data.toString().split(',');
      handlePlayerInput(players,channel.id!,playerMovement);

      //let playerState = prepareToSync(channel.id!)

      //io.emit('onUpdate', playerState)
    })
  })

  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

app.get('/getState', (req, res) => {
  let playerStates = []

  for (let key in players) {
    playerStates.push(prepareToSync(key))
  }

  let states: state.State = {
    playerStates: playerStates,
    dungeonSeed : randomSeed,
  }

  return res.json(states)
})


main()
