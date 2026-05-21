package com.rockvolution.core

private const val TEMP_X5_DURATION_MS = 10 * 60 * 1000L

data class RockLevel(
    val level: Int,
    val name: String,
    val tapsRequired: Long,
    val rewardCoins: Int
)

enum class BoosterType { TAP_X2, DYNAMITE_X100, TAP_X5_10_MIN }

enum class ShopType { BOOSTER, SKIN, BACKGROUND, SOUND }

data class ShopItem(
    val id: String,
    val label: String,
    val costCoins: Int,
    val shopType: ShopType,
    val boosterType: BoosterType? = null
)

data class GameState(
    val taps: Long = 0,
    val coins: Int = 0,
    val levelIndex: Int = 0,
    val permanentMultiplier: Int = 1,
    val tempX5UntilMs: Long = 0,
    val equippedSkin: String = "Default",
    val equippedBackground: String = "Cantera",
    val equippedSound: String = "Tap",
    val ownedSkins: Set<String> = setOf("Default"),
    val ownedBackgrounds: Set<String> = setOf("Cantera"),
    val ownedSounds: Set<String> = setOf("Tap"),
    val achievements: Set<String> = emptySet()
)

class GameEngine(private val now: () -> Long = { System.currentTimeMillis() }) {
    val levels = listOf(
        RockLevel(1, "Roca común", 0, 0),
        RockLevel(2, "Roca con carbón", 1_000, 50),
        RockLevel(3, "Roca con hierro", 10_000, 250),
        RockLevel(4, "Roca con cobre", 25_000, 600),
        RockLevel(5, "Roca con oro", 50_000, 1_500),
        RockLevel(6, "Roca con diamante", 100_000, 5_000)
    )

    val shopItems = listOf(
        ShopItem("booster_x2", "Tap x2 permanente", 150, ShopType.BOOSTER, BoosterType.TAP_X2),
        ShopItem("booster_dyn", "Dinamita +100 taps", 200, ShopType.BOOSTER, BoosterType.DYNAMITE_X100),
        ShopItem("booster_x5", "Tap x5 por 10 min", 500, ShopType.BOOSTER, BoosterType.TAP_X5_10_MIN),
        ShopItem("skin_obsidian", "Skin Obsidiana", 300, ShopType.SKIN),
        ShopItem("skin_meteor", "Skin Meteorito", 900, ShopType.SKIN),
        ShopItem("bg_volcano", "Fondo Volcán", 700, ShopType.BACKGROUND),
        ShopItem("sound_metal", "Sonido metálico raro", 250, ShopType.SOUND)
    )

    fun tap(state: GameState): GameState {
        val multiplier = if (state.tempX5UntilMs > now()) 5 else 1
        val addedTaps = state.permanentMultiplier * multiplier
        return applyProgress(state.copy(taps = state.taps + addedTaps.toLong()))
    }

    fun buyItem(state: GameState, itemId: String): GameState {
        val item = shopItems.firstOrNull { it.id == itemId } ?: return state
        if (state.coins < item.costCoins) return state

        val paid = state.copy(coins = state.coins - item.costCoins)
        return when (item.shopType) {
            ShopType.BOOSTER -> applyBooster(paid, item.boosterType ?: return state)
            ShopType.SKIN -> paid.copy(ownedSkins = paid.ownedSkins + item.label, equippedSkin = item.label)
            ShopType.BACKGROUND -> paid.copy(
                ownedBackgrounds = paid.ownedBackgrounds + item.label,
                equippedBackground = item.label
            )

            ShopType.SOUND -> paid.copy(ownedSounds = paid.ownedSounds + item.label, equippedSound = item.label)
        }
    }

    fun equipSkin(state: GameState, skin: String): GameState =
        if (skin in state.ownedSkins) state.copy(equippedSkin = skin) else state

    fun equipBackground(state: GameState, background: String): GameState =
        if (background in state.ownedBackgrounds) state.copy(equippedBackground = background) else state

    fun equipSound(state: GameState, sound: String): GameState =
        if (sound in state.ownedSounds) state.copy(equippedSound = sound) else state

    private fun applyBooster(state: GameState, boosterType: BoosterType): GameState = when (boosterType) {
        BoosterType.TAP_X2 -> state.copy(permanentMultiplier = state.permanentMultiplier * 2)
        BoosterType.DYNAMITE_X100 -> applyProgress(state.copy(taps = state.taps + 100))
        BoosterType.TAP_X5_10_MIN -> state.copy(tempX5UntilMs = maxOf(state.tempX5UntilMs, now() + TEMP_X5_DURATION_MS))
    }

    private fun applyProgress(state: GameState): GameState {
        val newLevelIndex = levels.indexOfLast { state.taps >= it.tapsRequired }.coerceAtLeast(0)
        if (newLevelIndex <= state.levelIndex) {
            return state.copy(achievements = state.achievements + computeAchievements(state.taps, state.levelIndex))
        }

        var reward = 0
        for (index in (state.levelIndex + 1)..newLevelIndex) {
            reward += levels[index].rewardCoins
        }

        return state.copy(
            levelIndex = newLevelIndex,
            coins = state.coins + reward,
            achievements = state.achievements + computeAchievements(state.taps, newLevelIndex)
        )
    }

    private fun computeAchievements(taps: Long, levelIndex: Int): Set<String> {
        val out = mutableSetOf<String>()
        if (levelIndex >= 1) out += "Nivel 2: tu roca ahora parece útil"
        if (levelIndex >= 2) out += "Nivel 3: la roca ya paga impuestos"
        if (levelIndex >= 3) out += "Nivel 4: desbloqueaste fuerza geológica"
        if (levelIndex >= 4) out += "Nivel 5: tu roca ya revienta ventanas"
        if (levelIndex >= 5) out += "Nivel 6: tu roca es leyenda mineral"
        if (taps >= 10_000) out += "10k taps: dedos de titanio"
        if (taps >= 100_000) out += "100k taps: tocar rocas es tu destino"
        return out
    }
}
