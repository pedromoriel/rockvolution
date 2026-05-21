const MINUTE_MS = 60 * 1000;

export interface RockLevel {
  level: number;
  name: string;
  tapsRequired: number;
  rewardCoins: number;
}

export type BoosterType = "TAP_X2_5M" | "TAP_X2_10M" | "TAP_X2_20M" | "TAP_X2_30M" | "DYNAMITE_500";
export type ShopType = "BOOSTER" | "SKIN" | "BACKGROUND";
export type InventoryType = "SKIN" | "BACKGROUND";
export type AchievementKind = "TAPS" | "LEVEL" | "COSMETIC";

export interface ShopItem {
  id: string;
  label: string;
  description: string;
  costCoins: number;
  shopType: ShopType;
  boosterType?: BoosterType;
}

export interface CosmeticDefinition {
  id: string;
  label: string;
  description: string;
  previewColor: number;
  shopItemId?: string;
}

export interface BoosterDefinition {
  id: BoosterType;
  label: string;
  description: string;
  multiplier?: number;
  durationMs?: number;
  instantTaps?: number;
}

export interface AchievementDefinition {
  id: string;
  label: string;
  description: string;
  target: number;
  kind: AchievementKind;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  achieved: boolean;
}

export interface TapFeedback {
  amount: number;
  color: string;
  durationMs: number;
}

export interface TapResult {
  state: GameState;
  feedback: TapFeedback;
}

export type PurchaseFailureReason = "NOT_FOUND" | "INSUFFICIENT_COINS" | "ALREADY_OWNED" | "INVALID_QUANTITY";

export interface PurchaseResult {
  state: GameState;
  success: boolean;
  reason?: PurchaseFailureReason;
  item?: ShopItem;
  quantityRequested: number;
  quantityPurchased: number;
  totalCost: number;
}

export interface GameState {
  taps: number;
  coins: number;
  levelIndex: number;
  activeBoosterId: BoosterType | null;
  activeBoosterUntilMs: number;
  selectedBoosterId: BoosterType | null;
  equippedSkin: string;
  equippedBackground: string;
  ownedSkins: Set<string>;
  ownedBackgrounds: Set<string>;
  ownedBoosters: Record<BoosterType, number>;
  achievements: Set<string>;
}

const SKIN_DEFINITIONS: CosmeticDefinition[] = [
  { id: "rock_1", label: "rock_1", description: "La roca inicial. Clasica, confiable y con cero drama.", previewColor: 0x6b7280 },
  { id: "rock_obsidian", label: "rock_obsidian", description: "Negra y elegante para taps de alta seriedad.", previewColor: 0x1f2937, shopItemId: "skin_obsidian" },
  { id: "rock_meteor", label: "rock_meteor", description: "Impacto visual sin garantia de aterrizaje suave.", previewColor: 0x312e81, shopItemId: "skin_meteor" },
  {
    id: "rock_guerona_buchona",
    label: "rock_guerona_buchona",
    description: "Brilla, manda y presume. Exactamente en ese orden.",
    previewColor: 0xfacc15,
    shopItemId: "skin_guerona_buchona"
  }
];

const BACKGROUND_DEFINITIONS: CosmeticDefinition[] = [
  { id: "cantera", label: "cantera", description: "Fondo base para romper rocas con humildad.", previewColor: 0x111827 },
  {
    id: "bg_cantera_1",
    label: "bg_cantera_1",
    description: "Cantera clasica con actitud de leyenda local.",
    previewColor: 0x374151,
    shopItemId: "bg_cantera_1"
  },
  { id: "bg_volcano", label: "bg_volcano", description: "Vibras de lava y decisiones cuestionables.", previewColor: 0x7c2d12, shopItemId: "bg_volcano" },
  { id: "bg_aurora", label: "bg_aurora", description: "Luces bonitas para taps sofisticados.", previewColor: 0x0f766e, shopItemId: "bg_aurora" },
  { id: "bg_arcade", label: "bg_arcade", description: "Neon retro para un caos controlado.", previewColor: 0x1d4ed8, shopItemId: "bg_arcade" },
  { id: "bg_desert", label: "bg_desert", description: "Arena deluxe con actitud premium.", previewColor: 0xb45309, shopItemId: "bg_desert" }
];

