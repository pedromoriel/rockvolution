import Phaser from "phaser";
import { GameEngine, GameState, InventoryType, PurchaseResult, ShopItem, TapFeedback, createInitialGameState } from "../game/GameEngine";

type ModalType = "shop" | "inventory" | "achievements";

export class MainScene extends Phaser.Scene {
  private readonly engine = new GameEngine();
  private state: GameState = createInitialGameState();

  private background!: Phaser.GameObjects.Graphics;
  private backgroundImage?: Phaser.GameObjects.Image;
  private hamburgerIcon!: Phaser.GameObjects.Graphics;

  private topBar!: Phaser.GameObjects.Rectangle;
  private statusBar!: Phaser.GameObjects.Rectangle;
  private bottomBar!: Phaser.GameObjects.Rectangle;
  private hamburgerButton!: Phaser.GameObjects.Rectangle;
  private menuPanel!: Phaser.GameObjects.Rectangle;
  private bottomDivider!: Phaser.GameObjects.Rectangle;
  private shopButton!: Phaser.GameObjects.Rectangle;
  private inventoryButton!: Phaser.GameObjects.Rectangle;

  private modalOverlay!: Phaser.GameObjects.Rectangle;
  private modalPanel!: Phaser.GameObjects.Rectangle;
  private modalTitle!: Phaser.GameObjects.Text;
  private modalCloseText!: Phaser.GameObjects.Text;
  private modalContentContainer!: Phaser.GameObjects.Container;
  private modalMaskGraphics!: Phaser.GameObjects.Graphics;

  private coinsText!: Phaser.GameObjects.Text;
  private coinsIcon?: Phaser.GameObjects.Image;
  private tapsLabel!: Phaser.GameObjects.Text;
  private tapsValue!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;
  private levelValue!: Phaser.GameObjects.Text;
  private boosterStatusText!: Phaser.GameObjects.Text;
  private boosterStatusIcon?: Phaser.GameObjects.Image;
  private settingsText!: Phaser.GameObjects.Text;
  private achievementsMenuText!: Phaser.GameObjects.Text;
  private logoutText!: Phaser.GameObjects.Text;
  private shopButtonText!: Phaser.GameObjects.Text;
  private inventoryButtonText!: Phaser.GameObjects.Text;
  private rock!: Phaser.GameObjects.Image;
  private tapText!: Phaser.GameObjects.Text;
  private rockDiameter = 160;
  private rockBaseScaleX = 1;
  private rockBaseScaleY = 1;

  private menuVisible = false;
  private activeModal: ModalType | null = null;
  private rockTapTween?: Phaser.Tweens.Tween;
  private activeTapFeedback = 0;
  private readonly maxActiveTapFeedback = 28;
  private readonly rectBaseSize = 100;

  private modalScrollOffset = 0;
  private modalScrollMin = 0;
  private modalScrollMax = 0;
  private readonly modalClipRect = new Phaser.Geom.Rectangle(0, 0, 0, 0);

  private toastBg!: Phaser.GameObjects.Rectangle;
  private toastText!: Phaser.GameObjects.Text;
  private toastTween?: Phaser.Tweens.Tween;

  private levelUpOverlay!: Phaser.GameObjects.Rectangle;
  private levelUpPanel!: Phaser.GameObjects.Rectangle;
  private levelUpTitle!: Phaser.GameObjects.Text;
  private levelUpBody!: Phaser.GameObjects.Text;
  private levelUpCloseText!: Phaser.GameObjects.Text;
  private levelUpTween?: Phaser.Tweens.Tween;

  private loadingBackgroundImage?: Phaser.GameObjects.Image;
  private loadingOverlay?: Phaser.GameObjects.Rectangle;
  private loadingBarTrack!: Phaser.GameObjects.Rectangle;
  private loadingBarFill!: Phaser.GameObjects.Rectangle;
  private loadingText!: Phaser.GameObjects.Text;
  private loadingActive = false;
  private loadingBarWidth = 280;

  constructor() {
    super("main");
  }

