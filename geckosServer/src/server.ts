// import other libraries as CJS
import express from 'express'
import http from 'http'
import cors from 'cors'

import {width,height } from '../../common/consts'

import state = require('../../common/dist/stateContract.js')

import createDungeon = require('../../common/dungeonUtils')
import { ArcadePhysics } from 'arcade-physics'

import { tileSize,halfTileSize } from '../../common/consts'

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
const createCollisionRects =  (physics:ArcadePhysics, dungeon) => {

    const staticRects = [];

    var mappedTiles = dungeon.getMappedTiles({
        empty: 0,
        floor: 1,
        door: 2,
        wall: 3
    });

    dungeon.rooms.forEach(room => {
        const { x, y, width, height, left, right, top, bottom } = room;
    
        for (var i = left; i < left + width; i++) { //top wall
            if (mappedTiles[top][i] == 3){
                //we have a door width of 2 tiles, the underlying dungeon has not...
                if(mappedTiles[top][i+1] == 2){
                    continue
                }
                var r2 = physics.add.staticBody(((i+1)* 16) + halfTileSize , (top+1) *16 + halfTileSize, 16, 16); 

                staticRects.push(r2)
                
            }
        }
        for (var i = left; i < left + width; i++) { //bottom wall
            if (mappedTiles[bottom][i] == 3){
                //we have a door width of 2 tiles, the underlying dungeon has not...
                if(mappedTiles[bottom][i+1] == 2){
                    continue
                }
                var r2 = physics.add.staticBody(((i+1)* 16) + halfTileSize , (bottom) *16 + halfTileSize, 16, 16); 

                staticRects.push(r2)
                
            }
        }
        for (var i = top; i < top + height; i++) { //left wall
            if (mappedTiles[i][left] == 3){
                //we have a door width of 2 tiles, the underlying dungeon has not...
                if(mappedTiles[i+1][left] == 2){
                    continue
                }
                var r2 = physics.add.staticBody((left +1)*16 + halfTileSize, ((i+1)* 16) + halfTileSize, 16, 16 ); 

                staticRects.push(r2)
                
            }

        }
        for (var i = top; i < top + height; i++) { //right wall
            if (mappedTiles[i][right] == 3){
                //we have a door width of 2 tiles, the underlying dungeon has not...
                if(mappedTiles[i+1][right] == 2){
                    continue
                }
                var r2 = physics.add.staticBody(right*16 + halfTileSize, ((i+1)* 16) + halfTileSize, 16, 16); 

                staticRects.push(r2)
                
            }

        }
    
    });

    return staticRects
}


const physics = new ArcadePhysics(config)

const dungeon = createDungeon.createDungeon(randomSeed)

//let staticRects = createCollisionRects(physics,dungeon)

let tick = 0
const update = () => {
  physics.world.update(tick * 1000, 1000 / 60)
  tick++

}
setInterval(update,1000/60)


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
  body: any;
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
    
    const player = physics.add.body(randomRoom.centerX*16, randomRoom.centerY*16, 32, 32)
    
    for (let key in players) {
      physics.add.collider(player,players[key].body)
    }

    /*staticRects.forEach((rect) => {
      physics.add.collider(player,rect)
    });*/

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