const BOOSTER_DEFINITIONS: BoosterDefinition[] = [
  { id: "TAP_X2_5M", label: "Tap x2 (5 min)", description: "Doble taps por 5 minutos.", multiplier: 2, durationMs: 5 * MINUTE_MS },
  { id: "TAP_X2_10M", label: "Tap x2 (10 min)", description: "Doble taps por 10 minutos.", multiplier: 2, durationMs: 10 * MINUTE_MS },
  { id: "TAP_X2_20M", label: "Tap x2 (20 min)", description: "Doble taps por 20 minutos.", multiplier: 2, durationMs: 20 * MINUTE_MS },
  { id: "TAP_X2_30M", label: "Tap x2 (30 min)", description: "Doble taps por 30 minutos maximo.", multiplier: 2, durationMs: 30 * MINUTE_MS },
  { id: "DYNAMITE_500", label: "Dinamita +500", description: "Explota en el primer tap y suma 500 taps instantaneos.", instantTaps: 500 }
];

const TAP_ACHIEVEMENT_MILESTONES = [
  1, 2, 3, 5, 7, 10, 12, 15, 20, 25,
  30, 35, 40, 45, 50, 60, 70, 80, 90, 100,
  120, 140, 160, 180, 200, 225, 250, 275, 300, 350,
  400, 450, 500, 600, 700, 800, 900, 1_000, 1_200, 1_400,
  1_600, 1_800, 2_000, 2_500, 3_000, 3_500, 4_000, 4_500, 5_000, 6_000,
  7_000, 8_000, 9_000, 10_000, 12_000, 14_000, 16_000, 18_000, 20_000, 22_500,
  25_000, 27_500, 30_000, 35_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000,
  70_000, 75_000, 80_000, 85_000, 90_000, 95_000, 100_000, 110_000, 120_000, 130_000,
  140_000, 150_000, 160_000, 170_000, 180_000, 190_000, 200_000, 225_000, 250_000, 275_000,
  300_000, 325_000, 350_000, 375_000, 400_000, 450_000, 500_000, 600_000, 750_000, 1_000_000
] as const;

const funnyTapDescription = (target: number, index: number): string => {
  const absurdities = [
    "La roca ya sospecha de ti.",
    "Tus dedos pidieron sindicato.",
    "La geologia esta confundida pero orgullosa.",
    "Esto ya cuenta como cardio mineral.",
    "Nadie entreno para esto y aun asi paso.",
    "Tu roca ya cobra alquiler emocional.",
    "El universo anoto esto como conducta rara.",
    "Cada tap aleja un poquito la cordura.",
    "La cantera te dio un aplauso incomodo.",
    "Tu insistencia asusta a las montañas cercanas."
  ];

  return `${target.toLocaleString("es-MX")} taps. ${absurdities[index % absurdities.length]}`;
};

const TAP_ACHIEVEMENTS: AchievementDefinition[] = TAP_ACHIEVEMENT_MILESTONES.map((target, index) => ({
  id: `tap_${target}`,
  label: `${target.toLocaleString("es-MX")} taps: ${index % 2 === 0 ? "martillo de dedo" : "ritual geologico"}`,
  description: funnyTapDescription(target, index),
  target,
  kind: "TAPS"
}));

const LEVEL_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "level_2", label: "Nivel 2: tu roca ahora parece util", description: "Subiste de rango y la piedra ya presume curriculum.", target: 2, kind: "LEVEL" },
  { id: "level_3", label: "Nivel 3: la roca ya paga impuestos", description: "Legalmente sigue siendo roca, moralmente ya es empresa.", target: 3, kind: "LEVEL" },
  { id: "level_4", label: "Nivel 4: desbloqueaste fuerza geologica", description: "La cantera te mira con miedo y respeto desordenado.", target: 4, kind: "LEVEL" },
  { id: "level_5", label: "Nivel 5: tu roca ya revienta ventanas", description: "No lo hace, pero el barrio ya lo cree.", target: 5, kind: "LEVEL" },
  { id: "level_6", label: "Nivel 6: tu roca es leyenda mineral", description: "Los documentales empiezan a hablar de ti en susurros.", target: 6, kind: "LEVEL" }
];

