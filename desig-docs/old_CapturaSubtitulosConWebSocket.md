```markdown
# Design Document: Captura de Subtítulos desde Otro Navegador Usando WebSocket

## Resumen
Este documento explora en profundidad la opción de usar **WebSocket** para capturar subtítulos generados automáticamente en plataformas de videollamadas (como Google Meet o Microsoft Teams) desde un navegador externo. La solución se basa en establecer una comunicación en tiempo real entre un script inyectado en el navegador y la aplicación Electron.

---

## Contexto
El proyecto actual, desarrollado en Electron, necesita capturar subtítulos de reuniones virtuales que se ejecutan en un navegador externo. Dado que la ventana de la reunión no está integrada directamente en la aplicación Electron, se propone usar WebSocket para establecer una comunicación bidireccional entre el navegador y Electron, permitiendo la captura y procesamiento de subtítulos en tiempo real.

---

## Objetivos
1. Implementar un servidor WebSocket en la aplicación Electron para recibir subtítulos capturados desde el navegador externo.
2. Crear un script inyectado en el navegador que capture subtítulos del DOM y los envíe al servidor WebSocket.
3. Garantizar una comunicación en tiempo real con baja latencia.
4. Diseñar una solución resiliente a cambios en el DOM o restricciones del navegador.
5. Asegurar la privacidad y seguridad de los datos capturados.

---

## Requisitos

### Funcionales
- Capturar subtítulos en tiempo real desde el DOM del navegador externo.
- Enviar los subtítulos capturados al servidor WebSocket en Electron.
- Procesar los subtítulos en Electron para generar sugerencias.
- Mostrar las sugerencias generadas en la interfaz de usuario de Electron.

### No Funcionales
- Baja latencia en la captura y transmisión de subtítulos.
- Resiliencia ante cambios en el DOM de las plataformas de videollamadas.
- Seguridad en la comunicación entre el navegador y Electron.

---

## Edge Cases
1. **Cambios en el DOM**:
   - Si el selector del contenedor de subtítulos cambia, el script inyectado no podrá capturar subtítulos.
   - **Mitigación**: Implementar un sistema de monitoreo para detectar cambios en el DOM y actualizar los selectores.

2. **Desconexión del WebSocket**:
   - Si la conexión WebSocket se interrumpe, los subtítulos no se transmitirán a Electron.
   - **Mitigación**: Implementar un mecanismo de reconexión automática.

3. **Restricciones del Navegador**:
   - Algunos navegadores pueden bloquear la inyección de scripts o la comunicación WebSocket.
   - **Mitigación**: Usar extensiones de navegador para garantizar el acceso al DOM y la comunicación.

4. **Latencia Alta**:
   - Si la latencia en la transmisión de subtítulos es alta, las sugerencias generadas pueden no ser útiles en tiempo real.
   - **Mitigación**: Optimizar el flujo de captura y transmisión para reducir la latencia.

5. **Privacidad del Usuario**:
   - Capturar subtítulos de reuniones puede ser sensible desde el punto de vista de la privacidad.
   - **Mitigación**: Informar al usuario y obtener su consentimiento explícito antes de iniciar la captura.

---

## Propuesta de Implementación

### 1. Servidor WebSocket en Electron
- Configurar un servidor WebSocket en la aplicación Electron para recibir subtítulos capturados desde el navegador.
- Implementar un mecanismo de reconexión automática para garantizar la comunicación continua.

#### Ejemplo de Código:
```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Cliente conectado al WebSocket');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Subtítulo recibido:', data.subtitle);
    // Procesar subtítulos aquí
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});
```

---

### 2. Script Inyectado en el Navegador
- Crear un script que se inyecte en el navegador para capturar subtítulos del DOM y enviarlos al servidor WebSocket.
- Usar un **MutationObserver** para detectar cambios en el contenedor de subtítulos.

#### Ejemplo de Código:
```javascript
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  console.log('Conectado al servidor WebSocket');
};

