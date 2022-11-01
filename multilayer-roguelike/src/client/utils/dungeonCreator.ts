import Phaser from "phaser";
import Dungeon, { Room } from "@mikewesthad/dungeon";
import Chest from '../items/Chest'
const generateDungeon = (scene: Phaser.Scene,randomSeed:string) => {
    
    const dungeon = new Dungeon({
        width: 200,
        height: 200,
        doorPadding: 3,
        randomSeed:randomSeed,
        rooms: {
            width: { min: 30, max: 30 },
            height: { min: 30, max: 30 },
            maxRooms: 4,
        }
    });

    // Create a blank map
    const map = scene.make.tilemap({
        tileWidth: 16,
        tileHeight: 16,
        width: dungeon.width,
        height: dungeon.height
    });

    const chests = scene.physics.add.staticGroup({
        classType: Chest
    })
    const floor = 41
    const brokenFloor = 42
    const brokenFloor2 = 43
    const brokenFloor3 = 52
    const brokenFloor4 = 53

    const bottomLeftRoomCorner = 27
    const bottomRightRoomCorner = 28

    const bottomWall = 0

    const leftWall = 80
    const rightWall = 81

    const topDoor1 = leftWall
    const topDoor2 = rightWall

    const DoorWall1 = 72
    const DoorWall2 = 152

    const rightDoor1 = 85
    const rightDoor2 = 150

    const bottomDoor1 = 161
    const bottomDoor2 = 160

    const leftDoor1 = 84
    const leftDoor2 = 151

    const test = 14

    const tileset = map.addTilesetImage("dungeon", 'tilesImage')

    const groundLayer = map.createBlankLayer("Ground", tileset); // Wall & floor
    const wallLayer = map.createBlankLayer("Wall", tileset); // Wall & floor
    const stuffLayer = map.createBlankLayer("Stuff", tileset); // Chest, stairs, etc.

    //const mappedTiles = dungeon.getMappedTiles({ empty: empty, floor: floor, door: floor, wall: wall })

    //groundLayer.fill(floor)
    dungeon.rooms.forEach(room => {
        const { x, y, width, height, left, right, top, bottom } = room;

        // Fill the room (minus the walls) with mostly clean floor tiles (90% of the time), but
        groundLayer.weightedRandomize([
            { index: floor, weight: 95 },              // 9/10 times, use index 6
            { index: [brokenFloor, brokenFloor2, brokenFloor3, brokenFloor4], weight: 2 }      // 1/10 times, randomly pick 7, 8 or 26
        ], x + 2, y + 1, width - 3, height - 2);


        wallLayer.fill(bottomWall, left + 1, top + 1, width - 2, 1); // Top

        wallLayer.fill(leftWall, left + 1, top + 1, 1, height - 2); // Left
        wallLayer.fill(rightWall, right, top + 1, 1, height - 2); // Right
        wallLayer.fill(bottomWall, left + 2, bottom, width - 3, 1); // Bottom

        // Place the room corners tiles
        wallLayer.putTileAt(bottomLeftRoomCorner, left + 1, bottom);
        wallLayer.putTileAt(bottomRightRoomCorner, right, bottom);


        //Place the doors
        const doors = room.getDoorLocations(); // → Returns an array of {x, y} objects
        for (var i = 0; i < doors.length; i++) {
            if (doors[i].y === 0) {
                wallLayer.putTilesAt([topDoor1, floor, floor, topDoor2], x + doors[i].x - 1, y + doors[i].y); //door is at the top
                wallLayer.putTilesAt([floor, floor], x + doors[i].x, y + doors[i].y + 1);
                groundLayer.putTilesAt([bottomWall], x + doors[i].x - 1, y + doors[i].y - 1);
                groundLayer.putTilesAt([bottomWall], x + doors[i].x + 2, y + doors[i].y - 1);
            } else if (doors[i].y === room.height - 1) {
                wallLayer.putTilesAt([bottomDoor1, floor, floor, bottomDoor2], x + doors[i].x - 1, y + doors[i].y); // door is at the bottom
            } else if (doors[i].x === 0) {
                wallLayer.putTilesAt([[bottomWall], [floor], [floor], [leftDoor2]], x + doors[i].x + 1, y + doors[i].y - 1); // door is at the left
                wallLayer.putTilesAt([floor], x + doors[i].x, y + doors[i].y); //floor in the middle of the door
                wallLayer.putTilesAt([bottomWall], x + doors[i].x, y + doors[i].y - 1); // wall under left door
            } else if (doors[i].x === room.width - 1) {
                wallLayer.putTilesAt([[bottomWall], [floor], [floor], [rightDoor2]], x + doors[i].x, y + doors[i].y - 1); // door is at the right
                wallLayer.putTilesAt([DoorWall2], x + doors[i].x + 1, y + doors[i].y + 2);
                wallLayer.putTilesAt([floor], x + doors[i].x + 1, y + doors[i].y + 1);  //floor in the middle of the door

            }
        }


        const X = stuffLayer.tileToWorldX(room.centerX)
        const Y = stuffLayer.tileToWorldY(room.centerY)
        chests.get(X, Y, 'treasureAtlas', 'chest_empty_open_anim_f0.png')

    });

    wallLayer.setCollisionByExclusion([-1, floor]);
    return { wallLayer: wallLayer, chests: chests, dungeonRooms: dungeon.rooms }

}

export {
    generateDungeon
}