const COSMETIC_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "cosmetic_1", label: "Vestidor minimo", description: "Tienes 1 cosmetico comprado. Ya se siente vanity project.", target: 1, kind: "COSMETIC" },
  { id: "cosmetic_2", label: "Coleccionista de cantera", description: "Acumulas 2 cosmeticos y cero remordimiento.", target: 2, kind: "COSMETIC" },
  { id: "cosmetic_3", label: "Boutique geologica", description: "Tres cosmeticos convierten esto en pasarela tectonica.", target: 3, kind: "COSMETIC" },
  { id: "cosmetic_4", label: "Curador del mal gusto", description: "Cuatro cosmeticos. Cada uno peor y mejor que el anterior.", target: 4, kind: "COSMETIC" },
  { id: "cosmetic_5", label: "Influencer de peñascos", description: "Cinco cosmeticos y la roca ya exige camerino.", target: 5, kind: "COSMETIC" },
  { id: "cosmetic_6", label: "Museo portatil", description: "Seis cosmeticos. Ya no es inventario, es una exhibicion.", target: 6, kind: "COSMETIC" },
  { id: "cosmetic_7", label: "Roca con estilista", description: "Siete cosmeticos y por fin hay presupuesto en moda absurda.", target: 7, kind: "COSMETIC" },
  { id: "cosmetic_8", label: "Catastrofe chic", description: "Ocho cosmeticos. Nadie puede detener esta escalada estetica.", target: 8, kind: "COSMETIC" },
  { id: "cosmetic_9", label: "Galeria con casco", description: "Nueve cosmeticos. Arte, peligro y decisiones cuestionables.", target: 9, kind: "COSMETIC" },
  { id: "cosmetic_10", label: "Imperio fashion del guijarro", description: "Diez cosmeticos. La roca ya tiene manager y rider tecnico.", target: 10, kind: "COSMETIC" }
];

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  ...LEVEL_ACHIEVEMENTS,
  ...COSMETIC_ACHIEVEMENTS,
  ...TAP_ACHIEVEMENTS
];

const createEmptyBoosters = (): Record<BoosterType, number> => ({
  TAP_X2_5M: 0,
  TAP_X2_10M: 0,
  TAP_X2_20M: 0,
  TAP_X2_30M: 0,
  DYNAMITE_500: 0
});

export const createInitialGameState = (): GameState => ({
  taps: 0,
  // Testing default. Production default will be 100.
  coins: 20_000,
  levelIndex: 0,
  activeBoosterId: null,
  activeBoosterUntilMs: 0,
  selectedBoosterId: null,
  equippedSkin: "rock_1",
  equippedBackground: "cantera",
  ownedSkins: new Set(["rock_1"]),
  ownedBackgrounds: new Set(["cantera"]),
  ownedBoosters: createEmptyBoosters(),
  achievements: new Set()
});

export class GameEngine {
  constructor(private readonly now: () => number = () => Date.now()) {}

  readonly levels: RockLevel[] = [
    { level: 1, name: "Roca comun", tapsRequired: 0, rewardCoins: 100 },
    { level: 2, name: "Roca con carbon", tapsRequired: 1_000, rewardCoins: 200 },
    { level: 3, name: "Roca con hierro", tapsRequired: 10_000, rewardCoins: 300 },
    { level: 4, name: "Roca con cobre", tapsRequired: 25_000, rewardCoins: 400 },
    { level: 5, name: "Roca con oro", tapsRequired: 50_000, rewardCoins: 500 },
    { level: 6, name: "Roca con diamante", tapsRequired: 100_000, rewardCoins: 600 }
  ];

  readonly skins = SKIN_DEFINITIONS;
  readonly backgrounds = BACKGROUND_DEFINITIONS;
  readonly boosters = BOOSTER_DEFINITIONS;

