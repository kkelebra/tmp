#!/bin/bash

# filepath: /mnt/D/repos/tmp/install.sh

# Instalador para configurar el proyecto con Whisper y ejecutar `npm run dev`

echo "=== Instalador para el Proyecto ==="

# Actualizar el sistema
echo "Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias del sistema
echo "Instalando dependencias del sistema..."
sudo apt install -y python3 python3-pip python3-venv ffmpeg nodejs npm git build-essential

# Verificar versiones
echo "Verificando versiones instaladas..."
echo "Python: $(python3 --version)"
echo "pip: $(pip3 --version)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "FFmpeg: $(ffmpeg -version | head -n 1)"

# Crear un entorno virtual de Python
echo "Creando un entorno virtual de Python..."
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# Activar el entorno virtual
echo "Activando el entorno virtual..."
source venv/bin/activate

# Actualizar pip dentro del entorno virtual
echo "Actualizando pip..."
pip install --upgrade pip

# Instalar PyTorch
echo "Instalando PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Instalar Whisper
echo "Instalando Whisper..."
pip install git+https://github.com/openai/whisper.git

# Instalar dependencias de Node.js
echo "Instalando dependencias de Node.js..."
if [ ! -d "node_modules" ]; then
  npm install
fi

# Desactivar el entorno virtual al finalizar
deactivate