  preload(): void {
    const skinAssets = import.meta.glob("../assets/skins/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
    const backgroundAssets = import.meta.glob("../assets/backgrounds/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
    const iconAssets = import.meta.glob("../assets/icons/*.{png,jpg,jpeg,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

    const loadAssetMap = (assets: Record<string, string>): void => {
      Object.entries(assets).forEach(([assetPath, assetUrl]) => {
        const fileName = assetPath.split("/").pop();
        if (!fileName) {
          return;
        }
        const key = fileName.replace(/\.[^.]+$/, "");
        this.load.image(key, assetUrl);
      });
    };

    loadAssetMap(skinAssets);
    loadAssetMap(backgroundAssets);
    loadAssetMap(iconAssets);

    if (skinAssets["../assets/skins/rock_gurona_buchona.png"]) {
      this.load.image("rock_guerona_buchona", skinAssets["../assets/skins/rock_gurona_buchona.png"]);
    }
  }

  create(): void {
    this.background = this.add.graphics();
    this.backgroundImage = this.add.image(0, 0, "rock_1").setVisible(false).setDepth(1);
    this.hamburgerIcon = this.add.graphics();

    this.topBar = this.createPanel(0x0f172a, 0.96, 10);
    this.statusBar = this.createPanel(0x172033, 0.92, 10);
    this.bottomBar = this.createPanel(0x0f172a, 0.96, 10);
    this.hamburgerButton = this.createPanel(0x1e293b, 1, 12);
    this.menuPanel = this.createPanel(0x0f172a, 0.98, 18);
    this.bottomDivider = this.createPanel(0x334155, 1, 11);
    this.shopButton = this.createPanel(0x1d4ed8, 0.96, 11);
    this.inventoryButton = this.createPanel(0x0f766e, 0.96, 11);

    this.modalOverlay = this.createPanel(0x020617, 0.76, 40);
    this.modalPanel = this.createPanel(0x0f172a, 0.98, 41);
    this.modalTitle = this.add.text(0, 0, "", { fontFamily: "Verdana", color: "#f8fafc", fontStyle: "bold" }).setDepth(42);
    this.modalCloseText = this.add.text(0, 0, "Cerrar", { fontFamily: "Verdana", color: "#fca5a5", fontStyle: "bold" }).setDepth(42);
    this.modalContentContainer = this.add.container(0, 0).setDepth(43);
    this.modalMaskGraphics = this.add.graphics().setDepth(42);
    this.modalContentContainer.setMask(this.modalMaskGraphics.createGeometryMask());

    this.toastBg = this.createPanel(0x16a34a, 0.96, 80);
    this.toastText = this.add.text(0, 0, "", {
      fontFamily: "Verdana",
      fontStyle: "bold",
      color: "#f8fafc",
      align: "center"
    }).setDepth(81);
    this.toastBg.setVisible(false);
    this.toastText.setVisible(false);

    this.levelUpOverlay = this.createPanel(0x020617, 0.66, 90).setVisible(false);
    this.levelUpPanel = this.createPanel(0x1f2937, 0.98, 91).setVisible(false);
    this.levelUpTitle = this.add.text(0, 0, "", {
      fontFamily: "Verdana",
      color: "#fde047",
      fontStyle: "bold",
      align: "center"
    }).setDepth(92).setVisible(false);
    this.levelUpBody = this.add.text(0, 0, "", {
      fontFamily: "Verdana",
      color: "#e2e8f0",
      align: "center",
      wordWrap: { width: 520 }
    }).setDepth(92).setVisible(false);
    this.levelUpCloseText = this.add.text(0, 0, "X", {
      fontFamily: "Verdana",
      color: "#fca5a5",
      fontStyle: "bold"
    }).setDepth(93).setVisible(false).setInteractive({ useHandCursor: true });
    this.levelUpCloseText.on("pointerdown", () => {
      this.closeLevelUpCelebration();
    });

    this.loadingOverlay = this.createPanel(0x020617, 0.34, 120).setVisible(false);
    this.loadingBarTrack = this.createPanel(0x0f172a, 0.95, 121).setVisible(false);
    this.loadingBarFill = this.createPanel(0x16a34a, 0.98, 122).setVisible(false).setOrigin(0, 0.5);
    this.loadingText = this.add.text(0, 0, "Cargando", {
      fontFamily: "Verdana",
      color: "#f8fafc",
      fontStyle: "bold"
    }).setDepth(123).setVisible(false);
    if (this.textures.exists("loading_bg_vertical")) {
      this.loadingBackgroundImage = this.add.image(0, 0, "loading_bg_vertical").setDepth(119).setVisible(false);
    }

    this.coinsText = this.add.text(0, 0, "", {
      fontFamily: "Verdana",
      color: "#f8fafc"
    }).setDepth(12);
    const initialCoinsIconKey = this.getCoinsThumbnailKey();
    if (initialCoinsIconKey && this.textures.exists(initialCoinsIconKey)) {
      this.coinsIcon = this.add.image(0, 0, initialCoinsIconKey).setDepth(12);
    }

    this.tapsLabel = this.add.text(0, 0, "Taps", {
      fontFamily: "Verdana",
      color: "#93c5fd"
    }).setDepth(12);
    this.tapsValue = this.add.text(0, 0, "0", {
      fontFamily: "Verdana",
      color: "#f8fafc",
      fontStyle: "bold"
    }).setDepth(12);
    this.levelLabel = this.add.text(0, 0, "Nivel", {
      fontFamily: "Verdana",
      color: "#99f6e4"
    }).setDepth(12);
    this.levelValue = this.add.text(0, 0, "1", {
      fontFamily: "Verdana",
      color: "#f8fafc",
      fontStyle: "bold"
    }).setDepth(12);
    this.boosterStatusText = this.add.text(0, 0, "Sin booster", {
      fontFamily: "Verdana",
      color: "#fde047",
      fontStyle: "bold"
    }).setDepth(12);
    this.boosterStatusIcon = this.add.image(0, 0, "rock_1").setDepth(12).setVisible(false);

    this.settingsText = this.add.text(0, 0, "Configuracion", {
      fontFamily: "Verdana",
      color: "#f8fafc"
    }).setDepth(19);
    this.achievementsMenuText = this.add.text(0, 0, "Logros", {
      fontFamily: "Verdana",
      color: "#f8fafc"
    }).setDepth(19);
    this.logoutText = this.add.text(0, 0, "Cerrar Sesion", {
      fontFamily: "Verdana",
      color: "#f8fafc"
    }).setDepth(19);

    this.shopButtonText = this.add.text(0, 0, "Tienda", {
      fontFamily: "Verdana",
      color: "#eff6ff",
      fontStyle: "bold"
    }).setDepth(12);
    this.inventoryButtonText = this.add.text(0, 0, "Inventario", {
      fontFamily: "Verdana",
      color: "#ecfeff",
      fontStyle: "bold"
    }).setDepth(12);

    this.rock = this.add.image(0, 0, "rock_1").setDepth(8);
    this.rock.setInteractive({ useHandCursor: true });
    this.rock.on("pointerdown", () => {
      const previousState = this.state;
      const tapResult = this.engine.tapWithResult(this.state);
      this.state = tapResult.state;
      this.playRockTapAnimation();
      this.spawnTapFeedback(tapResult.feedback);

      if (this.state.levelIndex > previousState.levelIndex) {
        this.showLevelUpCelebration(previousState.levelIndex, this.state.levelIndex);
      }

      if (previousState.selectedBoosterId && !this.state.selectedBoosterId) {
        const usedDefinition = this.engine.getBoosterDefinition(previousState.selectedBoosterId);
        if (usedDefinition) {
          this.showToast(`Usaste ${usedDefinition.label}`, "info");
        }
      }

      this.refreshHud();
    });

    this.tapText = this.add.text(0, 0, "TAP", {
      fontFamily: "Verdana",
      color: "#ffffff",
      fontStyle: "bold"
    }).setDepth(9);

    this.hamburgerButton.setInteractive({ useHandCursor: true });
    this.hamburgerButton.on("pointerdown", () => {
      this.menuVisible = !this.menuVisible;
      this.updateMenuVisibility();
    });

    this.modalOverlay.setInteractive({ useHandCursor: true });
    this.modalOverlay.on("pointerdown", () => this.closeModal());
    this.modalCloseText.setInteractive({ useHandCursor: true });
    this.modalCloseText.on("pointerdown", () => this.closeModal());

    [this.settingsText, this.achievementsMenuText, this.logoutText].forEach((target) => {
      target.setInteractive({ useHandCursor: true });
    });
    [this.shopButton, this.inventoryButton].forEach((target) => target.setInteractive({ useHandCursor: true }));

    this.settingsText.on("pointerdown", () => {
      this.menuVisible = false;
      this.updateMenuVisibility();
    });
    this.logoutText.on("pointerdown", () => {
      this.menuVisible = false;
      this.updateMenuVisibility();
    });
    this.achievementsMenuText.on("pointerdown", () => this.openModal("achievements"));
    this.shopButton.on("pointerdown", () => this.openModal("shop"));
    this.inventoryButton.on("pointerdown", () => this.openModal("inventory"));

    this.input.on("wheel", (_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.activeModal) {
        return;
      }
      this.setModalScroll(this.modalScrollOffset - dy * 0.8);
    });

    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.layout());
    this.layout();
    this.closeModal();
    this.updateMenuVisibility();
    this.refreshHud();
    this.startLoadingScreen();
  }

  private createPanel(fillColor: number, alpha: number, depth: number): Phaser.GameObjects.Rectangle {
    return this.add.rectangle(0, 0, this.rectBaseSize, this.rectBaseSize, fillColor, alpha).setStrokeStyle(1, 0x334155).setDepth(depth);
  }

  private sizeRect(rect: Phaser.GameObjects.Rectangle, width: number, height: number): void {
    rect.setScale(width / this.rectBaseSize, height / this.rectBaseSize);
  }

  private drawBackground(width: number, height: number): void {
    const equippedBackgroundKey = this.getBackgroundTextureKey(this.state.equippedBackground);
    const hasBackgroundTexture = Boolean(equippedBackgroundKey && this.textures.exists(equippedBackgroundKey));

    if (this.backgroundImage) {
      if (hasBackgroundTexture && equippedBackgroundKey) {
        this.backgroundImage.setTexture(equippedBackgroundKey);
        this.backgroundImage.setDisplaySize(width, height);
        this.backgroundImage.setPosition(width / 2, height / 2);
        this.backgroundImage.setVisible(true);
      } else {
        this.backgroundImage.setVisible(false);
      }
    }

    const accent = this.engine.getBackgroundPreviewColor(this.state.equippedBackground);
    const topRight = Phaser.Display.Color.IntegerToColor(accent).darken(15).color;
    const bottomLeft = Phaser.Display.Color.IntegerToColor(accent).lighten(10).color;
    this.background.clear();
    this.background.fillGradientStyle(0x020617, topRight, bottomLeft, 0x020617, hasBackgroundTexture ? 0.34 : 1);
    this.background.fillRect(0, 0, width, height);
  }

  private drawHamburger(centerX: number, centerY: number, size: number): void {
    const barWidth = size * 0.44;
    const barHeight = Math.max(3, size * 0.07);
    const gap = size * 0.14;
    const startX = centerX - barWidth / 2;
    const startY = centerY - gap;

    this.hamburgerIcon.clear();
    this.hamburgerIcon.fillStyle(0xf8fafc, 1);
    this.hamburgerIcon.fillRoundedRect(startX, startY, barWidth, barHeight, barHeight / 2);
    this.hamburgerIcon.fillRoundedRect(startX, centerY - barHeight / 2, barWidth, barHeight, barHeight / 2);
    this.hamburgerIcon.fillRoundedRect(startX, centerY + gap - barHeight, barWidth, barHeight, barHeight / 2);
    this.hamburgerIcon.setDepth(13);
  }

  private layout(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

    const topBarHeight = clamp(height * 0.09, 56, 74);
    const statusBarHeight = clamp(height * 0.12, 68, 96);
    const bottomBarHeight = clamp(height * 0.11, 70, 90);
    const sidePadding = clamp(width * 0.04, 14, 28);
    const topFont = clamp(width * 0.042, 18, 28);
    const labelFont = clamp(width * 0.028, 13, 18);
    const valueFont = clamp(width * 0.044, 18, 30);
    const bottomFont = clamp(width * 0.038, 16, 24);

    this.drawBackground(width, height);

    this.topBar.setPosition(width / 2, topBarHeight / 2);
    this.sizeRect(this.topBar, width, topBarHeight);

    this.statusBar.setPosition(width / 2, topBarHeight + statusBarHeight / 2);
    this.sizeRect(this.statusBar, width, statusBarHeight);

    this.bottomBar.setPosition(width / 2, height - bottomBarHeight / 2);
    this.sizeRect(this.bottomBar, width, bottomBarHeight);

    const hamburgerSize = clamp(topBarHeight * 0.68, 38, 50);
    this.hamburgerButton.setPosition(width - sidePadding - hamburgerSize / 2, topBarHeight / 2);
    this.sizeRect(this.hamburgerButton, hamburgerSize, hamburgerSize);
    this.drawHamburger(this.hamburgerButton.x, this.hamburgerButton.y, hamburgerSize);

    this.coinsText.setStyle({ fontSize: `${topFont}px`, fontStyle: "bold" });
    if (this.coinsIcon) {
      const coinIconSize = clamp(topBarHeight * 0.46, 18, 30);
      this.coinsIcon.setDisplaySize(coinIconSize, coinIconSize);
      this.coinsIcon.setPosition(sidePadding + coinIconSize / 2, topBarHeight / 2);
      this.coinsText.setPosition(this.coinsIcon.x + coinIconSize / 2 + 8, topBarHeight / 2 - this.coinsText.height / 2);
    } else {
      this.coinsText.setPosition(sidePadding, topBarHeight / 2 - this.coinsText.height / 2);
    }

    const hubHalfWidth = width / 2;
    this.tapsLabel.setStyle({ fontSize: `${labelFont}px`, fontStyle: "bold" });
    this.tapsValue.setStyle({ fontSize: `${valueFont}px` });
    this.levelLabel.setStyle({ fontSize: `${labelFont}px`, fontStyle: "bold" });
    this.levelValue.setStyle({ fontSize: `${valueFont}px` });
    this.boosterStatusText.setStyle({ fontSize: `${clamp(width * 0.022, 12, 16)}px` });

    this.tapsLabel.setPosition(hubHalfWidth * 0.5 - this.tapsLabel.width / 2, topBarHeight + 8);
    this.tapsValue.setPosition(hubHalfWidth * 0.5 - this.tapsValue.width / 2, this.tapsLabel.y + this.tapsLabel.height + 2);

    this.levelLabel.setPosition(hubHalfWidth + hubHalfWidth * 0.5 - this.levelLabel.width / 2, topBarHeight + 8);
    this.levelValue.setPosition(hubHalfWidth + hubHalfWidth * 0.5 - this.levelValue.width / 2, this.levelLabel.y + this.levelLabel.height + 2);
    this.boosterStatusText.setPosition(width / 2 - this.boosterStatusText.width / 2, this.levelValue.y + this.levelValue.height + 3);

    const playAreaTop = topBarHeight + statusBarHeight;
    const playAreaHeight = height - playAreaTop - bottomBarHeight;
    const rockRadius = clamp(Math.min(width * 0.18, playAreaHeight * 0.26) * 1.2, 76, 134);
    this.rockDiameter = rockRadius * 2;

    this.rock.setPosition(width / 2, playAreaTop + playAreaHeight / 2);
    this.applyRockDisplaySize();

    const tapFont = clamp(rockRadius * 0.38, 18, 32);
    this.tapText.setStyle({ fontSize: `${tapFont}px` });
    this.tapText.setPosition(this.rock.x - this.tapText.width / 2, this.rock.y - this.tapText.height / 2);

    const menuWidth = clamp(width * 0.48, 200, 280);
    const menuHeight = clamp(height * 0.24, 138, 180);
    this.menuPanel.setPosition(width - sidePadding - menuWidth / 2, topBarHeight + menuHeight / 2 + 8);
    this.sizeRect(this.menuPanel, menuWidth, menuHeight);

    const menuLeft = this.menuPanel.x - menuWidth / 2 + 18;
    const menuTop = this.menuPanel.y - menuHeight / 2 + 16;
    const menuFont = clamp(width * 0.032, 14, 18);
    this.settingsText.setStyle({ fontSize: `${menuFont}px` });
    this.achievementsMenuText.setStyle({ fontSize: `${menuFont}px` });
    this.logoutText.setStyle({ fontSize: `${menuFont}px` });
    this.settingsText.setPosition(menuLeft, menuTop);
    this.achievementsMenuText.setPosition(menuLeft, menuTop + this.settingsText.height + 14);
    this.logoutText.setPosition(menuLeft, this.achievementsMenuText.y + this.achievementsMenuText.height + 14);

    this.bottomDivider.setPosition(width / 2, height - bottomBarHeight / 2);
    this.sizeRect(this.bottomDivider, 2, bottomBarHeight * 0.62);

    const bottomButtonWidth = width / 2;
    this.shopButton.setPosition(width * 0.25, height - bottomBarHeight / 2);
    this.inventoryButton.setPosition(width * 0.75, height - bottomBarHeight / 2);
    this.sizeRect(this.shopButton, bottomButtonWidth, bottomBarHeight);
    this.sizeRect(this.inventoryButton, bottomButtonWidth, bottomBarHeight);

    this.shopButtonText.setStyle({ fontSize: `${bottomFont}px` });
    this.inventoryButtonText.setStyle({ fontSize: `${bottomFont}px` });
    this.shopButtonText.setPosition(this.shopButton.x - this.shopButtonText.width / 2, this.shopButton.y - this.shopButtonText.height / 2);
    this.inventoryButtonText.setPosition(this.inventoryButton.x - this.inventoryButtonText.width / 2, this.inventoryButton.y - this.inventoryButtonText.height / 2);

    const toastWidth = clamp(width * 0.74, 240, 560);
    const toastHeight = clamp(height * 0.075, 44, 64);
    this.toastBg.setPosition(width / 2, height / 2);
    this.sizeRect(this.toastBg, toastWidth, toastHeight);
    this.toastText.setStyle({ fontSize: `${clamp(width * 0.024, 12, 20)}px` });
    this.toastText.setPosition(this.toastBg.x - this.toastText.width / 2, this.toastBg.y - this.toastText.height / 2);

    const levelPanelWidth = clamp(width * 0.78, 280, 680);
    const levelPanelHeight = clamp(height * 0.34, 210, 330);
    this.levelUpOverlay.setPosition(width / 2, height / 2);
    this.sizeRect(this.levelUpOverlay, width, height);
    this.levelUpPanel.setPosition(width / 2, height / 2);
    this.sizeRect(this.levelUpPanel, levelPanelWidth, levelPanelHeight);
    this.levelUpTitle.setStyle({ fontSize: `${clamp(width * 0.04, 20, 34)}px` });
    this.levelUpBody.setStyle({ fontSize: `${clamp(width * 0.024, 13, 20)}px`, wordWrap: { width: levelPanelWidth - 42 } });
    this.levelUpCloseText.setStyle({ fontSize: `${clamp(width * 0.032, 16, 24)}px` });
    this.levelUpTitle.setPosition(width / 2 - this.levelUpTitle.width / 2, height / 2 - levelPanelHeight / 2 + 24);
    this.levelUpBody.setPosition(width / 2 - this.levelUpBody.width / 2, this.levelUpTitle.y + this.levelUpTitle.height + 18);
    this.levelUpCloseText.setPosition(width / 2 + levelPanelWidth / 2 - this.levelUpCloseText.width - 18, height / 2 - levelPanelHeight / 2 + 12);

    this.layoutLoadingScreen();

    this.layoutModal();
    this.updateMenuVisibility();
  }

  private layoutModal(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

    const modalWidth = clamp(width * 0.9, 290, 760);
    const modalHeight = clamp(height * 0.8, 340, 640);
    this.modalOverlay.setPosition(width / 2, height / 2);
    this.sizeRect(this.modalOverlay, width, height);
    this.modalPanel.setPosition(width / 2, height / 2);
    this.sizeRect(this.modalPanel, modalWidth, modalHeight);

    const titleFont = clamp(width * 0.042, 20, 30);
    const closeFont = clamp(width * 0.026, 14, 18);
    this.modalTitle.setStyle({ fontSize: `${titleFont}px` });
    this.modalCloseText.setStyle({ fontSize: `${closeFont}px` });
    this.modalTitle.setPosition(width / 2 - modalWidth / 2 + 22, height / 2 - modalHeight / 2 + 18);
    this.modalCloseText.setPosition(width / 2 + modalWidth / 2 - this.modalCloseText.width - 22, height / 2 - modalHeight / 2 + 24);

    this.modalClipRect.setTo(width / 2 - modalWidth / 2 + 16, height / 2 - modalHeight / 2 + 62, modalWidth - 32, modalHeight - 82);
    this.modalMaskGraphics.clear();
    this.modalMaskGraphics.fillStyle(0xffffff, 1);
    this.modalMaskGraphics.fillRect(this.modalClipRect.x, this.modalClipRect.y, this.modalClipRect.width, this.modalClipRect.height);

    if (this.activeModal) {
      this.renderActiveModal(true);
    }
  }

  private updateMenuVisibility(): void {
    [this.menuPanel, this.settingsText, this.achievementsMenuText, this.logoutText].forEach((item) => item.setVisible(this.menuVisible));
  }

  private openModal(modal: ModalType): void {
    this.activeModal = modal;
    this.menuVisible = false;
    this.updateMenuVisibility();
    this.renderActiveModal(false);
  }

  private closeModal(): void {
    this.activeModal = null;
    this.modalContentContainer.removeAll(true);
    [this.modalOverlay, this.modalPanel, this.modalTitle, this.modalCloseText, this.modalContentContainer, this.modalMaskGraphics].forEach((item) => item.setVisible(false));
  }

  private renderActiveModal(preserveScroll: boolean = false): void {
    if (!this.activeModal) {
      return;
    }

    const previousScrollOffset = this.modalScrollOffset;
    this.modalContentContainer.removeAll(true);
    this.modalScrollOffset = preserveScroll ? previousScrollOffset : 0;
    [this.modalOverlay, this.modalPanel, this.modalTitle, this.modalCloseText, this.modalContentContainer, this.modalMaskGraphics].forEach((item) => item.setVisible(true));

    if (this.activeModal === "shop") {
      this.modalTitle.setText("Tienda");
      this.renderShopModal();
    } else if (this.activeModal === "inventory") {
      this.modalTitle.setText("Inventario");
      this.renderInventoryModal();
    } else {
      this.modalTitle.setText("Logros");
      this.renderAchievementsModal();
    }
  }

  private finalizeModalScroll(contentBottomY: number): void {
    const contentHeight = Math.max(0, contentBottomY - this.modalClipRect.y);
    const visibleHeight = this.modalClipRect.height;
    this.modalScrollMax = 0;
    this.modalScrollMin = Math.min(0, visibleHeight - contentHeight - 8);
    this.setModalScroll(this.modalScrollOffset);
  }

  private setModalScroll(value: number): void {
    const clamped = Phaser.Math.Clamp(value, this.modalScrollMin, this.modalScrollMax);
    this.modalScrollOffset = clamped;
    this.modalContentContainer.y = clamped;
  }

  private renderShopModal(): void {
    const width = this.scale.width;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
    const modalWidth = this.modalClipRect.width + 32;
    const left = this.modalClipRect.x + 6;
    let cursorY = this.modalClipRect.y + 8;
    const rowHeight = clamp(this.scale.height * 0.11, 78, 98);
    const rowGap = 10;
    const sectionGap = 14;
    const rowWidth = modalWidth - 36;
    const textWidth = rowWidth - 208;

    const resourceItems = [
      {
        id: "resource_coin_pack",
        label: "Paquete de Monedas x10,000",
        description: "Recarga premium de monedas para compras rapidas.",
        costLabel: "Disponible pronto"
      },
      {
        id: "resource_gem_pack",
        label: "Paquete de Gemas x100",
        description: "Gemas para items especiales de temporada.",
        costLabel: "Disponible pronto"
      }
    ];

    const renderSectionHeading = (title: string): void => {
      const sectionHeight = clamp(this.scale.height * 0.048, 26, 36);
      const sectionBg = this.add.rectangle(width / 2, cursorY + sectionHeight / 2, rowWidth, sectionHeight, 0x111827, 0.96).setStrokeStyle(1, 0x334155);
      const heading = this.add.text(left + 8, cursorY + 5, title, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.022, 13, 17)}px`,
        color: "#e2e8f0",
        fontStyle: "bold"
      });
      this.modalContentContainer.add([sectionBg, heading]);
      cursorY += sectionHeight + 8;
    };

    const renderShopItemRow = (item: ShopItem): void => {
      const owned = this.isOwned(item);
      const canBuy = this.state.coins >= item.costCoins;
      const fill = owned ? 0x1f2937 : canBuy ? 0x1d4ed8 : 0x374151;

      const rowCard = this.add.rectangle(width / 2, cursorY + rowHeight / 2, rowWidth, rowHeight, fill, 0.94).setStrokeStyle(1, 0x475569);
      const thumbTextureKey = this.getShopItemThumbnailKey(item);
      const thumbSize = Math.min(rowHeight - 8, (rowHeight - 24) * 1.3);
      const thumbX = left + 12 + thumbSize / 2;
      const thumbY = cursorY + rowHeight / 2;
      let textLeft = left + 12;
      const additions: Phaser.GameObjects.GameObject[] = [rowCard];

      if (thumbTextureKey && this.textures.exists(thumbTextureKey)) {
        const thumbnail = this.add.image(thumbX, thumbY, thumbTextureKey).setDisplaySize(thumbSize, thumbSize);
        additions.push(thumbnail);
        textLeft += thumbSize + 10;
      }

      const label = this.add.text(textLeft, cursorY + 6, item.label, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.022, 12, 18)}px`,
        color: "#f8fafc",
        fontStyle: "bold",
        wordWrap: { width: textWidth }
      });
      const description = this.add.text(textLeft, cursorY + 29, item.description, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 10, 14)}px`,
        color: "#cbd5e1",
        wordWrap: { width: textWidth }
      });

      const statusText = owned ? "Comprado" : `${item.costCoins} monedas`;
      const statusColor = owned ? "#cbd5e1" : canBuy ? "#22c55e" : "#ef4444";

      const status = this.add.text(textLeft, cursorY + rowHeight - 22, statusText, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 11, 15)}px`,
        color: statusColor
      });

      const coinThumbnailKey = this.getCoinsThumbnailKey();
      if (coinThumbnailKey && this.textures.exists(coinThumbnailKey)) {
        const coinSize = Math.max(12, Math.min(24, rowHeight * 0.22 * 1.3));
        const coinThumb = this.add.image(textLeft + coinSize / 2, cursorY + rowHeight - 14, coinThumbnailKey).setDisplaySize(coinSize, coinSize);
        additions.push(coinThumb);
        status.setPosition(textLeft + coinSize + 4, status.y);
      }

      const actionButtonWidth = clamp(rowWidth * 0.27, 110, 150);
      const actionButtonHeight = clamp(rowHeight * 0.44, 30, 40);
      const actionButtonX = width / 2 + rowWidth / 2 - actionButtonWidth / 2 - 10;
      const actionButtonY = cursorY + rowHeight / 2;
      const actionFill = owned && item.shopType !== "BOOSTER" ? 0x475569 : canBuy ? 0x16a34a : 0xb91c1c;
      const actionButton = this.add.rectangle(actionButtonX, actionButtonY, actionButtonWidth, actionButtonHeight, actionFill, 0.96).setStrokeStyle(1, 0x0f172a);
      const actionLabel = this.add.text(actionButtonX, actionButtonY, owned && item.shopType !== "BOOSTER" ? "Comprado" : canBuy ? "Comprar" : "Sin monedas", {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 11, 14)}px`,
        color: "#f8fafc",
        fontStyle: "bold"
      }).setOrigin(0.5, 0.5);

      actionButton.setInteractive({ useHandCursor: true });
      actionButton.on("pointerdown", () => {
        if (owned && item.shopType !== "BOOSTER") {
          this.showToast("Este item ya fue comprado", "warning");
          this.shakeObject(actionButton);
          return;
        }

        const purchaseResult = this.engine.buyItemWithQuantity(this.state, item.id, 1);
        if (!purchaseResult.success) {
          this.handlePurchaseFailure(purchaseResult, actionButton);
          return;
        }

        this.state = purchaseResult.state;
        this.showToast(`Compra exitosa: ${item.label}`, "success");
        this.pulseObject(actionButton);
        this.refreshHud();
        this.renderActiveModal(true);
      });

      this.modalContentContainer.add([...additions, label, description, status, actionButton, actionLabel]);
      cursorY += rowHeight + rowGap;
    };

    const renderResourceRow = (item: { id: string; label: string; description: string; costLabel: string }): void => {
      const rowCard = this.add.rectangle(width / 2, cursorY + rowHeight / 2, rowWidth, rowHeight, 0x1f2937, 0.94).setStrokeStyle(1, 0x475569);
      const thumbTextureKey = this.getResourceThumbnailKey(item.id);
      const thumbSize = Math.min(rowHeight - 8, (rowHeight - 24) * 1.3);
      const thumbX = left + 12 + thumbSize / 2;
      const thumbY = cursorY + rowHeight / 2;
      let textLeft = left + 12;
      const additions: Phaser.GameObjects.GameObject[] = [rowCard];

      if (thumbTextureKey && this.textures.exists(thumbTextureKey)) {
        const thumbnail = this.add.image(thumbX, thumbY, thumbTextureKey).setDisplaySize(thumbSize, thumbSize);
        additions.push(thumbnail);
        textLeft += thumbSize + 10;
      }

      const label = this.add.text(textLeft, cursorY + 6, item.label, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.022, 12, 18)}px`,
        color: "#f8fafc",
        fontStyle: "bold",
        wordWrap: { width: textWidth }
      });
      const description = this.add.text(textLeft, cursorY + 29, item.description, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 10, 14)}px`,
        color: "#cbd5e1",
        wordWrap: { width: textWidth }
      });
      const status = this.add.text(textLeft, cursorY + rowHeight - 22, item.costLabel, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 11, 15)}px`,
        color: "#f59e0b"
      });

      this.modalContentContainer.add([...additions, label, description, status]);
      cursorY += rowHeight + rowGap;
    };

    renderSectionHeading("Skins");
    this.engine.shopItems.filter((item) => item.shopType === "SKIN").forEach(renderShopItemRow);
    cursorY += sectionGap;

    renderSectionHeading("Fondos");
    this.engine.shopItems.filter((item) => item.shopType === "BACKGROUND").forEach(renderShopItemRow);
    cursorY += sectionGap;

    renderSectionHeading("Boosters");
    this.engine.shopItems.filter((item) => item.shopType === "BOOSTER").forEach(renderShopItemRow);
    cursorY += sectionGap;

    renderSectionHeading("Recursos (Paquetes de Monedas y Gemas)");
    resourceItems.forEach(renderResourceRow);

    this.finalizeModalScroll(cursorY);
  }

  private renderInventoryModal(): void {
    const width = this.scale.width;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
    const modalWidth = this.modalClipRect.width + 32;
    const left = this.modalClipRect.x + 6;
    let cursorY = this.modalClipRect.y + 8;
    const sectionGap = 18;
    const rowHeight = clamp(this.scale.height * 0.06, 42, 56);
    const rowWidth = modalWidth - 36;

    const sections = [
      {
        title: "Skins",
        items: Array.from(this.state.ownedSkins),
        equipped: this.state.equippedSkin,
        onUse: (label: string) => this.equipInventoryItem("SKIN", label),
        preview: (label: string) => this.engine.getSkinPreviewColor(label)
      },
      {
        title: "Fondos",
        items: Array.from(this.state.ownedBackgrounds),
        equipped: this.state.equippedBackground,
        onUse: (label: string) => this.equipInventoryItem("BACKGROUND", label),
        preview: (label: string) => this.engine.getBackgroundPreviewColor(label)
      }
    ];

    sections.forEach((section) => {
      const sectionTitleHeight = clamp(this.scale.height * 0.048, 26, 36);
      const sectionTitleBg = this.add.rectangle(width / 2, cursorY + sectionTitleHeight / 2, rowWidth, sectionTitleHeight, 0x111827, 0.96).setStrokeStyle(1, 0x334155);
      const heading = this.add.text(left + 8, cursorY + 5, section.title, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.022, 13, 17)}px`,
        color: "#e2e8f0",
        fontStyle: "bold"
      });
      this.modalContentContainer.add([sectionTitleBg, heading]);
      cursorY += sectionTitleHeight + 8;

      section.items.forEach((labelText) => {
        const active = labelText === section.equipped;
        const button = this.add.rectangle(width / 2, cursorY + rowHeight / 2, rowWidth, rowHeight, active ? 0x0f766e : 0x1f2937, 0.94).setStrokeStyle(1, 0x475569);
        const thumbnailKey = this.getInventoryThumbnailKey(section.title, labelText);
        const hasThumbnail = thumbnailKey ? this.textures.exists(thumbnailKey) : false;
        const thumbCenterX = left + 18;
        const thumbCenterY = cursorY + rowHeight / 2;
        let labelLeft = left + 36;
        const rowObjects: Phaser.GameObjects.GameObject[] = [button];

        if (hasThumbnail && thumbnailKey) {
          const thumbSize = Math.min(rowHeight - 6, Math.max(20, (rowHeight - 14) * 1.3));
          const thumb = this.add.image(thumbCenterX, thumbCenterY, thumbnailKey).setDisplaySize(thumbSize, thumbSize);
          rowObjects.push(thumb);
        } else {
          const swatch = this.add.circle(thumbCenterX, thumbCenterY, 10, section.preview(labelText));
          rowObjects.push(swatch);
        }

        const label = this.add.text(labelLeft, cursorY + 8, labelText, {
          fontFamily: "Verdana",
          fontSize: `${clamp(width * 0.022, 12, 17)}px`,
          color: "#f8fafc"
        });
        const status = this.add.text(width / 2 + rowWidth / 2 - 84, cursorY + 8, active ? "Usando" : "Usar", {
          fontFamily: "Verdana",
          fontSize: `${clamp(width * 0.02, 11, 15)}px`,
          color: active ? "#ccfbf1" : "#bfdbfe",
          fontStyle: "bold"
        });

        if (!active) {
          button.setInteractive({ useHandCursor: true });
          button.on("pointerdown", () => {
            const previousState = this.state;
            section.onUse(labelText);
            const changed =
              (section.title === "Skins" && previousState.equippedSkin !== this.state.equippedSkin) ||
              (section.title === "Fondos" && previousState.equippedBackground !== this.state.equippedBackground);
            if (changed) {
              this.showToast(`Usando ${labelText}`, "success");
              this.pulseObject(button);
            }
            this.refreshHud();
            this.renderActiveModal(true);
          });
        }

        this.modalContentContainer.add([...rowObjects, label, status]);
        cursorY += rowHeight + 8;
      });

      cursorY += sectionGap;
    });

    const boostersSectionHeight = clamp(this.scale.height * 0.048, 26, 36);
    const boostersSectionBg = this.add.rectangle(width / 2, cursorY + boostersSectionHeight / 2, rowWidth, boostersSectionHeight, 0x111827, 0.96).setStrokeStyle(1, 0x334155);
    const boostersHeading = this.add.text(left + 8, cursorY + 5, "Boosters", {
      fontFamily: "Verdana",
      fontSize: `${clamp(width * 0.022, 13, 17)}px`,
      color: "#e2e8f0",
      fontStyle: "bold"
    });
    this.modalContentContainer.add([boostersSectionBg, boostersHeading]);
    cursorY += boostersSectionHeight + 8;

    this.engine.boosters.forEach((booster) => {
      const count = this.state.ownedBoosters[booster.id] ?? 0;
      const active = this.state.activeBoosterId === booster.id;
      const selected = this.state.selectedBoosterId === booster.id;
      if (count <= 0 && !active && !selected) {
        return;
      }
      const fill = active ? 0x854d0e : selected ? 0x1d4ed8 : 0x1f2937;

      const button = this.add.rectangle(width / 2, cursorY + rowHeight / 2, rowWidth, rowHeight, fill, 0.94).setStrokeStyle(1, 0x475569);
      const boosterThumbKey = this.getBoosterThumbnailKey(booster.id);
      const hasBoosterThumbnail = boosterThumbKey ? this.textures.exists(boosterThumbKey) : false;
      const boosterThumbCenterX = left + 18;
      const boosterThumbCenterY = cursorY + rowHeight / 2;
      let labelLeft = left + 12;
      const boosterRowObjects: Phaser.GameObjects.GameObject[] = [button];

      if (hasBoosterThumbnail && boosterThumbKey) {
        const boosterThumbSize = Math.min(rowHeight - 6, Math.max(20, (rowHeight - 14) * 1.3));
        const boosterThumb = this.add.image(boosterThumbCenterX, boosterThumbCenterY, boosterThumbKey).setDisplaySize(boosterThumbSize, boosterThumbSize);
        boosterRowObjects.push(boosterThumb);
        labelLeft = left + 34;
      }

      const label = this.add.text(labelLeft, cursorY + 8, booster.label, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.022, 12, 17)}px`,
        color: "#f8fafc"
      });
      const statusLabel = active ? "Activo" : selected ? "Seleccionado" : "Seleccionar";
      const status = this.add.text(width / 2 + rowWidth / 2 - 156, cursorY + 8, `${statusLabel} · x${count}`, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.018, 11, 15)}px`,
        color: active ? "#fef08a" : selected ? "#bfdbfe" : "#cbd5e1",
        fontStyle: "bold"
      });

      if (count > 0 && !active) {
        button.setInteractive({ useHandCursor: true });
        button.on("pointerdown", () => {
          if (selected) {
            this.state = this.engine.clearSelectedBooster(this.state);
            this.showToast(`Booster deseleccionado: ${booster.label}`, "info");
            this.pulseObject(button);
          } else {
            if (this.state.activeBoosterId) {
              this.showToast("Solo 1 booster activo a la vez", "warning");
              this.shakeObject(button);
              return;
            }
            this.state = this.engine.selectBooster(this.state, booster.id);
            if (this.state.selectedBoosterId === booster.id) {
              this.showToast(`Booster listo: ${booster.label}`, "success");
              this.pulseObject(button);
            } else {
              this.showToast("No se pudo seleccionar el booster", "warning");
              this.shakeObject(button);
            }
          }
          this.refreshHud();
          this.renderActiveModal(true);
        });
      }

      this.modalContentContainer.add([...boosterRowObjects, label, status]);
      cursorY += rowHeight + 8;
    });

    this.finalizeModalScroll(cursorY);
  }

  private renderAchievementsModal(): void {
    const width = this.scale.width;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
    const left = this.modalClipRect.x + 6;
    const contentWidth = this.modalClipRect.width - 12;
    let cursorY = this.modalClipRect.y + 8;
    const achievements = this.engine.getAchievementProgress(this.state);
    const unlocked = achievements.filter((item) => item.achieved);
    const locked = achievements.filter((item) => !item.achieved);

    const achievedHeading = this.add.text(left, cursorY, "Conseguidos", {
      fontFamily: "Verdana",
      fontSize: `${clamp(width * 0.024, 13, 18)}px`,
      color: "#86efac",
      fontStyle: "bold"
    });
    this.modalContentContainer.add(achievedHeading);
    cursorY += achievedHeading.height + 8;

    const achievedText = this.add.text(
      left,
      cursorY,
      unlocked.length > 0 ? unlocked.map((item) => `• ${item.label} — ${item.description}`).join("\n") : "Aun no has desbloqueado logros.",
      {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.02, 11, 15)}px`,
        color: "#dcfce7",
        wordWrap: { width: contentWidth }
      }
    );
    this.modalContentContainer.add(achievedText);
    cursorY += achievedText.height + 18;

    const pendingHeading = this.add.text(left, cursorY, "Pendientes", {
      fontFamily: "Verdana",
      fontSize: `${clamp(width * 0.024, 13, 18)}px`,
      color: "#f8fafc",
      fontStyle: "bold"
    });
    this.modalContentContainer.add(pendingHeading);
    cursorY += pendingHeading.height + 8;

    locked.forEach((item) => {
      const percent = Math.floor((item.current / item.target) * 100);
      const row = this.add.text(left, cursorY, `• ${item.label}\n  ${item.current}/${item.target} (${percent}%)\n  ${item.description}`, {
        fontFamily: "Verdana",
        fontSize: `${clamp(width * 0.02, 11, 15)}px`,
        color: "#cbd5e1",
        wordWrap: { width: contentWidth }
      });
      this.modalContentContainer.add(row);
      cursorY += row.height + 10;
    });

    this.finalizeModalScroll(cursorY);
  }

  private equipInventoryItem(type: InventoryType, label: string): void {
    this.state = this.engine.equipItem(this.state, type, label);
  }

  private isOwned(item: ShopItem): boolean {
    if (item.shopType === "BOOSTER") {
      return false;
    }

    if (item.shopType === "SKIN") {
      return this.state.ownedSkins.has(item.label);
    }

    if (item.shopType === "BACKGROUND") {
      return this.state.ownedBackgrounds.has(item.label);
    }

    return false;
  }

  private handlePurchaseFailure(result: PurchaseResult, target: Phaser.GameObjects.Rectangle): void {
    if (result.reason === "INSUFFICIENT_COINS") {
      const missing = Math.max(0, result.totalCost - this.state.coins);
      this.showToast(`Monedas insuficientes. Te faltan ${missing}`, "error");
      this.shakeObject(target);
      return;
    }

    if (result.reason === "ALREADY_OWNED") {
      this.showToast("Ese item ya esta comprado", "warning");
      this.shakeObject(target);
      return;
    }

    if (result.reason === "INVALID_QUANTITY") {
      this.showToast("Cantidad invalida", "warning");
      this.shakeObject(target);
      return;
    }

    this.showToast("No se pudo completar la compra", "error");
    this.shakeObject(target);
  }

  private showToast(message: string, tone: "success" | "info" | "warning" | "error"): void {
    const colors = {
      success: 0x15803d,
      info: 0x1d4ed8,
      warning: 0xa16207,
      error: 0xb91c1c
    };

    this.toastBg.setFillStyle(colors[tone], 0.96);
    this.toastText.setText(message);
    this.toastText.setPosition(this.toastBg.x - this.toastText.width / 2, this.toastBg.y - this.toastText.height / 2);

    const baseY = this.toastBg.y;
    this.toastBg.setVisible(true).setAlpha(0).setY(baseY - 10);
    this.toastText.setVisible(true).setAlpha(0).setY(baseY - this.toastText.height / 2 - 10);

    if (this.toastTween) {
      this.toastTween.stop();
      this.toastTween.remove();
      this.toastTween = undefined;
    }
    this.tweens.killTweensOf([this.toastBg, this.toastText]);

    this.tweens.add({
      targets: [this.toastBg, this.toastText],
      alpha: 1,
      y: `+=10`,
      duration: 150,
      ease: "Quad.Out"
    });

    this.toastTween = this.tweens.add({
      targets: [this.toastBg, this.toastText],
      alpha: 0,
      y: `-=6`,
      delay: 1400,
      duration: 260,
      ease: "Quad.In",
      onComplete: () => {
        this.toastBg.setVisible(false).setY(baseY);
        this.toastText.setVisible(false).setY(baseY - this.toastText.height / 2);
        this.toastTween = undefined;
      }
    });
  }

  private pulseObject(target: Phaser.GameObjects.Rectangle): void {
    const startScaleX = target.scaleX;
    const startScaleY = target.scaleY;
    this.tweens.add({
      targets: target,
      scaleX: startScaleX * 1.04,
      scaleY: startScaleY * 1.04,
      yoyo: true,
      duration: 110,
      ease: "Quad.Out"
    });
  }

  private shakeObject(target: Phaser.GameObjects.Rectangle): void {
    const startX = target.x;
    this.tweens.add({
      targets: target,
      x: { from: startX - 6, to: startX + 6 },
      yoyo: true,
      repeat: 2,
      duration: 40,
      ease: "Sine.InOut",
      onComplete: () => {
        target.x = startX;
      }
    });
  }

  private showLevelUpCelebration(previousLevelIndex: number, newLevelIndex: number): void {
    const previousLevel = this.engine.levels[previousLevelIndex].level;
    const newLevel = this.engine.levels[newLevelIndex].level;
    let rewardCoins = 0;
    for (let index = previousLevelIndex + 1; index <= newLevelIndex; index += 1) {
      rewardCoins += this.engine.levels[index].rewardCoins;
    }

    const absurdMessages = [
      "Tu roca ahora tiene LinkedIn y cobra por mentoring geologico.",
      "La cantera reporto actividad paranormal: una piedra subio de rango.",
      "Tu roca recibio un ascenso y ya pide oficina con vista al volcan.",
      "Felicitaciones: la roca ahora es senior y se rehusa a usar casco.",
      "El sindicato mineral acaba de aprobar tu nueva categoria de caos."
    ];
    const absurd = absurdMessages[(newLevel - 1) % absurdMessages.length];

    this.levelUpTitle.setText(`Nivel ${previousLevel} -> ${newLevel}`);
    this.levelUpBody.setText(`${absurd}\n\nRecompensa: +${rewardCoins} monedas.`);

    const panelWidth = this.levelUpPanel.displayWidth;
    const panelHeight = this.levelUpPanel.displayHeight;
    const centerX = this.levelUpPanel.x;
    const centerY = this.levelUpPanel.y;
    this.levelUpTitle.setPosition(centerX - this.levelUpTitle.width / 2, centerY - panelHeight / 2 + 24);
    this.levelUpBody.setPosition(centerX - this.levelUpBody.width / 2, this.levelUpTitle.y + this.levelUpTitle.height + 18);
    this.levelUpCloseText.setPosition(centerX + panelWidth / 2 - this.levelUpCloseText.width - 18, centerY - panelHeight / 2 + 12);

    [this.levelUpOverlay, this.levelUpPanel, this.levelUpTitle, this.levelUpBody, this.levelUpCloseText].forEach((item) => {
      item.setVisible(true).setAlpha(0);
    });

    if (this.levelUpTween) {
      this.levelUpTween.stop();
      this.levelUpTween.remove();
      this.levelUpTween = undefined;
    }
    this.tweens.killTweensOf([this.levelUpOverlay, this.levelUpPanel, this.levelUpTitle, this.levelUpBody, this.levelUpCloseText]);

    this.tweens.add({
      targets: [this.levelUpOverlay, this.levelUpPanel, this.levelUpTitle, this.levelUpBody, this.levelUpCloseText],
      alpha: 1,
      duration: 240,
      ease: "Quad.Out"
    });

    this.levelUpTween = this.tweens.add({
      targets: [this.levelUpOverlay, this.levelUpPanel, this.levelUpTitle, this.levelUpBody, this.levelUpCloseText],
      alpha: 0,
      delay: 6000,
      duration: 280,
      ease: "Quad.In",
      onComplete: () => {
        this.closeLevelUpCelebration(false);
      }
    });
  }

  private closeLevelUpCelebration(withFade: boolean = true): void {
    if (!this.levelUpOverlay.visible) {
      return;
    }

    if (this.levelUpTween) {
      this.levelUpTween.stop();
      this.levelUpTween.remove();
      this.levelUpTween = undefined;
    }

    const targets = [this.levelUpOverlay, this.levelUpPanel, this.levelUpTitle, this.levelUpBody, this.levelUpCloseText];
    this.tweens.killTweensOf(targets);

    if (!withFade) {
      targets.forEach((item) => item.setVisible(false));
      return;
    }

    this.tweens.add({
      targets,
      alpha: 0,
      duration: 180,
      ease: "Quad.In",
      onComplete: () => {
        targets.forEach((item) => item.setVisible(false));
      }
    });
  }

  private refreshHud(): void {
    const level = this.engine.levels[this.state.levelIndex];
    const width = this.scale.width;
    const hubHalfWidth = width / 2;
    this.coinsText.setText(`Monedas: ${this.state.coins}`);
    this.tapsValue.setText(`${this.state.taps}`);
    this.levelValue.setText(`${level.level}`);
    this.boosterStatusText.setText(this.engine.getBoosterStatusLabel(this.state));
    this.drawBackground(this.scale.width, this.scale.height);
    this.rock.setTexture(this.getSkinTextureKey(this.state.equippedSkin));
    this.applyRockDisplaySize();
    this.tapText.setVisible(!this.isUsingSkinTexture());

    const statusBoosterId = this.state.activeBoosterId ?? this.state.selectedBoosterId;
    const statusBoosterKey = statusBoosterId ? this.getBoosterThumbnailKey(statusBoosterId) : null;
    const iconVisible = Boolean(statusBoosterKey && this.textures.exists(statusBoosterKey));
    if (this.boosterStatusIcon) {
      if (iconVisible && statusBoosterKey) {
        const iconSize = Math.max(14, Math.min(24, this.boosterStatusText.height * 1.3));
        this.boosterStatusIcon.setTexture(statusBoosterKey).setDisplaySize(iconSize, iconSize).setVisible(true);
      } else {
        this.boosterStatusIcon.setVisible(false);
      }
    }

    if (this.coinsIcon) {
      const coinIconSize = this.coinsIcon.displayWidth;
      this.coinsIcon.setPosition(this.coinsIcon.x, this.topBar.y);
      this.coinsText.setPosition(this.coinsIcon.x + coinIconSize / 2 + 8, this.topBar.y - this.coinsText.height / 2);
    } else {
      this.coinsText.setPosition(this.coinsText.x, this.topBar.y - this.coinsText.height / 2);
    }
    this.tapsValue.setPosition(hubHalfWidth * 0.5 - this.tapsValue.width / 2, this.tapsLabel.y + this.tapsLabel.height + 2);
    this.levelValue.setPosition(hubHalfWidth + hubHalfWidth * 0.5 - this.levelValue.width / 2, this.levelLabel.y + this.levelLabel.height + 2);
    if (this.boosterStatusIcon && this.boosterStatusIcon.visible) {
      const spacing = 6;
      const totalWidth = this.boosterStatusIcon.displayWidth + spacing + this.boosterStatusText.width;
      const leftStart = width / 2 - totalWidth / 2;
      this.boosterStatusIcon.setPosition(leftStart + this.boosterStatusIcon.displayWidth / 2, this.levelValue.y + this.levelValue.height + 11);
      this.boosterStatusText.setPosition(leftStart + this.boosterStatusIcon.displayWidth + spacing, this.levelValue.y + this.levelValue.height + 3);
    } else {
      this.boosterStatusText.setPosition(width / 2 - this.boosterStatusText.width / 2, this.levelValue.y + this.levelValue.height + 3);
    }
    this.tapText.setPosition(this.rock.x - this.tapText.width / 2, this.rock.y - this.tapText.height / 2);

    if (this.activeModal === "shop" || this.activeModal === "inventory") {
      this.renderActiveModal(true);
    }
  }

  private playRockTapAnimation(): void {
    if (this.rockTapTween) {
      this.rockTapTween.stop();
      this.rockTapTween.remove();
      this.rockTapTween = undefined;
    }

    this.tweens.killTweensOf(this.rock);
    this.rock.setScale(this.rockBaseScaleX, this.rockBaseScaleY);

    this.rockTapTween = this.tweens.add({
      targets: this.rock,
      scaleX: this.rockBaseScaleX * 1.08,
      scaleY: this.rockBaseScaleY * 1.08,
      yoyo: true,
      duration: 80,
      ease: "Quad.Out",
      onStop: () => {
        this.rock.setScale(this.rockBaseScaleX, this.rockBaseScaleY);
      },
      onComplete: () => {
        this.rock.setScale(this.rockBaseScaleX, this.rockBaseScaleY);
        this.rockTapTween = undefined;
      }
    });
  }

  private spawnTapFeedback(feedback: TapFeedback): void {
    if (this.activeTapFeedback >= this.maxActiveTapFeedback) {
      return;
    }

    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
    const viewportScale = clamp(Math.min(this.scale.width, this.scale.height) / 640, 0.9, 1.35);
    const visualRadius = this.rock.displayWidth / 2;
    const startX = this.rock.x + visualRadius * (0.45 + Phaser.Math.FloatBetween(-0.05, 0.06));
    const startY = this.rock.y - visualRadius * (0.56 + Phaser.Math.FloatBetween(-0.06, 0.05));
    const endX = startX + Phaser.Math.FloatBetween(38, 72) * viewportScale;
    const endY = startY - Phaser.Math.FloatBetween(44, 84) * viewportScale;
    const fontSize = Math.round((feedback.amount >= 500 ? 32 : 26) * viewportScale);

    const floatText = this.add.text(startX, startY, `+${feedback.amount}`, {
      fontFamily: "Verdana",
      fontSize: `${fontSize}px`,
      fontStyle: "bold",
      color: feedback.color,
      stroke: "#052e16",
      strokeThickness: feedback.amount >= 500 ? 6 : 5
    }).setDepth(30);

    this.activeTapFeedback += 1;
    floatText.setOrigin(0.5, 0.5);
    floatText.setAngle(Phaser.Math.FloatBetween(-10, 10));

    this.tweens.add({
      targets: floatText,
      x: endX,
      y: endY,
      alpha: 0,
      scaleX: Phaser.Math.FloatBetween(0.9, 1.02),
      scaleY: Phaser.Math.FloatBetween(0.9, 1.02),
      duration: feedback.durationMs,
      ease: "Cubic.Out",
      onComplete: () => {
        this.activeTapFeedback = Math.max(0, this.activeTapFeedback - 1);
        floatText.destroy();
      },
      onStop: () => {
        this.activeTapFeedback = Math.max(0, this.activeTapFeedback - 1);
        floatText.destroy();
      }
    });
  }

  private getSkinTextureKey(skin: string): string {
    if (skin === "rock_gurona_buchona" || skin === "rock_guerona_buchona") {
      return "rock_gurona_buchona";
    }

    if (skin === "rock_1") {
      return "rock_1";
    }

    return this.textures.exists(skin) ? skin : "rock_1";
  }

  private startLoadingScreen(): void {
    this.loadingActive = true;
    this.input.enabled = false;

    [this.loadingOverlay, this.loadingBarTrack, this.loadingBarFill, this.loadingText].forEach((item) => {
      item?.setVisible(true).setAlpha(1);
    });
    if (this.loadingBackgroundImage) {
      this.loadingBackgroundImage.setVisible(true).setAlpha(1);
      this.loadingOverlay?.setAlpha(0.2);
    } else {
      this.loadingOverlay?.setAlpha(0.34);
    }

    this.layoutLoadingScreen();
    this.loadingBarFill.setScale(0, this.loadingBarFill.scaleY);

    this.tweens.add({
      targets: this.loadingBarFill,
      scaleX: 1,
      duration: 3000,
      ease: "Linear",
      onComplete: () => {
        this.finishLoadingScreen();
      }
    });
  }

  private finishLoadingScreen(): void {
    const targets: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Image> = [
      this.loadingOverlay,
      this.loadingBarTrack,
      this.loadingBarFill,
      this.loadingText
    ].filter(Boolean) as Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text | Phaser.GameObjects.Image>;
    if (this.loadingBackgroundImage) {
      targets.push(this.loadingBackgroundImage);
    }

    this.tweens.add({
      targets,
      alpha: 0,
      duration: 220,
      ease: "Quad.In",
      onComplete: () => {
        targets.forEach((item) => item.setVisible(false));
        this.loadingActive = false;
        this.input.enabled = true;
      }
    });
  }

  private layoutLoadingScreen(): void {
    if (!this.loadingOverlay || !this.loadingBarTrack || !this.loadingBarFill || !this.loadingText) {
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
    const barHeight = clamp(height * 0.028, 16, 26);
    this.loadingBarWidth = clamp(width * 0.62, 220, 460);

    this.loadingOverlay.setPosition(width / 2, height / 2);
    this.sizeRect(this.loadingOverlay, width, height);

    if (this.loadingBackgroundImage) {
      this.loadingBackgroundImage.setPosition(width / 2, height / 2);
      this.loadingBackgroundImage.setDisplaySize(width, height);
    }

    const barY = height * 0.82;
    this.loadingBarTrack.setPosition(width / 2, barY);
    this.sizeRect(this.loadingBarTrack, this.loadingBarWidth, barHeight);

    this.loadingBarFill.setPosition(width / 2 - this.loadingBarWidth / 2, barY);
    this.loadingBarFill.setScale(this.loadingBarFill.scaleX, barHeight / this.rectBaseSize);
    this.loadingBarFill.displayWidth = this.loadingBarWidth;

    this.loadingText.setStyle({ fontSize: `${clamp(width * 0.034, 18, 30)}px` });
    this.loadingText.setPosition(width / 2 - this.loadingText.width / 2, barY - barHeight - this.loadingText.height - 10);
  }

  private getShopItemThumbnailKey(item: ShopItem): string | null {
    if (item.shopType === "SKIN") {
      const key = this.getSkinTextureKey(item.label);
      return this.textures.exists(key) ? key : null;
    }

    if (item.shopType === "BACKGROUND") {
      return this.getBackgroundTextureKey(item.label);
    }

    if (item.shopType === "BOOSTER" && item.boosterType) {
      return this.getBoosterThumbnailKey(item.boosterType);
    }

    return null;
  }

  private getInventoryThumbnailKey(sectionTitle: string, label: string): string | null {
    if (sectionTitle === "Skins") {
      const key = this.getSkinTextureKey(label);
      return this.textures.exists(key) ? key : null;
    }

    if (sectionTitle === "Fondos") {
      return this.getBackgroundTextureKey(label);
    }

    return null;
  }

  private getBoosterThumbnailKey(boosterId: string): string | null {
    const candidates = [
      `booster_${boosterId.toLowerCase()}`,
      `booster_${boosterId}`,
      boosterId.toLowerCase(),
      boosterId
    ];

    const found = candidates.find((key) => this.textures.exists(key));
    return found ?? null;
  }

  private getBackgroundTextureKey(background: string): string | null {
    const aliases: Record<string, string[]> = {
      bg_volcano: ["bg_volcan_1"]
    };

    const candidates = [background, ...(aliases[background] ?? [])];
    const found = candidates.find((key) => this.textures.exists(key));
    return found ?? null;
  }

  private getCoinsThumbnailKey(): string | null {
    const candidates = ["monedas_icono", "coin", "coins", "moneda", "monedas", "currency_coin"];
    const found = candidates.find((key) => this.textures.exists(key));
    return found ?? null;
  }

  private getResourceThumbnailKey(resourceId: string): string | null {
    if (resourceId.includes("coin")) {
      return this.getCoinsThumbnailKey();
    }

    const gemCandidates = ["gems_1", "gem", "gems", "gema", "gemas", "currency_gem"];
    const foundGem = gemCandidates.find((key) => this.textures.exists(key));
    return foundGem ?? null;
  }

  private applyRockDisplaySize(): void {
    this.rock.setDisplaySize(this.rockDiameter, this.rockDiameter);
    this.rockBaseScaleX = this.rock.scaleX;
    this.rockBaseScaleY = this.rock.scaleY;
  }

  private isUsingSkinTexture(): boolean {
    const textureKey = this.getSkinTextureKey(this.state.equippedSkin);
    return this.textures.exists(textureKey);
  }
}
