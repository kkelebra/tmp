# Design Document: Funcionalidad Principal del Proyecto Electron y Extensión para Escuchar Subtítulos Capturados

## Resumen
Este documento describe la funcionalidad principal del proyecto Electron existente en este repositorio y cómo se puede extender para integrar la funcionalidad de escuchar subtítulos capturados desde un navegador externo. La extensión permitirá que la aplicación Electron reciba subtítulos en tiempo real, los procese y los muestre en su interfaz gráfica.

---

## Contexto
El proyecto actual es una aplicación desarrollada en **Electron** que utiliza `src/main.tsx` como punto de entrada principal y `index.html` como base para la interfaz gráfica. La aplicación está diseñada para interactuar con el usuario a través de una interfaz React y puede ser extendida para recibir subtítulos capturados desde un navegador externo mediante WebSocket. Esta funcionalidad permitirá que la aplicación procese subtítulos en tiempo real y los utilice para generar sugerencias o análisis adicionales.

---

## Objetivos
1. Documentar las tecnologías utilizadas en el proyecto Electron principal.
2. Diseñar una extensión para integrar la funcionalidad de recepción de subtítulos capturados.
3. Asegurar que la integración sea escalable, eficiente y fácil de mantener.
4. Proveer una interfaz clara para visualizar los subtítulos recibidos.

---

## Tecnologías Utilizadas en el Proyecto Electron Principal

### 1. **Electron**
- **Uso**: Framework principal para construir la aplicación de escritorio.
- **Funcionalidad**:
  - Proceso principal (`electron/main.ts`): Maneja la lógica de backend, como la inicialización de ventanas y la comunicación entre procesos.
  - Proceso de renderizado (`src/main.tsx`): Maneja la interfaz gráfica y la interacción con el usuario.

### 2. **React**
- **Uso**: Framework para construir la interfaz gráfica.
- **Funcionalidad**:
  - Componentes React en `src/_pages` y `src/components` para manejar vistas como "Queue" y "Solutions".

### 3. **Node.js**
- **Uso**: Para manejar lógica del backend y dependencias del proyecto.
- **Dependencias**:
  - `ws`: Para manejar la comunicación WebSocket.
  - `electron`: Para construir y ejecutar la aplicación.

### 4. **IPC (Inter-Process Communication)**
- **Uso**: Para la comunicación entre el proceso principal y el proceso de renderizado.

### 5. **Vite**
- **Uso**: Herramienta de construcción para empaquetar y servir la aplicación.

---

## Extensión para Escuchar Subtítulos Capturados

### 1. **Arquitectura Propuesta**
La funcionalidad de escuchar subtítulos capturados se integrará mediante un servidor WebSocket en el proceso principal de Electron. Los subtítulos serán enviados desde un navegador externo y procesados en tiempo real.

#### Diagrama de Arquitectura
```
[Navegador Externo (Google Meet / Microsoft Teams)]
        |
        v
[Script Inyectado] --> [WebSocket Server (Electron Main Process)]
        |
        v
[IPC] <--> [Render Process (React UI)]
```

---

### 2. **Plan de Implementación**

#### **2.1. Configuración del Servidor WebSocket**
- Crear un servidor WebSocket en el proceso principal de Electron para recibir subtítulos.
- Integrar el servidor en el archivo principal del proyecto (`electron/main.ts`).

##### Código de Ejemplo:
```typescript
// filepath: /electron/websocket-server.ts
import { WebSocketServer } from "ws";

export function createWebSocketServer(mainWindow: Electron.BrowserWindow) {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    console.log("Cliente conectado al servidor WebSocket");

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      console.log("Subtítulo recibido:", data.subtitle);

      // Enviar subtítulos al proceso de renderizado
      mainWindow.webContents.send("subtitle-received", data.subtitle);
    });

    ws.on("close", () => {
      console.log("Cliente desconectado del servidor WebSocket");
    });
  });
}
```

---

#### **2.2. Integración con el Proceso Principal**
- Modificar el archivo principal (`electron/main.ts`) para inicializar el servidor WebSocket al arrancar la aplicación.

##### Código de Ejemplo:
```typescript
// filepath: main.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { createWebSocketServer } from "./websocket-server";

let mainWindow: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Inicializar el servidor WebSocket
  if (mainWindow) {
    createWebSocketServer(mainWindow);
  }
});
```

---

#### **2.3. Recepción y Visualización en el Proceso de Renderizado**
- Usar el módulo `ipcRenderer` en el proceso de renderizado para recibir los subtítulos enviados desde el proceso principal.
- Mostrar los subtítulos en la interfaz React existente.

##### Código de Ejemplo:
```tsx
// filepath: Queue.tsx
import React, { useEffect, useState } from "react";

const Queue: React.FC = () => {
  const [subtitles, setSubtitles] = useState<string[]>([]);

  useEffect(() => {
    const handleSubtitleReceived = (_event: any, subtitle: string) => {
      setSubtitles((prev) => [...prev, subtitle]);
    };

    window.electronAPI.on("subtitle-received", handleSubtitleReceived);

    return () => {
      window.electronAPI.removeListener("subtitle-received", handleSubtitleReceived);
    };
  }, []);

  return (
    <div>
      <h1>Subtítulos Capturados</h1>
      <div>
        {subtitles.map((subtitle, index) => (
          <p key={index}>{subtitle}</p>
        ))}
      </div>
    </div>
  );
};

export default Queue;
```

---

#### **2.4. Modificación del `index.html`**
- Asegurarse de que el archivo `index.html` cargue correctamente el punto de entrada de React (`src/main.tsx`).

##### Ejemplo de `index.html`:
```html
<!-- filepath: index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Electron App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 3. **Criterios de Éxito**
1. **Recepción de Subtítulos**:
   - Los subtítulos deben recibirse correctamente desde el navegador externo y mostrarse en la consola del proceso principal.

2. **Visualización en la Interfaz**:
   - Los subtítulos deben mostrarse en tiempo real en la interfaz React de la aplicación.

3. **Baja Latencia**:
   - La latencia entre la captura de subtítulos y su visualización debe ser menor a 500 ms.

4. **Escalabilidad**:
   - La solución debe ser capaz de manejar múltiples subtítulos en tiempo real sin afectar el rendimiento de la aplicación.

---

## Impacto
Esta extensión permitirá que la aplicación Electron reciba subtítulos capturados desde un navegador externo, los procese y los muestre en tiempo real. Esto mejora la funcionalidad del proyecto y abre la puerta a futuras expansiones, como análisis de subtítulos o generación de sugerencias basadas en IA.
```