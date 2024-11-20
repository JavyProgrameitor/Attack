import Phaser from "phaser";

import Scene_00 from "./scene_00";
import Scene_01 from "./scene_01";
import Scene_02 from "./scene_02";
import Scene_03 from "./scene_03";


const config = {
  type: Phaser.AUTO,
  parent: "app",
  width: 930,
  height: 690,
  physics:  {
    default: "arcade",
    arcade: {
      gravity: {x : 0, y: 10 },
      debug: false,

    },
  },
  // @ts-ignore
  scene: [ Scene_00, Scene_01, Scene_02, Scene_03],
};



export default new Phaser.Game(config);
  