  readonly shopItems: ShopItem[] = [
    { id: "booster_x2_5m", label: "Booster x2 · 5 min", description: "Doble taps durante 5 minutos.", costCoins: 240, shopType: "BOOSTER", boosterType: "TAP_X2_5M" },
    { id: "booster_x2_10m", label: "Booster x2 · 10 min", description: "Doble taps durante 10 minutos.", costCoins: 420, shopType: "BOOSTER", boosterType: "TAP_X2_10M" },
    { id: "booster_x2_20m", label: "Booster x2 · 20 min", description: "Doble taps durante 20 minutos.", costCoins: 760, shopType: "BOOSTER", boosterType: "TAP_X2_20M" },
    { id: "booster_x2_30m", label: "Booster x2 · 30 min", description: "Doble taps durante 30 minutos maximo.", costCoins: 980, shopType: "BOOSTER", boosterType: "TAP_X2_30M" },
    { id: "booster_dyn_500", label: "Dinamita +500", description: "Al usarla, explota y suma 500 taps en el siguiente tap.", costCoins: 360, shopType: "BOOSTER", boosterType: "DYNAMITE_500" },
    { id: "skin_obsidian", label: "rock_obsidian", description: "Skin elegante y oscura para taps serios.", costCoins: 300, shopType: "SKIN" },
    { id: "skin_meteor", label: "rock_meteor", description: "Skin de alto impacto visual.", costCoins: 900, shopType: "SKIN" },
    { id: "skin_guerona_buchona", label: "rock_guerona_buchona", description: "Brilla tanto que exige lentes oscuros.", costCoins: 1_600, shopType: "SKIN" },
    { id: "bg_cantera_1", label: "bg_cantera_1", description: "Cantera clasica para un estilo mineral premium.", costCoins: 650, shopType: "BACKGROUND" },
    { id: "bg_volcano", label: "bg_volcano", description: "Calor ambiental y drama tectonico.", costCoins: 700, shopType: "BACKGROUND" },
    { id: "bg_aurora", label: "bg_aurora", description: "Neon celestial para taps de exhibicion.", costCoins: 950, shopType: "BACKGROUND" },
    { id: "bg_arcade", label: "bg_arcade", description: "Atmosfera arcade para romper records.", costCoins: 1_250, shopType: "BACKGROUND" },
    { id: "bg_desert", label: "bg_desert", description: "Arena premium con mucha personalidad.", costCoins: 1_500, shopType: "BACKGROUND" }
  ];

  readonly achievements = ACHIEVEMENT_DEFINITIONS;

  tap(state: GameState): GameState {
    return this.tapWithResult(state).state;
  }

  tapWithResult(state: GameState): TapResult {
    const now = this.now();
    let nextState = this.expireActiveBoosterIfNeeded(state, now);
    let gain = this.getCurrentTapMultiplier(nextState);
    let feedback: TapFeedback = {
      amount: gain,
      color: nextState.activeBoosterId ? "#fde047" : "#22c55e",
      durationMs: 900
    };

    if (nextState.selectedBoosterId && !nextState.activeBoosterId) {
      const selectedDefinition = this.getBoosterDefinition(nextState.selectedBoosterId);
      if (selectedDefinition && nextState.ownedBoosters[selectedDefinition.id] > 0) {
        if (selectedDefinition.instantTaps) {
          const currentCount = nextState.ownedBoosters[selectedDefinition.id] ?? 0;
          const nextCount = Math.max(0, currentCount - 1);
          nextState = {
            ...nextState,
            selectedBoosterId: nextCount > 0 ? selectedDefinition.id : null,
            ownedBoosters: {
              ...nextState.ownedBoosters,
              [selectedDefinition.id]: nextCount
            }
          };
          gain = selectedDefinition.instantTaps;
          feedback = { amount: selectedDefinition.instantTaps, color: "#ef4444", durationMs: 3000 };
        } else if (selectedDefinition.multiplier && selectedDefinition.durationMs) {
          nextState = this.consumeBooster(nextState, selectedDefinition.id);
          const until = now + selectedDefinition.durationMs;
          nextState = {
            ...nextState,
            activeBoosterId: selectedDefinition.id,
            activeBoosterUntilMs: until
          };
          gain = selectedDefinition.multiplier;
          feedback = { amount: gain, color: "#fde047", durationMs: 900 };
        }
      } else {
        nextState = { ...nextState, selectedBoosterId: null };
      }
    }

    if (!nextState.selectedBoosterId && nextState.activeBoosterId && !feedback.color.includes("ef4444")) {
      gain = this.getCurrentTapMultiplier(nextState);
      feedback = { amount: gain, color: "#fde047", durationMs: 900 };
    }

    nextState = this.applyProgress({ ...nextState, taps: nextState.taps + gain });

    return {
      state: nextState,
      feedback
    };
  }

