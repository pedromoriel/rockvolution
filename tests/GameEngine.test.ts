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
    const initial = { ...createInitialGameState(), coins: 500 };
    const state = engine.buyItem(initial, "booster_dyn");

    expect(state.taps).toBe(100);
    expect(state.coins).toBe(300);
  });

  it("temporary x5 booster increases tap gain during active window", () => {
    let now = 1_000;
    const engine = new GameEngine(() => now);
    let state = { ...createInitialGameState(), coins: 1_000 };

    state = engine.buyItem(state, "booster_x5");
    state = engine.tap(state);
    expect(state.taps).toBe(5);

    now += 11 * 60 * 1000;
    state = engine.tap(state);
    expect(state.taps).toBe(6);
  });
});