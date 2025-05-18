# Design Document: Implementación de Escucha de Audio y Generación de Sugerencias en Entrevistas Virtuales

## Resumen
Este documento describe el diseño para extender la funcionalidad del proyecto actual (hecho en Electron) para que pueda escuchar lo que se dice en una entrevista virtual (por ejemplo, en Google Meet) y proporcionar sugerencias a las preguntas en tiempo real. El enfoque incluye la captura de audio, transcripción en texto y generación de sugerencias utilizando tecnologías de procesamiento de lenguaje natural (NLP).

## Contexto
El proyecto actual, desarrollado en Electron, está diseñado para ayudar en entrevistas técnicas. Sin embargo, no tiene la capacidad de interactuar con entrevistas virtuales en plataformas como Google Meet. La funcionalidad propuesta permitirá:
1. Capturar el audio de la entrevista en tiempo real.
2. Transcribir el audio a texto.
3. Analizar las preguntas y generar sugerencias relevantes.
4. Mostrar las sugerencias en la interfaz del usuario.

---

## Objetivos
1. Capturar el audio de la entrevista virtual en tiempo real.
2. Transcribir el audio a texto utilizando tecnologías de reconocimiento de voz.
3. Analizar las preguntas transcritas y generar sugerencias utilizando modelos de IA.
4. Integrar esta funcionalidad en el proyecto actual sin afectar su rendimiento.

---

## Requisitos

### Funcionales
- Capturar el audio del sistema o de una aplicación específica (Google Meet).
- Transcribir el audio a texto en tiempo real.
- Detectar preguntas en el texto transcrito.
- Generar sugerencias relevantes para las preguntas detectadas.
- Mostrar las sugerencias en la interfaz del usuario.

### No Funcionales
- Baja latencia en la captura y procesamiento del audio.
- Escalabilidad para manejar diferentes idiomas.
- Seguridad y privacidad en el manejo del audio y texto transcrito.
- Interfaz de usuario intuitiva para mostrar las sugerencias.

---

## Propuesta de Diseño

### 1. Captura de Audio
Inicialmente, se consideraron las siguientes tecnologías para capturar el audio de la entrevista virtual:
- **`node-microphone`**: Una biblioteca de Node.js para capturar audio desde el micrófono del sistema.
- **`audio-capture`**: Herramienta para capturar el audio del sistema (incluyendo aplicaciones específicas como Google Meet).
- **`pulseaudio` (Linux)** o **`Soundflower` (macOS)**: Para enrutar el audio del sistema hacia la aplicación.

#### Decisión Final:
Tras evaluar la complejidad técnica de implementar la captura de audio del sistema, se determinó que esta funcionalidad es demasiado compleja para los requerimientos actuales de la aplicación. La captura de audio requiere configuraciones específicas del sistema operativo, herramientas externas y permisos adicionales, lo que introduce riesgos de compatibilidad y aumenta la latencia.

En lugar de capturar el audio, se optará por **capturar los subtítulos generados automáticamente por plataformas como Google Meet o Microsoft Teams**, ya que esta solución es más sencilla, precisa y alineada con los objetivos del proyecto.

---

### 2. Captura de Subtítulos
Para capturar los subtítulos generados automáticamente, se utilizarán herramientas de automatización como **Puppeteer** o **Playwright** para interactuar con el DOM de la página y extraer los subtítulos en tiempo real.

#### Ventajas:
- No requiere procesamiento de audio ni transcripción.
- Los subtítulos ya están generados por la plataforma, lo que reduce la latencia.
- Mayor precisión en comparación con la transcripción de audio.

#### Implementación:
1. Usar Puppeteer para acceder al DOM de Google Meet o Microsoft Teams.
2. Identificar el contenedor de subtítulos en la página (e.g., `.T4LgNb` en Google Meet).
3. Capturar los subtítulos en tiempo real y enviarlos al pipeline de análisis.

---

