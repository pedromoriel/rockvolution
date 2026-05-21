package com.rockvolution.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GameEngineTest {
    @Test
    fun `evolves rock at predefined tap thresholds`() {
        val engine = GameEngine { 1_000L }
        var state = GameState()

        repeat(1_000) {
            state = engine.tap(state)
        }

        assertEquals(1, state.levelIndex)
        assertEquals("Roca con carbón", engine.levels[state.levelIndex].name)
        assertTrue(state.coins >= 50)
    }

    @Test
    fun `dynamite booster grants immediate taps and progression`() {
        val engine = GameEngine { 1_000L }
        var state = GameState(coins = 500)

        state = engine.buyItem(state, "booster_dyn")

        assertEquals(100, state.taps)
        assertEquals(300, state.coins)
    }

    @Test
    fun `temporary x5 booster increases tap gain during active window`() {
        var now = 1_000L
        val engine = GameEngine { now }
        var state = GameState(coins = 1_000)

        state = engine.buyItem(state, "booster_x5")
        state = engine.tap(state)
        assertEquals(5, state.taps)

        now += 11 * 60 * 1000L
        state = engine.tap(state)
        assertEquals(6, state.taps)
    }
}
