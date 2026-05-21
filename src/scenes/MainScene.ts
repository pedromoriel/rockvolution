import Phaser from "phaser";
import { GameEngine, GameState, createInitialGameState } from "../game/GameEngine";

export class MainScene extends Phaser.Scene {
  private readonly engine = new GameEngine();
  private state: GameState = createInitialGameState();

  private headerText!: Phaser.GameObjects.Text;
  private countersText!: Phaser.GameObjects.Text;
  private loadoutText!: Phaser.GameObjects.Text;
  private achievementsText!: Phaser.GameObjects.Text;
  private shopText!: Phaser.GameObjects.Text;
  private rock!: Phaser.GameObjects.Arc;

  constructor() {
    super("main");
  }

  create(): void {
    this.drawBackground();

    this.headerText = this.add.text(24, 20, "Rockvolution", {
      fontFamily: "Verdana",
      fontSize: "36px",
      color: "#f8fafc"
    });

    this.countersText = this.add.text(24, 72, "", {
      fontFamily: "Verdana",
      fontSize: "20px",
      color: "#e2e8f0"
    });

    this.loadoutText = this.add.text(24, 126, "", {
      fontFamily: "Verdana",
      fontSize: "16px",
      color: "#cbd5e1"
    });

    this.rock = this.add.circle(280, 320, 90, 0x6b7280);
    this.rock.setInteractive({ useHandCursor: true });
    this.rock.on("pointerdown", () => {
      this.state = this.engine.tap(this.state);
      this.tweens.add({
        targets: this.rock,
        scaleX: 1.12,
        scaleY: 1.12,
        yoyo: true,
        duration: 80
      });
      this.refreshHud();
    });

    this.add.text(244, 312, "TAP", {
      fontFamily: "Verdana",
      fontSize: "26px",
      color: "#ffffff"
    });

    this.achievementsText = this.add.text(24, 460, "", {
      fontFamily: "Verdana",
      fontSize: "15px",
      color: "#f8fafc",
      wordWrap: { width: 500 }
    });

    this.shopText = this.add.text(560, 70, "", {
      fontFamily: "Verdana",
      fontSize: "16px",
      color: "#f8fafc",
      wordWrap: { width: 360 }
    });

    this.renderShopButtons();
    this.refreshHud();
  }

  private drawBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x0f172a, 0x1e293b, 0x1e293b, 0x020617, 1);
    graphics.fillRect(0, 0, 960, 640);
  }

  private renderShopButtons(): void {
    this.add.text(560, 30, "Tienda", {
      fontFamily: "Verdana",
      fontSize: "30px",
      color: "#f8fafc"
    });

    this.engine.shopItems.forEach((item, index) => {
      const y = 110 + index * 62;
      const button = this.add.rectangle(745, y + 18, 350, 44, 0x334155, 0.85).setStrokeStyle(1, 0x94a3b8);
      button.setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => {
        this.state = this.engine.buyItem(this.state, item.id);
        this.refreshHud();
      });

      this.add.text(578, y + 4, `${item.label} (${item.costCoins})`, {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#e2e8f0"
      });
    });
  }

  private refreshHud(): void {
    const level = this.engine.levels[this.state.levelIndex];
    this.countersText.setText([
      `Nivel ${level.level}: ${level.name}`,
      `Taps: ${this.state.taps}`,
      `Monedas: ${this.state.coins}`
    ]);

    this.loadoutText.setText(
      `Skin: ${this.state.equippedSkin} | Fondo: ${this.state.equippedBackground} | Sonido: ${this.state.equippedSound}`
    );

    this.achievementsText.setText([
      "Logros ridiculos:",
      ...Array.from(this.state.achievements).slice(0, 5).map((entry) => `- ${entry}`)
    ]);

    this.shopText.setText("Haz click en un item para comprarlo.");
    this.rock.setFillStyle(this.rockColor(level.level, this.state.equippedSkin));
  }

  private rockColor(level: number, skin: string): number {
    if (skin === "Skin Meteorito") return 0x312e81;
    if (skin === "Skin Obsidiana") return 0x1f2937;

    if (level === 1) return 0x6b7280;
    if (level === 2) return 0x1f2937;
    if (level === 3) return 0x92400e;
    if (level === 4) return 0xb45309;
    if (level === 5) return 0xf59e0b;
    return 0x60a5fa;
  }
}