# Design Document: Backend Functionality for Amurex Backend

## Resumen
Este documento describe el diseño y las funcionalidades principales del backend del proyecto **Amurex Backend**. Este backend es responsable de gestionar reuniones, procesar transcripciones, generar notas y elementos de acción, enviar correos electrónicos, y sincronizar datos con Supabase.

---

## Contexto
El backend de **Amurex** sirve como la capa de procesamiento y almacenamiento para la aplicación. Proporciona funcionalidades como:
- Gestión de reuniones y usuarios.
- Procesamiento de transcripciones para generar notas y elementos de acción.
- Sincronización de datos con Supabase.
- Envío de correos electrónicos con resúmenes y elementos de acción.
- Soporte para WebSockets para actualizaciones en tiempo real.

El backend está diseñado para ser escalable y modular, permitiendo la integración con APIs externas como OpenAI, Redis, y Supabase.

---

## Objetivos
1. Proveer una API RESTful para interactuar con el frontend.
2. Implementar WebSockets para actualizaciones en tiempo real.
3. Procesar transcripciones para generar notas y elementos de acción.
4. Sincronizar datos con Supabase para almacenamiento persistente.
5. Enviar correos electrónicos con resúmenes y elementos de acción.
6. Garantizar la seguridad y escalabilidad del sistema.

---

## Requisitos

### Funcionales
- **Gestión de reuniones**:
  - Crear, actualizar y obtener reuniones.
  - Procesar transcripciones y generar notas.
- **WebSockets**:
  - Soporte para conexiones en tiempo real.
  - Actualización de transcripciones en tiempo real.
- **Sincronización con Supabase**:
  - Almacenar transcripciones, notas y elementos de acción.
  - Gestionar usuarios y reuniones.
- **Envío de correos electrónicos**:
  - Enviar resúmenes y elementos de acción a los participantes.
- **Procesamiento de transcripciones**:
  - Generar notas y elementos de acción utilizando modelos de IA.

### No Funcionales
- Escalabilidad para manejar múltiples usuarios concurrentes.
- Seguridad en las comunicaciones mediante HTTPS y autenticación.
- Logs para monitoreo y depuración.
- Tiempo de respuesta menor a 1 segundo para solicitudes comunes.

---

## Propuesta de Diseño

### Arquitectura General
El backend utiliza **Python** con el framework **Robyn** para manejar solicitudes HTTP y WebSockets. Se conecta a **Supabase** como base de datos principal y utiliza **Redis** para almacenamiento en caché.

#### Diagrama de Arquitectura

Gracias por señalarlo. Aquí tienes el **Design Document** completamente en formato Markdown, sin dejar nada fuera del formato:

```markdown
# Design Document: Backend Functionality for Amurex Backend

## Resumen
Este documento describe el diseño y las funcionalidades principales del backend del proyecto **Amurex Backend**. Este backend es responsable de gestionar reuniones, procesar transcripciones, generar notas y elementos de acción, enviar correos electrónicos, y sincronizar datos con Supabase.

---

## Contexto
El backend de **Amurex** sirve como la capa de procesamiento y almacenamiento para la aplicación. Proporciona funcionalidades como:
- Gestión de reuniones y usuarios.
- Procesamiento de transcripciones para generar notas y elementos de acción.
- Sincronización de datos con Supabase.
- Envío de correos electrónicos con resúmenes y elementos de acción.
- Soporte para WebSockets para actualizaciones en tiempo real.

El backend está diseñado para ser escalable y modular, permitiendo la integración con APIs externas como OpenAI, Redis, y Supabase.

---

## Objetivos
1. Proveer una API RESTful para interactuar con el frontend.
2. Implementar WebSockets para actualizaciones en tiempo real.
3. Procesar transcripciones para generar notas y elementos de acción.
4. Sincronizar datos con Supabase para almacenamiento persistente.
5. Enviar correos electrónicos con resúmenes y elementos de acción.
6. Garantizar la seguridad y escalabilidad del sistema.

---

## Requisitos

### Funcionales
- **Gestión de reuniones**:
  - Crear, actualizar y obtener reuniones.
  - Procesar transcripciones y generar notas.
- **WebSockets**:
  - Soporte para conexiones en tiempo real.
  - Actualización de transcripciones en tiempo real.
- **Sincronización con Supabase**:
  - Almacenar transcripciones, notas y elementos de acción.
  - Gestionar usuarios y reuniones.
- **Envío de correos electrónicos**:
  - Enviar resúmenes y elementos de acción a los participantes.
- **Procesamiento de transcripciones**:
  - Generar notas y elementos de acción utilizando modelos de IA.

### No Funcionales
- Escalabilidad para manejar múltiples usuarios concurrentes.
- Seguridad en las comunicaciones mediante HTTPS y autenticación.
- Logs para monitoreo y depuración.
- Tiempo de respuesta menor a 1 segundo para solicitudes comunes.

---

## Propuesta de Diseño

### Arquitectura General
El backend utiliza **Python** con el framework **Robyn** para manejar solicitudes HTTP y WebSockets. Se conecta a **Supabase** como base de datos principal y utiliza **Redis** para almacenamiento en caché.

#### Diagrama de Arquitectura
```
Frontend <--> Backend (Robyn) <--> Supabase (PostgreSQL)
                          |
                          +--> Redis (Cache)
                          +--> OpenAI/Mistral (IA)
                          +--> Resend (Correos)