  buyItem(state: GameState, itemId: string): GameState {
    return this.buyItemWithQuantity(state, itemId, 1).state;
  }

  buyItemWithQuantity(state: GameState, itemId: string, quantity: number = 1): PurchaseResult {
    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    if (safeQuantity <= 0) {
      return {
        state,
        success: false,
        reason: "INVALID_QUANTITY",
        quantityRequested: safeQuantity,
        quantityPurchased: 0,
        totalCost: 0
      };
    }

    const item = this.shopItems.find((candidate) => candidate.id === itemId);
    if (!item) {
      return {
        state,
        success: false,
        reason: "NOT_FOUND",
        quantityRequested: safeQuantity,
        quantityPurchased: 0,
        totalCost: 0
      };
    }

    if (item.shopType === "SKIN" && state.ownedSkins.has(item.label)) {
      return {
        state,
        success: false,
        reason: "ALREADY_OWNED",
        item,
        quantityRequested: safeQuantity,
        quantityPurchased: 0,
        totalCost: 0
      };
    }

    if (item.shopType === "BACKGROUND" && state.ownedBackgrounds.has(item.label)) {
      return {
        state,
        success: false,
        reason: "ALREADY_OWNED",
        item,
        quantityRequested: safeQuantity,
        quantityPurchased: 0,
        totalCost: 0
      };
    }

    const quantityToBuy = item.shopType === "BOOSTER" ? safeQuantity : 1;
    const totalCost = item.costCoins * quantityToBuy;
    if (state.coins < totalCost) {
      return {
        state,
        success: false,
        reason: "INSUFFICIENT_COINS",
        item,
        quantityRequested: safeQuantity,
        quantityPurchased: 0,
        totalCost
      };
    }

    let nextState: GameState = { ...state, coins: state.coins - totalCost };

    if (item.shopType === "BOOSTER") {
      if (!item.boosterType) {
        return {
          state,
          success: false,
          reason: "NOT_FOUND",
          item,
          quantityRequested: safeQuantity,
          quantityPurchased: 0,
          totalCost: 0
        };
      }

      const count = nextState.ownedBoosters[item.boosterType] ?? 0;
      nextState = {
        ...nextState,
        ownedBoosters: {
          ...nextState.ownedBoosters,
          [item.boosterType]: count + quantityToBuy
        }
      };
      return {
        state: this.applyProgress(nextState),
        success: true,
        item,
        quantityRequested: safeQuantity,
        quantityPurchased: quantityToBuy,
        totalCost
      };
    }

    if (item.shopType === "SKIN") {
      nextState = {
        ...nextState,
        ownedSkins: new Set([...nextState.ownedSkins, item.label]),
        equippedSkin: item.label
      };
      return {
        state: this.applyProgress(nextState),
        success: true,
        item,
        quantityRequested: safeQuantity,
        quantityPurchased: 1,
        totalCost
      };
    }

    nextState = {
      ...nextState,
      ownedBackgrounds: new Set([...nextState.ownedBackgrounds, item.label]),
      equippedBackground: item.label
    };
    return {
      state: this.applyProgress(nextState),
      success: true,
      item,
      quantityRequested: safeQuantity,
      quantityPurchased: 1,
      totalCost
    };
  }

  equipItem(state: GameState, type: InventoryType, label: string): GameState {
    if (type === "SKIN") {
      if (!state.ownedSkins.has(label)) {
        return state;
      }

      return { ...state, equippedSkin: label };
    }

    if (!state.ownedBackgrounds.has(label)) {
      return state;
    }

    return { ...state, equippedBackground: label };
  }

  selectBooster(state: GameState, boosterId: BoosterType): GameState {
    const normalizedState = this.expireActiveBoosterIfNeeded(state, this.now());
    if (normalizedState.activeBoosterId) {
      return normalizedState;
    }

    const count = normalizedState.ownedBoosters[boosterId] ?? 0;
    if (count <= 0) {
      return normalizedState;
    }

    return {
      ...normalizedState,
      selectedBoosterId: boosterId
    };
  }

  clearSelectedBooster(state: GameState): GameState {
    return {
      ...state,
      selectedBoosterId: null
    };
  }

