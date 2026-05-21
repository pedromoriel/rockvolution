#!/bin/bash
# Script para exportar JAVA_HOME y PATH a Java 17 temporalmente en la terminal actual
# Uso: source ./set-java17.sh


set_java17() {
  # 1. sdkman
  if [ -d "$HOME/.sdkman/candidates/java" ]; then
    JAVA17=$(find "$HOME/.sdkman/candidates/java" -maxdepth 1 -type d -name "17*" | head -n1)
    if [ -n "$JAVA17" ]; then
      export JAVA_HOME="$JAVA17"
      export PATH="$JAVA_HOME/bin:$PATH"
      echo "JAVA_HOME set to $JAVA_HOME (sdkman)"
      java -version
      return 0
    fi
  fi
  # 2. update-alternatives
  JAVA17=$(update-alternatives --list java 2>/dev/null | grep "/java-17" | head -n1 | sed 's:/bin/java::')
  if [ -n "$JAVA17" ]; then
    export JAVA_HOME="$JAVA17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "JAVA_HOME set to $JAVA_HOME (update-alternatives)"
    java -version
    return 0
  fi
  # 3. rutas comunes Linux
  for d in /usr/lib/jvm/java-17* /usr/lib/jvm/adoptopenjdk-17* /usr/lib/jvm/temurin-17*; do
    if [ -d "$d" ]; then
      export JAVA_HOME="$d"
      export PATH="$JAVA_HOME/bin:$PATH"
      echo "JAVA_HOME set to $JAVA_HOME (ruta común Linux)"
      java -version
      return 0
    fi
  done
  # 4. Homebrew Mac Intel
  if [ -d "/usr/local/opt/openjdk@17" ]; then
    export JAVA_HOME="/usr/local/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "JAVA_HOME set to $JAVA_HOME (Homebrew Intel Mac)"
    java -version
    return 0
  fi
  # 5. Homebrew Mac ARM (Apple Silicon)
  if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "JAVA_HOME set to $JAVA_HOME (Homebrew ARM Mac)"
    java -version
    return 0
  fi
  echo "No se encontró Java 17. Instálalo con sdkman, apt, brew o tu gestor preferido."
  return 1
}

set_java17
