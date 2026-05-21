# Rockvolution

Rockvolution es ahora un juego 100% web con Phaser + TypeScript, empaquetado en Android con Capacitor.

## Stack actual

- Phaser 3 para render y loop del juego.
- Vite para desarrollo y build.
- TypeScript para toda la logica.
- Vitest para pruebas unitarias del motor.
- Capacitor para ejecutar el build web como app Android nativa.

## Como ejecutar

Requisito: Node.js 22 o superior (Capacitor CLI 8 lo requiere).

```bash
npm install
npm run dev
```

## Android (Capacitor)

```bash
npm run android:add
npm run android:sync
npm run android:open
```

Flujo recomendado para Android:

1. Ejecuta `npm run android:sync` para regenerar `dist` y copiar assets web a la app nativa.
2. Abre Android Studio con `npm run android:open`.
3. Ejecuta la app en emulador o dispositivo fisico desde Android Studio.

### Build Android local (Java 17)

Si tu build falla por versión de Java, ejecuta esto antes de compilar:

```bash
source ./set-java17.sh
cd android
./gradlew assembleDebug
```

El script detecta Java 17 en sdkman, update-alternatives o rutas comunes y exporta JAVA_HOME y PATH solo para esa terminal.

### Nota sobre Java 17 y Capacitor
> **¡Importante!** Algunos archivos `build.gradle` generados por Capacitor o sus dependencias pueden forzar `VERSION_21` aunque tu entorno use Java 17. El script `npm run fix-capacitor-java` corrige automáticamente todos los archivos relevantes (incluyendo `node_modules/@capacitor/android/capacitor/build.gradle`) tras cada sync/build, tanto en local como en CI. Si ves errores de "invalid source release: 21", ejecuta:
>
> ```bash
> npm run fix-capacitor-java
> ```
>
> Y luego recompila.

## CI Android (GitHub Actions)

Se agrego el workflow [android-ci.yml](.github/workflows/android-ci.yml), que en cada push/PR a development o master:

1. Instala dependencias Node.
2. Hace build web y sync de Capacitor.
3. Compila APK debug con Gradle.
4. Publica el artefacto rockvolution-debug-apk para descargar.

## Scripts

```bash
npm run build
npm run preview
npm run test
npm run cap:sync
```

## Estructura principal

- `src/game/GameEngine.ts`: motor incremental (niveles, boosters, compras, logros).
- `src/scenes/MainScene.ts`: escena jugable principal en Phaser.
- `tests/GameEngine.test.ts`: pruebas del motor.
- `android/`: proyecto Android generado por Capacitor.
- `capacitor.config.ts`: configuracion nativa y webDir.

## Notas

- El legado Android/Kotlin/Gradle fue eliminado para dejar una sola base de codigo web.
