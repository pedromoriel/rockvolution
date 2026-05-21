package com.rockvolution

import android.media.ToneGenerator
import android.media.AudioManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.rockvolution.core.GameEngine
import com.rockvolution.core.GameState
import com.rockvolution.core.ShopItem

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        PlayGamesSdk.initialize(this)
        PlayGames.getGamesSignInClient(this).isAuthenticated.addOnCompleteListener { authTask ->
            if (!authTask.isSuccessful || !authTask.result.isAuthenticated) {
                PlayGames.getGamesSignInClient(this).signIn()
            }
        }

        setContent {
            MaterialTheme {
                RockvolutionApp()
            }
        }
    }
}

class GameViewModel : ViewModel() {
    private val engine = GameEngine()
    private val toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 80)

    var state by mutableStateOf(GameState())
        private set

    fun onTap() {
        state = engine.tap(state)
        val tone = if (state.equippedSound == "Sonido metálico raro") {
            ToneGenerator.TONE_PROP_BEEP2
        } else {
            ToneGenerator.TONE_PROP_BEEP
        }
        toneGenerator.startTone(tone, 40)
    }

    fun buy(item: ShopItem) {
        state = engine.buyItem(state, item.id)
    }

    fun levels() = engine.levels
    fun shopItems() = engine.shopItems
}

@Composable
private fun RockvolutionApp(vm: GameViewModel = viewModel()) {
    val state = vm.state
    val level = vm.levels()[state.levelIndex]
    var pulse by remember { mutableIntStateOf(0) }
    val scale by animateFloatAsState(
        targetValue = if (pulse % 2 == 0) 1f else 1.12f,
        animationSpec = spring(dampingRatio = 0.35f),
        label = "rockScale"
    )

    val background = when (state.equippedBackground) {
        "Fondo Volcán" -> listOf(Color(0xFF2A0A00), Color(0xFF7A1C00), Color(0xFFD94B00))
        else -> listOf(Color(0xFF121212), Color(0xFF1F2937), Color(0xFF334155))
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(background))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Rockvolution", style = MaterialTheme.typography.headlineMedium, color = Color.White)
        Text("Google Play Games: inicio de sesión automático activado", color = Color.White)

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Nivel ${level.level}: ${level.name}", fontWeight = FontWeight.Bold)
                Text("Taps: ${state.taps}")
                Text("Monedas: ${state.coins}")
                Text("Skin: ${state.equippedSkin} | Fondo: ${state.equippedBackground}")
            }
        }

        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Box(
                modifier = Modifier
                    .size(180.dp)
                    .scale(scale)
                    .background(rockColor(level.level, state.equippedSkin), CircleShape)
                    .clickable {
                        pulse++
                        vm.onTap()
                    },
                contentAlignment = Alignment.Center
            ) {
                Text("TAP", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }

        Text("Logros ridículos", color = Color.White, fontWeight = FontWeight.Bold)
        LazyColumn(modifier = Modifier.height(120.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            items(state.achievements.toList()) { achievement ->
                Text("• $achievement", color = Color.White)
            }
        }

        Text("Tienda", color = Color.White, fontWeight = FontWeight.Bold)
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(vm.shopItems()) { item ->
                ShopRow(item = item, canBuy = state.coins >= item.costCoins) {
                    vm.buy(item)
                }
            }
        }
    }
}

@Composable
private fun ShopRow(item: ShopItem, canBuy: Boolean, onBuy: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x30FFFFFF), MaterialTheme.shapes.medium)
            .padding(8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(item.label, color = Color.White)
            Text("${item.costCoins} monedas", color = Color(0xFFE2E8F0))
        }
        Button(onClick = onBuy, enabled = canBuy) {
            Text("Comprar")
        }
    }
}

private fun rockColor(level: Int, skin: String): Color {
    if (skin == "Skin Meteorito") return Color(0xFF312E81)
    if (skin == "Skin Obsidiana") return Color(0xFF1F2937)

    return when (level) {
        1 -> Color(0xFF6B7280)
        2 -> Color(0xFF1F2937)
        3 -> Color(0xFF92400E)
        4 -> Color(0xFFB45309)
        5 -> Color(0xFFF59E0B)
        else -> Color(0xFF60A5FA)
    }
}
