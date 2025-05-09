# Documento de Diseño: Funcionalidad del Repositorio Amurex

## Introducción

El repositorio **Amurex** es una extensión de navegador diseñada para mejorar la experiencia en reuniones virtuales. Proporciona funcionalidades avanzadas como transcripciones en tiempo real, generación de resúmenes, sugerencias inteligentes y herramientas de seguimiento para plataformas de reuniones como Google Meet y Microsoft Teams.

---

## Funcionalidades Principales

### 1. **Transcripciones en Tiempo Real**
   - Captura y almacena transcripciones completas de reuniones.
   - Observa mutaciones en el DOM para registrar mensajes de chat y transcripciones de audio.
   - Almacena datos en `chrome.storage.local` para su posterior procesamiento.

### 2. **Sugerencias Inteligentes**
   - Proporciona sugerencias contextuales durante las reuniones.
   - Utiliza WebSockets para enviar y recibir datos en tiempo real.
   - Genera notificaciones para guiar a los usuarios en la reunión.

### 3. **Resúmenes y Elementos de Acción**
   - Genera resúmenes automáticos y elementos de acción al finalizar la reunión.
   - Procesa las transcripciones almacenadas para extraer información clave.
   - Permite compartir resúmenes y elementos de acción por correo electrónico o aplicaciones externas.

### 4. **Recapitulación para Incorporaciones Tardías**
   - Ofrece un resumen rápido de lo que se ha discutido para los usuarios que se unen tarde.
   - Recupera datos de transcripciones almacenadas y los presenta en un formato legible.

### 5. **Seguimiento y Análisis**
   - Realiza un seguimiento de eventos clave como descargas de transcripciones, vistas de resúmenes y más.
   - Envía datos de análisis al backend configurado para mejorar la experiencia del usuario.

### 6. **Integración con Plataformas de Reuniones**
   - Compatible con Google Meet y Microsoft Teams.
   - Detecta automáticamente la plataforma y ajusta las funcionalidades según el entorno.

---

## Componentes Clave

### 1. **`content.js`**
   - Maneja la lógica principal de la extensión.
   - Observa mutaciones en el DOM para capturar transcripciones y mensajes de chat.
   - Gestiona la conexión WebSocket para sugerencias en tiempo real.

### 2. **`sidepanel.js`**
   - Controla la interfaz del panel lateral.
   - Permite a los usuarios ver resúmenes, elementos de acción y transcripciones.
   - Proporciona opciones para compartir y descargar contenido.

### 3. **`teams_content.js` y `msteams_content.js`**
   - Contienen lógica específica para Microsoft Teams.
   - Manejan transcripciones y mensajes de chat en el entorno de Teams.

### 4. **`background.js`**
   - Actúa como un servicio en segundo plano.
   - Gestiona eventos globales como el cierre de pestañas y la autenticación del usuario.

---

## Flujo de Trabajo

1. **Inicio de Reunión**
   - La extensión detecta el inicio de una reunión mediante elementos del DOM.
   - Se inicializan observadores para capturar transcripciones y mensajes de chat.

2. **Durante la Reunión**
   - Se procesan las transcripciones en tiempo real.
   - Se generan sugerencias contextuales y se muestran al usuario.

3. **Fin de la Reunión**
   - Se detienen los observadores y se procesan los datos capturados.
   - Se generan resúmenes y elementos de acción.
   - Los datos se almacenan localmente y se envían al backend si está configurado.

---

## Configuración

### Archivo de Configuración
El archivo `config.js` debe incluir las siguientes variables:
```javascript
const AMUREX_CONFIG = {
  BASE_URL_BACKEND: "http://localhost:8080",  // URL del servidor backend
  BASE_URL_WEB: "http://localhost:3000",      // URL del servidor web
  ANALYTICS_ENABLED: true                     // Habilitar/deshabilitar análisis
};
window.AMUREX_CONFIG = AMUREX_CONFIG;