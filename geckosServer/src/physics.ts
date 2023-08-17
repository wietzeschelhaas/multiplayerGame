
import { ArcadePhysics } from 'arcade-physics'

import { tileSize,halfTileSize } from '../../common/consts'

export const createCollisionRects =  (physics:ArcadePhysics, dungeon) => {

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