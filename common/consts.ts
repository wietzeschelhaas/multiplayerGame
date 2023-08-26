export const width = 800;
export const height = 450;

export const tileSize = 16;
export const halfTileSize = tileSize / 2;


export const serverFps = 30;

export const playerVelocity = 200;

export const config = {
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