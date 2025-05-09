# Design Document: Captura de Subtítulos desde Otro Navegador Usando el DOM

## Resumen
Este documento describe cómo capturar subtítulos generados automáticamente en plataformas de videollamadas (como Google Meet o Microsoft Teams) desde un navegador externo, mientras el proyecto principal corre en una aplicación local basada en Electron. La solución se basa en interactuar con el DOM del navegador externo para extraer subtítulos en tiempo real y enviarlos a la aplicación Electron mediante WebSocket, integrándose con la estructura existente de la aplicación.

---

## Contexto
El proyecto actual, desarrollado en Electron, ya tiene una estructura funcional que escribe sobre el directorio `src`. Por lo tanto, la implementación de la recepción de subtítulos y su visualización debe integrarse en el flujo existente, respetando las convenciones y la arquitectura del proyecto.

---

## Objetivos
1. Capturar subtítulos generados automáticamente desde el DOM de un navegador externo.
2. Diseñar una solución que permita la comunicación entre la aplicación Electron y el navegador externo.
3. Integrar la recepción de subtítulos en el flujo existente de la aplicación Electron.
4. Minimizar la latencia en la captura y procesamiento de subtítulos.
5. Garantizar la privacidad y seguridad de los datos capturados.

---

## Requisitos

### Funcionales
- Detectar y capturar subtítulos en tiempo real desde el DOM del navegador externo.
- Procesar los subtítulos capturados para análisis y generación de sugerencias.
- Mostrar las sugerencias generadas en la interfaz de usuario de la aplicación Electron.

### No Funcionales
- Baja latencia en la captura y procesamiento de subtítulos.
- Resiliencia ante cambios en el DOM de las plataformas de videollamadas.
- Seguridad y privacidad en el manejo de los datos capturados.

---

## Propuesta de Diseño

### 1. Comunicación entre Electron y el Navegador Externo
Para interactuar con el DOM del navegador externo, se utilizará un enfoque basado en **WebSocket** para establecer una comunicación en tiempo real entre el navegador y la aplicación Electron.

#### **1.1. Configuración del Servidor WebSocket**
- Configurar un servidor WebSocket en el proceso principal de Electron para recibir subtítulos enviados desde el navegador.
- Integrar el servidor WebSocket en el flujo existente del proyecto, asegurando que se inicialice junto con la aplicación.

##### Código de Ejemplo:
```javascript
// filepath: /src/main/websocket-server.js
const { WebSocketServer } = require('ws');

function createWebSocketServer(mainWindow) {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('Cliente conectado al servidor WebSocket');

    ws.on('message', (message) => {
      const data = JSON.parse(message);
      console.log('Subtítulo recibido:', data.subtitle);

      // Enviar subtítulos al proceso de renderizado
      mainWindow.webContents.send('subtitle-received', data.subtitle);
    });

    ws.on('close', () => {
      console.log('Cliente desconectado del servidor WebSocket');
    });
  });

  return wss;
}

module.exports = createWebSocketServer;
```

---

### 2. Integración con el Proceso Principal de Electron
- Modificar el archivo principal de la aplicación (`src/main/main.js`) para inicializar el servidor WebSocket al arrancar la aplicación.
- Asegurarse de que el servidor WebSocket esté vinculado a la ventana principal de la aplicación.

##### Código de Ejemplo:
```javascript
// filepath: /src/main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const createWebSocketServer = require('./websocket-server');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  // Inicializar el servidor WebSocket
  createWebSocketServer(mainWindow);
});
```

---

### 3. Recepción y Visualización en el Proceso de Renderizado
- Usar el módulo `ipcRenderer` en el proceso de renderizado para recibir los subtítulos enviados desde el proceso principal.
- Integrar la visualización de subtítulos en la interfaz existente de la aplicación.

##### Código de Ejemplo:
```javascript
// filepath: /src/renderer/renderer.js
const { ipcRenderer } = require('electron');

// Escuchar subtítulos enviados desde el proceso principal
ipcRenderer.on('subtitle-received', (event, subtitle) => {
  console.log('Subtítulo recibido en el proceso de renderizado:', subtitle);

  // Mostrar el subtítulo en la interfaz existente
  const subtitleContainer = document.getElementById('subtitle-container');
  const subtitleElement = document.createElement('div');
  subtitleElement.textContent = subtitle;
  subtitleContainer.appendChild(subtitleElement);
});
```

##### Ejemplo de HTML:
```html
<!-- filepath: /src/renderer/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subtítulos Capturados</title>
  <style>
    #subtitle-container {
      font-family: Arial, sans-serif;
      font-size: 16px;
      color: #333;
      margin: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      max-height: 300px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <h1>Subtítulos Capturados</h1>
  <div id="subtitle-container"></div>
  <script src="./renderer.js"></script>
</body>
</html>
```

---

### 4. Procesamiento de Subtítulos
- Integrar el procesamiento de subtítulos con herramientas como **Open---

### 4. Procesamiento de Subtítulos
- Integrar el procesamiento de subtítulos con herramientas como **Open

Similar code found with 1 license type