const subtitleContainer = document.querySelector('.T4LgNb');
if (subtitleContainer) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      const subtitle = mutation.target.innerText;
      console.log('Subtítulo capturado:', subtitle);
      socket.send(JSON.stringify({ subtitle }));
    });
  });
  observer.observe(subtitleContainer, { childList: true, subtree: true });
}
```

---

### 3. Procesamiento de Subtítulos en Electron
- Procesar los subtítulos recibidos en Electron utilizando herramientas como **OpenAI GPT-4** para generar sugerencias.
- Mostrar las sugerencias en la interfaz de usuario.

---

### 4. Visualización en la Interfaz de Usuario
- Diseñar un panel flotante en Electron para mostrar los subtítulos capturados y las sugerencias generadas.
- Permitir al usuario interactuar con las sugerencias (e.g., copiar respuestas, marcar como útiles).

---

## Criterios de Éxito
1. **Captura Exitosa de Subtítulos**:
   - Los subtítulos deben capturarse en tiempo real desde el navegador externo y enviarse a Electron sin errores.

2. **Baja Latencia**:
   - La latencia entre la captura de subtítulos y su visualización en Electron debe ser menor a 500 ms.

3. **Resiliencia**:
   - La solución debe seguir funcionando incluso si el DOM de la plataforma de videollamadas cambia, mediante actualizaciones rápidas de los selectores.

4. **Privacidad y Seguridad**:
   - Los datos capturados no deben almacenarse localmente ni enviarse a servidores externos sin el consentimiento del usuario.
   - La comunicación entre el navegador y Electron debe estar encriptada.

5. **Interfaz Intuitiva**:
   - Los subtítulos y sugerencias deben mostrarse de manera clara y accesible en la interfaz de usuario de Electron.

---

## Plan de Implementación

1. **Semana 1**: Configuración inicial.
   - Configurar el servidor WebSocket en Electron.
   - Crear un script básico para capturar subtítulos desde el DOM.

2. **Semana 2**: Desarrollo de funcionalidades principales.
   - Implementar la comunicación entre el navegador y Electron.
   - Procesar subtítulos en Electron y generar sugerencias.

3. **Semana 3**: Diseño de la interfaz de usuario.
   - Crear un panel flotante en Electron para mostrar subtítulos y sugerencias.
   - Permitir interacción con las sugerencias.

4. **Semana 4**: Pruebas y optimización.
   - Realizar pruebas de latencia y precisión.
   - Optimizar el flujo de captura y transmisión para reducir retrasos.

---

## Impacto
Esta solución permite capturar subtítulos desde un navegador externo de manera eficiente y segura, garantizando la funcionalidad del proyecto incluso si la reunión no se ejecuta directamente en la aplicación Electron. Al usar WebSocket---

### 3. Procesamiento de Subtítulos en Electron
- Procesar los subtítulos recibidos en Electron utilizando herramientas como **OpenAI GPT-4** para generar sugerencias.
- Mostrar las sugerencias en la interfaz de usuario.

---

### 4. Visualización en la Interfaz de Usuario
- Diseñar un panel flotante en Electron para mostrar los subtítulos capturados y las sugerencias generadas.
- Permitir al usuario interactuar con las sugerencias (e.g., copiar respuestas, marcar como útiles).

---

## Criterios de Éxito
1. **Captura Exitosa de Subtítulos**:
   - Los subtítulos deben capturarse en tiempo real desde el navegador externo y enviarse a Electron sin errores.

2. **Baja Latencia**:
   - La latencia entre la captura de subtítulos y su visualización en Electron debe ser menor a 500 ms.

3. **Resiliencia**:
   - La solución debe seguir funcionando incluso si el DOM de la plataforma de videollamadas cambia, mediante actualizaciones rápidas de los selectores.

4. **Privacidad y Seguridad**:
   - Los datos capturados no deben almacenarse localmente ni enviarse a servidores externos sin el consentimiento del usuario.
   - La comunicación entre el navegador y Electron debe estar encriptada.

5. **Interfaz Intuitiva**:
   - Los subtítulos y sugerencias deben mostrarse de manera clara y accesible en la interfaz de usuario de Electron.

---

## Plan de Implementación

1. **Semana 1**: Configuración inicial.
   - Configurar el servidor WebSocket en Electron.
   - Crear un script básico para capturar subtítulos desde el DOM.

2. **Semana 2**: Desarrollo de funcionalidades principales.
   - Implementar la comunicación entre el navegador y Electron.
   - Procesar subtítulos en Electron y generar sugerencias.

3. **Semana 3**: Diseño de la interfaz de usuario.
   - Crear un panel flotante en Electron para mostrar subtítulos y sugerencias.
   - Permitir interacción con las sugerencias.

4. **Semana 4**: Pruebas y optimización.
   - Realizar pruebas de latencia y precisión.
   - Optimizar el flujo de captura y transmisión para reducir retrasos.

---

## Impacto
Esta solución permite capturar subtítulos desde un navegador externo de manera eficiente y segura, garantizando la funcionalidad del proyecto incluso si la reunión no se ejecuta directamente en la aplicación Electron. Al usar WebSocket