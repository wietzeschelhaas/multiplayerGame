// import other libraries as CJS
import express from 'express'
import http from 'http'
import cors from 'cors'

import {width,height } from '../../common/consts'

import state = require('../../common/dist/stateContract.js')

import createDungeon = require('../../common/dungeonUtils')
import { ArcadePhysics } from 'arcade-physics'

import { tileSize } from '../../common/consts'

function GenerateRandomSeed(length : number) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
 }
 return result;
}

let randomSeed : string = GenerateRandomSeed(5)

const config = {
  width: width,
  height: height,
  gravity: {
    y: 0
  }
}

//const physics = new ArcadePhysics(config)

const dungeon = createDungeon.createDungeon(randomSeed)


const getRandomRoom = () => {
  const rooms = dungeon.rooms.slice()
  const index = Math.floor(Math.random() * rooms.length);

  var room = rooms[index]
  return room
}

type Player = {
  posX: number;
  posY: number;
  directoin: string;
}

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

    let randomRoom = getRandomRoom()
    //send spawn point
    io.room(channel.roomId).emit('ready', `${randomRoom.centerX},${randomRoom.centerY}`)

    players[channel.id!] = { posX: randomRoom.centerX*16, posY: randomRoom.centerY*16, directoin: 's' }


    channel.onDisconnect(() => {
      console.log('Disconnect user ' + channel.id)

      delete players[channel.id!]

      channel.room.emit('removePlayer', channel.id!)
    })

    channel.on('posUpdate', data => {
      let playerMovement = data.toString().split(',');
      const velocity = 2;

      if (playerMovement[1] === '1') {
        players[channel.id!].posX += velocity;
        players[channel.id!].directoin = 'r';

      } if (playerMovement[2] === '1') {
        players[channel.id!].posX -= velocity;
        players[channel.id!].directoin = '1';
      }

      if (playerMovement[3] === '1') {
        players[channel.id!].posY -= velocity;
        players[channel.id!].directoin = 'u';

      } if (playerMovement[4] === '1') {
        players[channel.id!].posY += velocity;
        players[channel.id!].directoin = 'd';
      }
      if (!isMoving()) {
        players[channel.id!].directoin = 's';
      }
      function isMoving() {
        return playerMovement[1] === '1' || playerMovement[2] === '1' || playerMovement[3] === '1' || playerMovement[4] === '1'
      }

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
