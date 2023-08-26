import { playerVelocity } from "../../common/consts";

export type Player = {
  posX: number;
  posY: number;
  directoin: string;
  body: any;
}

export const handlePlayerInput =  (players:{ [id: string]: Player },playerId : string,  playerMovement : string[]) => {
      if (playerMovement[1] === '1') {
        players[playerId].body.setVelocityX(playerVelocity)
        players[playerId].directoin = 'r';

      } if (playerMovement[2] === '1') {
        players[playerId].body.setVelocityX(-playerVelocity)
        players[playerId].directoin = 'l';
      }

      if (playerMovement[3] === '1') {
        players[playerId].body.setVelocityY(-playerVelocity)
        players[playerId].directoin = 'u';

      } if (playerMovement[4] === '1') {
        players[playerId].body.setVelocityY(playerVelocity)
        players[playerId].directoin = 'd';
      }
      if (!isMoving()) {
        players[playerId].body.setVelocity(0,0)
        players[playerId].directoin = 's';
      }
      function isMoving() {
        return playerMovement[1] === '1' || playerMovement[2] === '1' || playerMovement[3] === '1' || playerMovement[4] === '1'
      }

      players[playerId].posX = players[playerId].body.x;
      players[playerId].posY = players[playerId].body.y;

}