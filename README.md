# Rockvolution

Juego incremental para Android donde una roca evoluciona al hacer taps.

## Funcionalidades implementadas

- Evolución por taps con niveles predefinidos:
  - Nivel 1: Roca común (0 taps)
  - Nivel 2: Roca con carbón (1,000 taps)
  - Nivel 3: Roca con hierro (10,000 taps)
  - Nivel 4: Roca con cobre (25,000 taps)
  - Nivel 5: Roca con oro (50,000 taps)
  - Nivel 6: Roca con diamante (100,000 taps)
- Contador de taps y monedas.
- Boosters en tienda:
  - Tap x2 permanente
  - Dinamita +100 taps instantáneo
  - Tap x5 durante 10 minutos
- Tienda para comprar:
  - Boosters
  - Skins de roca
  - Backgrounds especiales
  - Sonido raro para taps
- Logros ridículos por progreso.
- Animación simple de zoom in/out sobre la roca al tap.
- Integración de inicio de sesión con Google Play Games (v2) al arrancar la app.

## Estructura del repositorio

- `/home/runner/work/rockvolution/rockvolution/app`: App Android (Jetpack Compose).
- `/home/runner/work/rockvolution/rockvolution/gamecore`: Lógica principal del juego + pruebas unitarias.

## Ejecutar pruebas de lógica

```bash
cd /home/runner/work/rockvolution/rockvolution/gamecore
gradle test
```

## Captura de UI

La captura de referencia de la interfaz está en:

`/home/runner/work/rockvolution/rockvolution/ui-screenshot.png`
