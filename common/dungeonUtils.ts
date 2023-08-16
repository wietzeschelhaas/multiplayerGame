import Dungeon from "./node_modules/@mikewesthad/dungeon/dist/dungeon";
 
export const createDungeon = (randomSeed: string) =>{
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

    return dungeon
}

export const getRandomRoom = (dungeon : Dungeon) => {
  const rooms = dungeon.rooms.slice()
  const index = Math.floor(Math.random() * rooms.length);

  var room = rooms[index]
  return room
}