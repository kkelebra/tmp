```md
# Documento de Diseño: Sugerencias Inteligentes en Amurex

## Introducción

Las **Sugerencias Inteligentes** son una funcionalidad clave de Amurex que proporciona recomendaciones contextuales en tiempo real durante las reuniones. Estas sugerencias están diseñadas para mejorar la productividad y la interacción en reuniones virtuales, ofreciendo preguntas relevantes, ideas y recordatorios basados en el contexto de la conversación.

---

## Funcionalidad

### 1. **Generación de Sugerencias**
   - Las sugerencias se generan analizando las transcripciones en tiempo real.
   - Se procesan los datos de audio y texto capturados durante la reunión.
   - Se utiliza un modelo de procesamiento de lenguaje natural (NLP) para identificar temas clave y generar preguntas o ideas relevantes.

### 2. **Notificaciones en Tiempo Real**
   - Las sugerencias se muestran como notificaciones emergentes en la interfaz del usuario.
   - Las notificaciones incluyen preguntas sugeridas, recordatorios o acciones recomendadas.
   - Los usuarios pueden interactuar con las notificaciones para marcar sugerencias como útiles o descartarlas.

### 3. **Seguimiento de Interacciones**
   - Se realiza un seguimiento de las interacciones del usuario con las sugerencias.
   - Los datos de interacción se envían al backend para mejorar los algoritmos de recomendación.

---

## Flujo de Trabajo

### 1. **Inicio de la Reunión**
   - Se inicializa un WebSocket para la comunicación en tiempo real con el backend.
   - Se activa un observador de mutaciones en el DOM para capturar transcripciones y mensajes de chat.

### 2. **Procesamiento de Transcripciones**
   - Las transcripciones se capturan y almacenan en `chrome.storage.local`.
   - Se envían fragmentos de transcripciones al backend a través del WebSocket.
   - El backend procesa los datos y devuelve sugerencias generadas.

### 3. **Recepción de Sugerencias**
   - El cliente recibe las sugerencias a través del WebSocket.
   - Las sugerencias se formatean y se muestran como notificaciones emergentes.

### 4. **Interacción del Usuario**
   - Los usuarios pueden interactuar con las sugerencias (e.g., marcar como útiles, descartar).
   - Las interacciones se registran y se envían al backend para análisis.

---

## Componentes Clave

### 1. **Captura de Transcripciones**
   - Archivo: [`content.js`](extension/content.js)
   - Función: `transcriber`
   - Observa mutaciones en el DOM para capturar transcripciones en tiempo real.

### 2. **Comunicación con el Backend**
   - Archivo: [`teams_content.js`](extension/teams_content.js)
   - Función: `setupWebSocket`
   - Establece un WebSocket para enviar transcripciones y recibir sugerencias.

### 3. **Manejo de Notificaciones**
   - Archivo: [`content.js`](extension/content.js)
   - Función: `showNotification`
   - Muestra notificaciones emergentes con las sugerencias generadas.

### 4. **Seguimiento de Interacciones**
   - Archivo: [`sidepanel.js`](extension/sidepanels/sidepanel.js)
   - Función: `fetchAINotes`
   - Envía datos de interacción al backend para análisis.

---

## Ejemplo de Código

### Captura de Transcripciones
```javascript
// filepath: content.js
function transcriber(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      const transcriptText = mutation.target.innerText;
      chrome.storage.local.get(["transcript"], (result) => {
        const updatedTranscript = [...(result.transcript || []), transcriptText];
        chrome.storage.local.set({ transcript: updatedTranscript });
      });
    }
  });
}
```

### Comunicación con el Backend
```javascript
// filepath: teams_content.js
function setupWebSocket() {
  const ws = new WebSocket(`${AMUREX_CONFIG.BASE_URL_BACKEND}/ws`);
  ws.onopen = () => console.log("WebSocket connected");
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "suggestion_response") {
      showNotification({
        status: 200,
        message: `<strong>Suggested Questions:</strong><ul>${data.suggestions
          .map((s) => `<li>${s}</li>`)
          .join("")}</ul>`,
      });
    }
  };
}
```

### Manejo de Notificaciones
```javascript
// filepath: content.js
function showNotification({ status, message }) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}
```

---

## Configuración

### Variables de Configuración
El archivo `config.js` debe incluir:
```javascript
const AMUREX_CONFIG = {
  BASE_URL_BACKEND: "http://localhost:8080",
  ANALYTICS_ENABLED: true,
};
```

---

## Mejoras Futuras

1. **Personalización de Sugerencias**
   - Permitir a los usuarios personalizar el tipo de sugerencias que desean recibir.

2. **Integración con Más Plataformas**
   - Extender la funcionalidad a otras plataformas de reuniones como Zoom.

3. **Análisis de Sentimientos**
   - Incorporar análisis de sentimientos para generar sugerencias más empáticas.

---

## Recursos Adicionales

- [Repositorio del Backend](https://github.com/thepersonalaicompany/amurex-backend)
- [Documentación de la API](https://amurex.ai/docs/api)
```