```

### Endpoints Principales
| Método | Endpoint                      | Descripción                              |
|--------|-------------------------------|------------------------------------------|
| POST   | `/upload_meeting_file`        | Subir archivos de reuniones.             |
| POST   | `/update_meeting_obj`         | Actualizar objetos de reuniones.         |
| GET    | `/check_meeting/:meeting_id`  | Verificar si una reunión existe.         |
| POST   | `/send_user_email`            | Enviar correos electrónicos a usuarios.  |
| POST   | `/end_meeting`                | Finalizar una reunión y procesar datos.  |
| POST   | `/generate_actions`           | Generar elementos de acción.             |

### Base de Datos
#### Tablas Principales
1. **meetings**:
   - `meeting_id`: Identificador único.
   - `transcript`: Transcripción de la reunión.
   - `created_at`: Fecha de creación.

2. **memories**:
   - `id`: Identificador único.
   - `user_id`: Relación con el usuario.
   - `content`: Contenido generado (notas, elementos de acción).
   - `meeting_id`: Relación con la reunión.

3. **analytics**:
   - `id`: Identificador único.
   - `uuid`: Identificador del usuario.
   - `event_type`: Tipo de evento (e.g., "transcripción actualizada").
   - `created_at`: Fecha del evento.

---

## Consideraciones Técnicas

### Tecnologías
- **Robyn**: Framework para manejar solicitudes HTTP y WebSockets.
- **Supabase**: Base de datos relacional y almacenamiento de archivos.
- **Redis**: Almacenamiento en caché para mejorar el rendimiento.
- **OpenAI/Mistral**: Procesamiento de transcripciones y generación de contenido.
- **Resend**: Servicio para enviar correos electrónicos.

### Seguridad
- Uso de HTTPS para todas las comunicaciones.
- Autenticación mediante claves API y tokens.
- Validación de entradas para prevenir inyecciones SQL.

### Riesgos
- **Dependencia de APIs externas**: Si las APIs externas fallan, el backend no podrá procesar transcripciones ni enviar correos.
  - **Mitigación**: Implementar reintentos y manejo de errores.
- **Escalabilidad**: Aumento en el número de usuarios podría saturar el servidor.
  - **Mitigación**: Uso de Redis para caché y escalado horizontal.

---

## Plan de Implementación

1. **Semana 1**: Configuración inicial del proyecto.
   - Configurar Robyn, Supabase y Redis.
   - Crear estructura básica de endpoints.

2. **Semana 2**: Implementación de funcionalidades principales.
   - Endpoint para subir archivos y procesar transcripciones.
   - Sincronización con Supabase.

3. **Semana 3**: WebSockets y correos electrónicos.
   - Implementar WebSockets para actualizaciones en tiempo real.
   - Configurar envío de correos electrónicos con Resend.

4. **Semana 4**: Pruebas y despliegue.
   - Pruebas unitarias e integración.
   - Configuración de despliegue en un servidor (e.g., AWS, Docker).

---

## Pruebas y Validación
- **Pruebas Unitarias**: Para cada endpoint y función.
- **Pruebas de Integración**: Validar interacción entre backend, Supabase y Redis.
- **Pruebas de Carga**: Simular múltiples usuarios concurrentes.

---

## Impacto
Este backend permitirá que el sistema Amurex funcione completamente, habilitando la gestión de reuniones, procesamiento de transcripciones y generación de contenido. Además, sentará las bases para futuras expansiones, como soporte para más idiomas o integración con otros servicios de IA.
```

