// import other libraries as CJS
import express from 'express'
import http from 'http'
import cors from 'cors'

import {width,height } from '../../common/consts'

import state = require('../../common/dist/stateContract.js')

import {createDungeon,getRandomRoom } from '../../common/dungeonUtils'
import { ArcadePhysics } from 'arcade-physics'
import { createCollisionRects } from './physics'
import { GenerateRandomSeed } from './utils'

type Player = {
  posX: number;
  posY: number;
  directoin: string;
  body: any;
}

let randomSeed : string = GenerateRandomSeed(5)

const config = {
  sys: {
    game: {
      config: {}
    },
    settings: {
      physics: {
        debug: true,
        gravity: {
          x: 0,
          y: 0
        }
      }
    },
    scale: {
      width: width,
      height: height
    },
    queueDepthSort: () => { }
  }
}


const physics = new ArcadePhysics(config)

const dungeon = createDungeon(randomSeed)

let staticRects = createCollisionRects(physics,dungeon)

let tick = 0
const update = () => {
  physics.world.update(tick * 1000, 1000 / 60)
  tick++

}
setInterval(update,1000/60)


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
      const velocity = 200;

      if (playerMovement[1] === '1') {
        players[channel.id!].body.setVelocityX(velocity)
        players[channel.id!].directoin = 'r';

      } if (playerMovement[2] === '1') {
        //players[channel.id!].posX -= velocity;
        players[channel.id!].body.setVelocityX(-velocity)
        players[channel.id!].directoin = '1';
      }

      if (playerMovement[3] === '1') {
        //players[channel.id!].posY -= velocity;
        players[channel.id!].body.setVelocityY(-velocity)
        players[channel.id!].directoin = 'u';

      } if (playerMovement[4] === '1') {
        players[channel.id!].body.setVelocityY(velocity)
        //players[channel.id!].posY += velocity;
        players[channel.id!].directoin = 'd';
      }
      if (!isMoving()) {
        players[channel.id!].body.setVelocity(0,0)
        players[channel.id!].directoin = 's';
      }
      function isMoving() {
        return playerMovement[1] === '1' || playerMovement[2] === '1' || playerMovement[3] === '1' || playerMovement[4] === '1'
      }

      players[channel.id!].posX = players[channel.id!].body.x;
      players[channel.id!].posY = players[channel.id!].body.y;

      let playerState = prepareToSync(channel.id!)

      io.room(channel.roomId).emit('onUpdate', playerState)
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
