import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import "./styles.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#101828",
  width: 960,
  height: 640,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainScene]
};

new Phaser.Game(config);