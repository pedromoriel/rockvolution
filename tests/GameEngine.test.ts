import { describe, expect, it } from "vitest";
import { GameEngine, createInitialGameState } from "../src/game/GameEngine";

describe("GameEngine", () => {
  it("evolves rock at predefined tap thresholds", () => {
    const engine = new GameEngine(() => 1_000);
    let state = createInitialGameState();

    for (let index = 0; index < 1_000; index += 1) {
      state = engine.tap(state);
    }

    expect(state.levelIndex).toBe(1);
    expect(engine.levels[state.levelIndex].name).toBe("Roca con carbon");
    expect(state.coins).toBeGreaterThanOrEqual(50);
  });

  it("dynamite booster grants immediate taps and progression", () => {
    const engine = new GameEngine(() => 1_000);
    let state = { ...createInitialGameState(), coins: 500 };
    state = engine.buyItem(state, "booster_dyn_500");
    state = engine.selectBooster(state, "DYNAMITE_500");
    const result = engine.tapWithResult(state);

    expect(result.state.taps).toBe(500);
    expect(result.feedback.amount).toBe(500);
    expect(result.feedback.durationMs).toBe(3000);
    expect(result.state.coins).toBe(140);
  });

  it("keeps instant booster selected until all charges are consumed", () => {
    const engine = new GameEngine(() => 1_000);
    let state = { ...createInitialGameState(), coins: 2_000 };

    state = engine.buyItemWithQuantity(state, "booster_dyn_500", 3).state;
    state = engine.selectBooster(state, "DYNAMITE_500");

    let result = engine.tapWithResult(state);
    expect(result.state.taps).toBe(500);
    expect(result.state.ownedBoosters.DYNAMITE_500).toBe(2);
    expect(result.state.selectedBoosterId).toBe("DYNAMITE_500");

    result = engine.tapWithResult(result.state);
    expect(result.state.taps).toBe(1000);
    expect(result.state.ownedBoosters.DYNAMITE_500).toBe(1);
    expect(result.state.selectedBoosterId).toBe("DYNAMITE_500");

    result = engine.tapWithResult(result.state);
    expect(result.state.taps).toBe(1500);
    expect(result.state.ownedBoosters.DYNAMITE_500).toBe(0);
    expect(result.state.selectedBoosterId).toBe(null);
  });

  it("temporary x2 booster activates on first tap after selection", () => {
    let now = 1_000;
    const engine = new GameEngine(() => now);
    let state = { ...createInitialGameState(), coins: 1_000 };

    state = engine.buyItem(state, "booster_x2_5m");
    state = engine.selectBooster(state, "TAP_X2_5M");
    state = engine.tap(state);
    expect(state.taps).toBe(2);

    now += 6 * 60 * 1000;
    state = engine.tap(state);
    expect(state.taps).toBe(3);
  });

  it("starts with testing coins and can equip purchased skins", () => {
    const engine = new GameEngine(() => 1_000);
    let state = createInitialGameState();

    expect(state.coins).toBe(20_000);

    state = engine.buyItem(state, "skin_obsidian");
    expect(state.ownedSkins.has("rock_obsidian")).toBe(true);
    expect(state.equippedSkin).toBe("rock_obsidian");

    state = engine.equipItem(state, "SKIN", "rock_1");
    expect(state.equippedSkin).toBe("rock_1");
  });
});