Todo está ahora completamente en formato Markdown. Si necesitas ajustes adicionales, házmelo saber.

### Endpoints Principales
| Método | Endpoint                      | Descripción                              |
|--------|-------------------------------|------------------------------------------|
| POST   | `/upload_meeting_file`        | Subir archivos de reuniones.             |
| POST   | `/update_meeting_obj`         | Actualizar objetos de reuniones.         |
| GET    | `/check_meeting/:meeting_id`  | Verificar si una reunión existe.         |
| POST   | `/send_user_email`            | Enviar correos electrónicos a usuarios.  |
| POST   | `/end_meeting`                | Finalizar una reunión y procesar datos.  |
| POST   | `/generate_actions`           | Generar elementos de acción.             |

### Base de Datos
#### Tablas Principales
1. **meetings**:
   - `meeting_id`: Identificador único.
   - `transcript`: Transcripción de la reunión.
   - `created_at`: Fecha de creación.

2. **memories**:
   - `id`: Identificador único.
   - `user_id`: Relación con el usuario.
   - `content`: Contenido generado (notas, elementos de acción).
   - `meeting_id`: Relación con la reunión.

3. **analytics**:
   - `id`: Identificador único.
   - `uuid`: Identificador del usuario.
   - `event_type`: Tipo de evento (e.g., "transcripción actualizada").
   - `created_at`: Fecha del evento.

---

## Consideraciones Técnicas

### Tecnologías
- **Robyn**: Framework para manejar solicitudes HTTP y WebSockets.
- **Supabase**: Base de datos relacional y almacenamiento de archivos.
- **Redis**: Almacenamiento en caché para mejorar el rendimiento.
- **OpenAI/Mistral**: Procesamiento de transcripciones y generación de contenido.
- **Resend**: Servicio para enviar correos electrónicos.

### Seguridad
- Uso de HTTPS para todas las comunicaciones.
- Autenticación mediante claves API y tokens.
- Validación de entradas para prevenir inyecciones SQL.

### Riesgos
- **Dependencia de APIs externas**: Si las APIs externas fallan, el backend no podrá procesar transcripciones ni enviar correos.
  - **Mitigación**: Implementar reintentos y manejo de errores.
- **Escalabilidad**: Aumento en el número de usuarios podría saturar el servidor.
  - **Mitigación**: Uso de Redis para caché y escalado horizontal.

---

## Plan de Implementación

1. **Semana 1**: Configuración inicial del proyecto.
   - Configurar Robyn, Supabase y Redis.
   - Crear estructura básica de endpoints.

2. **Semana 2**: Implementación de funcionalidades principales.
   - Endpoint para subir archivos y procesar transcripciones.
   - Sincronización con Supabase.

3. **Semana 3**: WebSockets y correos electrónicos.
   - Implementar WebSockets para actualizaciones en tiempo real.
   - Configurar envío de correos electrónicos con Resend.

4. **Semana 4**: Pruebas y despliegue.
   - Pruebas unitarias e integración.
   - Configuración de despliegue en un servidor (e.g., AWS, Docker).

---

## Pruebas y Validación
- **Pruebas Unitarias**: Para cada endpoint y función.
- **Pruebas de Integración**: Validar interacción entre backend, Supabase y Redis.
- **Pruebas de Carga**: Simular múltiples usuarios concurrentes.

---

## Impacto
Este backend permitirá que el sistema Amurex funcione completamente, habilitando la gestión de reuniones, procesamiento de transcripciones y generación de contenido. Además, sentará las bases para futuras expansiones, como soporte para más idiomas o integración con otros servicios de IA.