const TEMP_X5_DURATION_MS = 10 * 60 * 1000;

export interface RockLevel {
  level: number;
  name: string;
  tapsRequired: number;
  rewardCoins: number;
}

export type BoosterType = "TAP_X2" | "DYNAMITE_X100" | "TAP_X5_10_MIN";
export type ShopType = "BOOSTER" | "SKIN" | "BACKGROUND" | "SOUND";

export interface ShopItem {
  id: string;
  label: string;
  costCoins: number;
  shopType: ShopType;
  boosterType?: BoosterType;
}

export interface GameState {
  taps: number;
  coins: number;
  levelIndex: number;
  permanentMultiplier: number;
  tempX5UntilMs: number;
  equippedSkin: string;
  equippedBackground: string;
  equippedSound: string;
  ownedSkins: Set<string>;
  ownedBackgrounds: Set<string>;
  ownedSounds: Set<string>;
  achievements: Set<string>;
}

export const createInitialGameState = (): GameState => ({
  taps: 0,
  coins: 0,
  levelIndex: 0,
  permanentMultiplier: 1,
  tempX5UntilMs: 0,
  equippedSkin: "Default",
  equippedBackground: "Cantera",
  equippedSound: "Tap",
  ownedSkins: new Set(["Default"]),
  ownedBackgrounds: new Set(["Cantera"]),
  ownedSounds: new Set(["Tap"]),
  achievements: new Set()
});

export class GameEngine {
  constructor(private readonly now: () => number = () => Date.now()) {}

  readonly levels: RockLevel[] = [
    { level: 1, name: "Roca comun", tapsRequired: 0, rewardCoins: 0 },
    { level: 2, name: "Roca con carbon", tapsRequired: 1_000, rewardCoins: 50 },
    { level: 3, name: "Roca con hierro", tapsRequired: 10_000, rewardCoins: 250 },
    { level: 4, name: "Roca con cobre", tapsRequired: 25_000, rewardCoins: 600 },
    { level: 5, name: "Roca con oro", tapsRequired: 50_000, rewardCoins: 1_500 },
    { level: 6, name: "Roca con diamante", tapsRequired: 100_000, rewardCoins: 5_000 }
  ];

  readonly shopItems: ShopItem[] = [
    { id: "booster_x2", label: "Tap x2 permanente", costCoins: 150, shopType: "BOOSTER", boosterType: "TAP_X2" },
    {
      id: "booster_dyn",
      label: "Dinamita +100 taps",
      costCoins: 200,
      shopType: "BOOSTER",
      boosterType: "DYNAMITE_X100"
    },
    {
      id: "booster_x5",
      label: "Tap x5 por 10 min",
      costCoins: 500,
      shopType: "BOOSTER",
      boosterType: "TAP_X5_10_MIN"
    },
    { id: "skin_obsidian", label: "Skin Obsidiana", costCoins: 300, shopType: "SKIN" },
    { id: "skin_meteor", label: "Skin Meteorito", costCoins: 900, shopType: "SKIN" },
    { id: "bg_volcano", label: "Fondo Volcan", costCoins: 700, shopType: "BACKGROUND" },
    { id: "sound_metal", label: "Sonido metalico raro", costCoins: 250, shopType: "SOUND" }
  ];

  tap(state: GameState): GameState {
    const multiplier = state.tempX5UntilMs > this.now() ? 5 : 1;
    const addedTaps = state.permanentMultiplier * multiplier;
    return this.applyProgress({ ...state, taps: state.taps + addedTaps });
  }

  buyItem(state: GameState, itemId: string): GameState {
    const item = this.shopItems.find((candidate) => candidate.id === itemId);
    if (!item || state.coins < item.costCoins) {
      return state;
    }

    const paid = { ...state, coins: state.coins - item.costCoins };
    if (item.shopType === "BOOSTER") {
      if (!item.boosterType) {
        return state;
      }
      return this.applyBooster(paid, item.boosterType);
    }

    if (item.shopType === "SKIN") {
      return {
        ...paid,
        ownedSkins: new Set([...paid.ownedSkins, item.label]),
        equippedSkin: item.label
      };
    }

    if (item.shopType === "BACKGROUND") {
      return {
        ...paid,
        ownedBackgrounds: new Set([...paid.ownedBackgrounds, item.label]),
        equippedBackground: item.label
      };
    }

    return {
      ...paid,
      ownedSounds: new Set([...paid.ownedSounds, item.label]),
      equippedSound: item.label
    };
  }

  private applyBooster(state: GameState, boosterType: BoosterType): GameState {
    if (boosterType === "TAP_X2") {
      return { ...state, permanentMultiplier: state.permanentMultiplier * 2 };
    }

    if (boosterType === "DYNAMITE_X100") {
      return this.applyProgress({ ...state, taps: state.taps + 100 });
    }

    return {
      ...state,
      tempX5UntilMs: Math.max(state.tempX5UntilMs, this.now() + TEMP_X5_DURATION_MS)
    };
  }

  private applyProgress(state: GameState): GameState {
    const newLevelIndex = this.levels.reduce((acc, level, index) => {
      return state.taps >= level.tapsRequired ? index : acc;
    }, 0);

    const mergedAchievements = new Set([...state.achievements, ...this.computeAchievements(state.taps, newLevelIndex)]);
    if (newLevelIndex <= state.levelIndex) {
      return {
        ...state,
        achievements: mergedAchievements
      };
    }

    let reward = 0;
    for (let index = state.levelIndex + 1; index <= newLevelIndex; index += 1) {
      reward += this.levels[index].rewardCoins;
    }

    return {
      ...state,
      levelIndex: newLevelIndex,
      coins: state.coins + reward,
      achievements: mergedAchievements
    };
  }

  private computeAchievements(taps: number, levelIndex: number): Set<string> {
    const out = new Set<string>();
    if (levelIndex >= 1) out.add("Nivel 2: tu roca ahora parece util");
    if (levelIndex >= 2) out.add("Nivel 3: la roca ya paga impuestos");
    if (levelIndex >= 3) out.add("Nivel 4: desbloqueaste fuerza geologica");
    if (levelIndex >= 4) out.add("Nivel 5: tu roca ya revienta ventanas");
    if (levelIndex >= 5) out.add("Nivel 6: tu roca es leyenda mineral");
    if (taps >= 10_000) out.add("10k taps: dedos de titanio");
    if (taps >= 100_000) out.add("100k taps: tocar rocas es tu destino");
    return out;
  }
}