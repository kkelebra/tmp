Aquí tienes una **propuesta concreta** para implementar el design doc de captura de subtítulos por OCR en tu aplicación Electron, considerando la estructura y los módulos de tu proyecto:

---

## **1. Estructura General y Flujo**

1. **El usuario define el área de subtítulos** (coordenadas y tamaño) mediante una interfaz en React (en src).
2. **Electron** (proceso principal) captura pantallas periódicamente usando `screenshot-desktop`.
3. La imagen se recorta al área definida usando `jimp`.
4. Se procesa el recorte con OCR (`tesseract.js`) para extraer el texto.
5. El texto extraído se envía al frontend o se almacena/procesa según la lógica de la app (por ejemplo, se muestra en la UI o se envía a la API REST).

---

## **2. Implementación por Capas**

### **A. Frontend React (src)**

- **Componente de selección de área**:  
  - Crea un componente (por ejemplo, `SubtitleAreaSelector.tsx`) que permita al usuario seleccionar visualmente el área de subtítulos (puede ser un overlay sobre una captura de pantalla).
  - Guarda las coordenadas seleccionadas en el store local o envíalas a Electron vía IPC.

- **Comunicación con Electron**:  
  - Usa la API expuesta en preload.ts para enviar/recibir las coordenadas del área y para iniciar/detener el ciclo de OCR.
  - Muestra el texto extraído en tiempo real en la UI (por ejemplo, en una tarjeta o panel).

### **B. Preload Script (preload.ts)**

- Expón métodos como:
  - `setSubtitleArea(area: {x: number, y: number, width: number, height: number})`
  - `startSubtitleOcr()`
  - `stopSubtitleOcr()`
  - `onSubtitleText(callback: (text: string) => void)`

### **C. Proceso Principal Electron (main.ts y helpers)**

- **Gestión de área de subtítulos**:
  - Almacena el área seleccionada en memoria o en la configuración persistente (ConfigHelper.ts o store.ts).

- **Ciclo de captura y OCR**:
  - Implementa un ciclo (setInterval o similar) que:
    1. Usa `screenshot-desktop` para capturar la pantalla.
    2. Usa `jimp` para recortar la imagen al área de subtítulos.
    3. Usa `tesseract.js` para extraer el texto del recorte.
    4. Envía el texto extraído al renderer vía IPC (`mainWindow.webContents.send("subtitle-text", text)`).

- **IPC Handlers (ipcHandlers.ts)**:
  - Añade handlers para:
    - Recibir el área de subtítulos desde el renderer.
    - Iniciar/detener el ciclo de OCR.
    - Enviar el texto extraído al renderer.

- **Configuración**:
  - Permite guardar/cargar el área de subtítulos en la configuración del usuario (ConfigHelper.ts).

### **D. Tipos y API (electron.d.ts)**

- Añade los métodos nuevos a la interfaz `ElectronAPI`:
  ```ts
  setSubtitleArea: (area: {x: number, y: number, width: number, height: number}) => Promise<void>
  startSubtitleOcr: () => Promise<void>
  stopSubtitleOcr: () => Promise<void>
  onSubtitleText: (callback: (text: string) => void) => () => void
  ```

---

## **3. Ejemplo de Flujo de Código**

### **Frontend:**
```tsx
// src/components/SubtitleAreaSelector.tsx
window.electronAPI.setSubtitleArea({ x, y, width, height });
window.electronAPI.startSubtitleOcr();
window.electronAPI.onSubtitleText((text) => setSubtitleText(text));
```

### **Preload:**
```ts
contextBridge.exposeInMainWorld("electronAPI", {
  setSubtitleArea: (area) => ipcRenderer.invoke("set-subtitle-area", area),
  startSubtitleOcr: () => ipcRenderer.invoke("start-subtitle-ocr"),
  stopSubtitleOcr: () => ipcRenderer.invoke("stop-subtitle-ocr"),
  onSubtitleText: (cb) => {
    ipcRenderer.on("subtitle-text", (_, text) => cb(text));
    return () => ipcRenderer.removeListener("subtitle-text", cb);
  }
});
```

### **Main Process:**
```ts
ipcMain.handle("set-subtitle-area", (_, area) => { /* guardar área */ });
ipcMain.handle("start-subtitle-ocr", () => { /* iniciar ciclo OCR */ });
ipcMain.handle("stop-subtitle-ocr", () => { /* detener ciclo OCR */ });

// En el ciclo OCR:
mainWindow.webContents.send("subtitle-text", textoExtraido);
```

---

## **4. Notas y Consideraciones**

- **El área de subtítulos debe ser seleccionada manualmente** por el usuario, ya que la detección automática fue descartada por su complejidad y poca robustez.
- **El ciclo de OCR debe ser eficiente**: considera limitar la frecuencia de captura (ej. 1 vez por segundo) y evitar procesar imágenes si no hay cambios.
- **Persistencia**: guarda el área seleccionada para no pedirla cada vez.
- **Configurabilidad**: permite al usuario ajustar el área y la frecuencia de OCR desde la UI.

---

## **5. Ubicación de Archivos y Cambios**

- `/src/components/SubtitleAreaSelector.tsx` (nuevo)
- electron.d.ts (actualizar)
- preload.ts (actualizar)
- ipcHandlers.ts (actualizar)
- main.ts (actualizar)
- ConfigHelper.ts o store.ts (opcional, para persistencia)
- Añadir dependencias: `screenshot-desktop`, `jimp`, `tesseract.js`

---

**Resumen:**  
La integración se basa en la selección manual del área de subtítulos, un ciclo de captura y OCR en el proceso principal de Electron, y la comunicación eficiente entre backend y frontend usando IPC y la API expuesta en preload. Todo esto se adapta perfectamente a la arquitectura modular de tu proyecto.