  getBoosterStatusLabel(state: GameState): string {
    const now = this.now();
    const activeState = this.expireActiveBoosterIfNeeded(state, now);

    if (activeState.activeBoosterId) {
      const def = this.getBoosterDefinition(activeState.activeBoosterId);
      if (!def) {
        return "Booster activo";
      }

      if (def.instantTaps) {
        return `Booster activo: ${def.label}`;
      }

      const remainingMs = Math.max(0, activeState.activeBoosterUntilMs - now);
      const minutes = Math.floor(remainingMs / MINUTE_MS);
      const seconds = Math.floor((remainingMs % MINUTE_MS) / 1000);
      return `Activo: ${def.label} (${minutes}:${seconds.toString().padStart(2, "0")})`;
    }

    if (activeState.selectedBoosterId) {
      const def = this.getBoosterDefinition(activeState.selectedBoosterId);
      if (!def) {
        return "Pendiente: booster";
      }

      if (def.instantTaps) {
        const remaining = activeState.ownedBoosters[def.id] ?? 0;
        return `${def.label} · x${remaining}`;
      }

      return `Pendiente: ${def.label}`;
    }

    return "Sin booster";
  }

  getAchievementProgress(state: GameState): AchievementProgress[] {
    return this.achievements.map((achievement) => {
      const current = this.getAchievementCurrentValue(state, achievement);
      return {
        ...achievement,
        current: Math.min(current, achievement.target),
        achieved: state.achievements.has(achievement.id)
      };
    });
  }

  getSkinPreviewColor(label: string): number {
    return this.skins.find((item) => item.label === label)?.previewColor ?? 0x6b7280;
  }

  getBackgroundPreviewColor(label: string): number {
    return this.backgrounds.find((item) => item.label === label)?.previewColor ?? 0x111827;
  }

  getBoosterDefinition(id: BoosterType): BoosterDefinition | undefined {
    return this.boosters.find((entry) => entry.id === id);
  }

  private consumeBooster(state: GameState, boosterId: BoosterType): GameState {
    const nextCount = Math.max(0, (state.ownedBoosters[boosterId] ?? 0) - 1);
    return {
      ...state,
      selectedBoosterId: null,
      ownedBoosters: {
        ...state.ownedBoosters,
        [boosterId]: nextCount
      }
    };
  }

  private getCurrentTapMultiplier(state: GameState): number {
    if (!state.activeBoosterId) {
      return 1;
    }

    const definition = this.getBoosterDefinition(state.activeBoosterId);
    if (!definition || !definition.multiplier) {
      return 1;
    }

    return definition.multiplier;
  }

  private expireActiveBoosterIfNeeded(state: GameState, now: number): GameState {
    if (!state.activeBoosterId) {
      return state;
    }

    const definition = this.getBoosterDefinition(state.activeBoosterId);
    if (!definition || !definition.durationMs) {
      return { ...state, activeBoosterId: null, activeBoosterUntilMs: 0 };
    }

    if (state.activeBoosterUntilMs > now) {
      return state;
    }

    return {
      ...state,
      activeBoosterId: null,
      activeBoosterUntilMs: 0
    };
  }

  private applyProgress(state: GameState): GameState {
    const newLevelIndex = this.levels.reduce((acc, level, index) => (state.taps >= level.tapsRequired ? index : acc), 0);
    const mergedAchievements = new Set(
      this.getAchievementProgress({ ...state, levelIndex: newLevelIndex })
        .filter((item) => item.current >= item.target)
        .map((item) => item.id)
    );

    let reward = 0;
    if (newLevelIndex > state.levelIndex) {
      for (let index = state.levelIndex + 1; index <= newLevelIndex; index += 1) {
        reward += this.levels[index].rewardCoins;
      }
    }

    return {
      ...state,
      levelIndex: newLevelIndex,
      coins: state.coins + reward,
      achievements: mergedAchievements
    };
  }

  private getAchievementCurrentValue(state: GameState, achievement: AchievementDefinition): number {
    if (achievement.kind === "TAPS") {
      return state.taps;
    }

    if (achievement.kind === "LEVEL") {
      return this.levels[state.levelIndex].level;
    }

    return state.ownedSkins.size + state.ownedBackgrounds.size - 2;
  }
}
