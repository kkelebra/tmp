```markdown
# Design Document: Estrategias para Capturar Subtítulos en Plataformas de Videollamadas con Restricciones Potenciales

## Resumen
Este documento describe las estrategias para capturar subtítulos generados automáticamente en plataformas de videollamadas como Google Meet y Microsoft Teams, considerando que los proveedores pueden bloquear o dificultar el acceso a estos subtítulos mediante cambios en el DOM, restricciones de seguridad o actualizaciones en sus plataformas.

---

## Contexto
El proyecto requiere capturar subtítulos en tiempo real para analizar preguntas y generar sugerencias. Sin embargo, las plataformas de videollamadas pueden implementar restricciones que dificulten el acceso directo a los subtítulos, como cambios en el DOM, bloqueos de automatización o limitaciones en las APIs públicas. Este documento explora enfoques resilientes para garantizar la funcionalidad incluso ante estas restricciones.

---

## Objetivos
1. Capturar subtítulos generados automáticamente en plataformas de videollamadas.
2. Diseñar una solución que sea resiliente a cambios en el DOM o restricciones de acceso.
3. Minimizar la dependencia de herramientas externas o configuraciones complejas.
4. Garantizar la privacidad y seguridad de los datos capturados.

---

## Requisitos

### Funcionales
- Capturar subtítulos en tiempo real desde Google Meet y Microsoft Teams.
- Procesar los subtítulos capturados para análisis y generación de sugerencias.
- Mostrar las sugerencias en la interfaz del usuario.

### No Funcionales
- Resiliencia ante cambios en el DOM o restricciones de las plataformas.
- Baja latencia en la captura y procesamiento de subtítulos.
- Seguridad y privacidad en el manejo de los datos capturados.

---

## Propuesta de Diseño

### 1. Estrategias para Capturar Subtítulos

#### **1.1. Captura Directa del DOM**
- **Descripción**: Usar herramientas de automatización como Puppeteer o Playwright para interactuar con el DOM de la página y extraer subtítulos en tiempo real.
- **Ventajas**:
  - Fácil de implementar si los subtítulos están accesibles en el DOM.
  - Baja latencia en la captura.
- **Limitaciones**:
  - Los selectores del DOM pueden cambiar con actualizaciones de las plataformas.
  - Las plataformas pueden bloquear herramientas de automatización.

#### **1.2. Captura de Pantalla y OCR**
- **Descripción**: Capturar la pantalla de la reunión y usar herramientas de reconocimiento óptico de caracteres (OCR) para extraer los subtítulos.
- **Tecnologías**:
  - **Tesseract OCR**: Biblioteca de código abierto para reconocimiento de texto.
  - **Electron Screen Capture**: Para capturar la pantalla desde Electron.
- **Ventajas**:
  - No depende del DOM ni de selectores específicos.
  - Resiliente a cambios en el diseño de la plataforma.
- **Limitaciones**:
  - Mayor latencia debido al procesamiento de imágenes.
  - Menor precisión en comparación con la captura directa del DOM.

#### **1.3. Uso de APIs Públicas o Privadas**
- **Descripción**: Usar APIs proporcionadas por las plataformas (si están disponibles) para acceder a subtítulos o transcripciones.
- **Ejemplo**:
  - **Microsoft Graph API**: Permite acceder a transcripciones de reuniones en Microsoft Teams.
- **Ventajas**:
  - Solución oficial y confiable.
  - Alta precisión en los datos capturados.
- **Limitaciones**:
  - No todas las plataformas ofrecen APIs públicas para subtítulos.
  - Puede requerir autenticación y permisos adicionales.

#### **1.4. Captura de Audio y Transcripción**
- **Descripción**: Capturar el audio de la reunión y transcribirlo utilizando servicios de reconocimiento de voz como Whisper o Google Speech-to-Text.
- **Ventajas**:
  - No depende de los subtítulos generados por la plataforma.
  - Resiliente a cambios en el DOM o restricciones de acceso.
- **Limitaciones**:
  - Mayor latencia debido al procesamiento de audio.
  - Requiere configuraciones adicionales para capturar el audio del sistema.

---

### 2. Estrategia Recomendada
Dado que existe la posibilidad de que los proveedores bloqueen el acceso directo a los subtítulos, se recomienda una solución híbrida que combine los enfoques anteriores:

1. **Captura Directa del DOM**:
   - Usar Puppeteer o Playwright como primera opción para capturar subtítulos.
   - Monitorear cambios en el DOM y actualizar los selectores según sea necesario.

2. **Captura de Pantalla y OCR**:
   - Implementar como solución de respaldo si el acceso al DOM es bloqueado.
   - Usar Tesseract OCR para extraer subtítulos de las capturas de pantalla.

3. **Uso de APIs Públicas**:
   - Integrar APIs oficiales (como Microsoft Graph API) si están disponibles.
   - Configurar autenticación y permisos necesarios.

4. **Captura de Audio y Transcripción**:
   - Usar como última opción si los subtítulos no están disponibles.
   - Implementar herramientas como Whisper para transcribir el audio capturado.

---

## Diagrama de Arquitectura

[Google Meet / Microsoft Teams]
        |
        v
[Captura del DOM] ----> [Pipeline de Análisis]
        |
        v
[Captura de Pantalla y OCR] ----> [Pipeline de Análisis]
        |
        v
[Captura de Audio y Transcripción] ----> [Pipeline de Análisis]
        |
        v
[Interfaz de Usuario (Electron)]
```

---

## Consideraciones Técnicas

### Tecnologías
- **Electron**: Framework para la aplicación de escritorio.
- **Puppeteer / Playwright**: Para interactuar con el DOM de las plataformas.
- **Tesseract OCR**: Para extraer texto de capturas de pantalla.
- **Whisper**: Para transcribir audio capturado.
- **Microsoft Graph API**: Para acceder a transcripciones en Microsoft Teams.

### Seguridad
- Garantizar que los datos capturados no se almacenen localmente ni se envíen a servidores externos sin el consentimiento del usuario.
- Encriptar las comunicaciones con APIs externas (e.g., OpenAI, Microsoft).

### Riesgos
- **Cambios en el DOM**:
  - **Mitigación**: Monitorear cambios en las plataformas y actualizar los selectores.
- **Bloqueo de Automatización**:
  - **Mitigación**: Implementar soluciones de respaldo como OCR o transcripción de audio.
- **Privacidad**:
  - **Mitigación**: Informar al usuario y obtener su consentimiento explícito.

---

## Plan de Implementación

1. **Semana 1**: Investigación y configuración inicial.
   - Configurar Puppeteer para capturar subtítulos del DOM.
   - Probar Tesseract OCR para extracción de texto desde capturas de pantalla.

2. **Semana 2**: Desarrollo de funcionalidades principales.
   - Implementar la captura de subtítulos en tiempo real.
   - Integrar Whisper para transcripción de audio como solución de respaldo.

3. **Semana 3**: Integración con Electron.
   - Mostrar los subtítulos capturados y las sugerencias generadas en la interfaz de usuario.

4. **Semana 4**: Pruebas y optimización.
   - Realizar pruebas de latencia y precisión.
   - Optimizar el flujo de procesamiento para reducir retrasos.

---

## Impacto
Esta solución híbrida garantiza la captura de subtítulos incluso si los proveedores de las plataformas bloquean el acceso directo. Al combinar múltiples enfoques, se mejora la resiliencia y se asegura que la funcionalidad sea robusta y adaptable a cambios futuros.
```