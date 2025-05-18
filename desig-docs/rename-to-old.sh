#!/bin/bash

# filepath: /mnt/D/repos/tmp/desig-docs/rename_to_old.sh

# Directorio donde se encuentran los archivos
TARGET_DIR="/mnt/D/repos/tmp/desig-docs"

# Cambiar a la carpeta objetivo
cd "$TARGET_DIR" || { echo "Directorio no encontrado: $TARGET_DIR"; exit 1; }

# Renombrar todos los archivos en la carpeta
for file in *; do
  # Verificar que sea un archivo regular
  if [ -f "$file" ]; then
    mv "$file" "old_$file"
    echo "Renombrado: $file -> old_$file"
  fi
done

echo "Renombrado completado."