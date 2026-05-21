import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import "./styles.css";

const getGameSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#101828",
  ...getGameSize(),
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainScene]
};

new Phaser.Game(config);