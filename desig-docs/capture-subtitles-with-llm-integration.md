### **Design Document: Captura y Procesamiento de Subtítulos con Envío de Preguntas al LLM**

---

#### **Título**: Captura de Subtítulos desde Navegador Externo con Reconocimiento de Turnos de Habla y Envío de Preguntas al LLM

#### **Autor**: [Tu Nombre]

#### **Fecha**: [Fecha Actual]

---

### **1. Resumen**
Este documento describe cómo capturar subtítulos generados automáticamente desde el DOM de un navegador externo, reconocer los turnos de habla entre participantes, y enviar preguntas automáticamente a un modelo de lenguaje (LLM) cuando se detecta un cambio de hablante o mediante una combinación de teclas. La solución se integra con una aplicación Electron que procesa y visualiza los subtítulos en tiempo real.

---

### **2. Objetivos**
1. Capturar subtítulos generados automáticamente desde el DOM del navegador externo.
2. Reconocer los turnos de habla entre participantes.
3. Permitir el envío manual de preguntas al LLM mediante una combinación de teclas.
4. Automatizar el envío de preguntas al LLM cuando se detecte un cambio de hablante.
5. Integrar la solución con la aplicación Electron existente.

---

### **3. Requisitos**

#### **3.1 Funcionales**
- Capturar subtítulos en tiempo real desde el DOM del navegador externo.
- Detectar cambios de hablante basados en los subtítulos capturados.
- Enviar preguntas al LLM automáticamente al detectar un cambio de hablante.
- Permitir el envío manual de preguntas al LLM mediante una combinación de teclas.

#### **3.2 No Funcionales**
- Baja latencia en la captura y procesamiento de subtítulos.
- Resiliencia ante cambios en el DOM de las plataformas de videollamadas.
- Seguridad y privacidad en el manejo de los datos capturados.

---

### **4. Propuesta de Diseño**

#### **4.1 Captura de Subtítulos desde el Navegador Externo**
El código inyectado en el navegador externo interactuará con el DOM para capturar subtítulos en tiempo real. Los subtítulos serán enviados a la aplicación Electron mediante WebSocket.

##### **Código de Ejemplo para Captura de Subtítulos**
```javascript
// Inyectar este código en el navegador externo
mutation.addedNodes.forEach((node) => {
  if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('nMcdL')) {
    const speakerName = node.querySelector(".KcIKyf").textContent.trim();
    const captionsDiv = node.querySelector(".bh44bd");
    activeSpeakerBuffers.set(speakerId, {
      name: speakerName,
      startTime: new Date().toLocaleString("default", timeFormat).toUpperCase(),
      text: captionsDiv.textContent.trim()
    });
  }
});
```



#### **4.2 Reconocimiento de Eliminacion del observer**

Como se elimina el observer?, cuando ya no este en el frame osea que pasen 2.

#### **4.3 Envío Manual de Preguntas al LLM**
Cada que el text aumente en 150


#### **4.4 Comunicación con la Aplicación Electron**
El servidor WebSocket en la aplicación Electron recibirá los subtítulos y eventos desde el navegador externo y los procesará.

##### **Código del Servidor WebSocket**

### **5. Conclusión**
Este diseño permite capturar subtítulos desde un navegador externo, reconocer turnos de habla, y enviar preguntas al LLM de forma automática o manual. La solución es extensible, eficiente y se integra perfectamente con la arquitectura existente de la aplicación Electron.