### 3. Análisis de Preguntas y Generación de Sugerencias
Para analizar las preguntas transcritas o capturadas de los subtítulos y generar sugerencias, se pueden usar las siguientes tecnologías:
- **OpenAI GPT-4**: Modelo de lenguaje avanzado para analizar preguntas y generar respuestas o sugerencias.
- **LangChain**: Framework para construir aplicaciones basadas en modelos de lenguaje, útil para manejar el contexto de la conversación.
- **Hugging Face Transformers**: Modelos de lenguaje de código abierto para análisis de texto y generación de respuestas.

#### Mejor Opción:
Usar **OpenAI GPT-4** con un pipeline de análisis de preguntas para identificar el contexto y generar sugerencias relevantes.

---

### 4. Integración en Electron
La integración de estas funcionalidades en el proyecto actual se puede realizar de la siguiente manera:
1. **Captura de Subtítulos**:
   - Usar Puppeteer para capturar subtítulos en tiempo real desde Google Meet o Microsoft Teams.
   - Procesar los subtítulos capturados y enviarlos a la etapa de análisis.

2. **Análisis y Generación de Sugerencias**:
   - Usar OpenAI GPT-4 para analizar las preguntas detectadas en los subtítulos.
   - Generar sugerencias relevantes y enviarlas al frontend de Electron.

3. **Interfaz de Usuario**:
   - Mostrar las sugerencias en un panel flotante o en una sección dedicada de la aplicación.
   - Permitir al usuario interactuar con las sugerencias (e.g., copiar respuestas, marcar como útiles).

---

## Diagrama de Arquitectura

Subtítulos del Sistema (Google Meet)
        |
        v
[Captura de Subtítulos (Puppeteer)]
        |
        v
[Análisis de Texto (OpenAI GPT-4)]
        |
        v
[Interfaz de Usuario (Electron)]
```

---

## Consideraciones Técnicas

### Tecnologías
- **Electron**: Framework para la aplicación de escritorio.
- **Node.js**: Para manejar la captura de subtítulos y la integración con APIs.
- **Puppeteer**: Para interactuar con el DOM de Google Meet o Microsoft Teams.
- **OpenAI GPT-4**: Para análisis de preguntas y generación de sugerencias.

### Seguridad
- Garantizar que los subtítulos capturados no se almacenen localmente ni se envíen a servidores externos sin el consentimiento del usuario.
- Encriptar las comunicaciones con APIs externas (e.g., OpenAI, Google).

### Riesgos
- **Compatibilidad**: Los selectores del DOM pueden cambiar con actualizaciones de las plataformas.
  - **Mitigación**: Monitorear cambios en las plataformas y actualizar el código según sea necesario.
- **Privacidad**: Capturar subtítulos de reuniones puede ser sensible.
  - **Mitigación**: Informar al usuario y obtener su consentimiento explícito.

---

## Plan de Implementación

1. **Semana 1**: Investigación y configuración inicial.
   - Configurar Puppeteer para capturar subtítulos de Google Meet.
   - Probar OpenAI GPT-4 para análisis de preguntas.

2. **Semana 2**: Desarrollo de funcionalidades principales.
   - Implementar la captura de subtítulos en tiempo real.
   - Integrar OpenAI GPT-4 para análisis de preguntas.

3. **Semana 3**: Integración con Electron.
   - Mostrar las sugerencias generadas en la interfaz de usuario.
   - Permitir interacción con las sugerencias (e.g., copiar respuestas).

4. **Semana 4**: Pruebas y optimización.
   - Realizar pruebas de latencia y precisión.
   - Optimizar el flujo de procesamiento para reducir retrasos.

---

## Impacto
Esta decisión simplifica la implementación al evitar la complejidad de capturar y procesar audio. Al capturar subtítulos generados automáticamente, se mejora la precisión y se reduce la latencia, haciendo que la funcionalidad sea más eficiente y fácil de mantener.
