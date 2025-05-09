# Design Document: Backend Server for Interview Coder

## Resumen
Este documento describe el diseño de un servidor backend que procesará las peticiones del frontend del proyecto **Interview Coder**. El servidor será responsable de manejar las solicitudes relacionadas con la generación de soluciones, procesamiento de capturas de pantalla y gestión de usuarios.

---

## Contexto
El frontend de **Interview Coder** requiere un servidor para:
- Procesar capturas de pantalla enviadas por los usuarios.
- Generar soluciones a problemas de programación utilizando APIs de terceros (como OpenAI).
- Gestionar usuarios, autenticación y créditos disponibles.
- Proveer datos como análisis de complejidad temporal y espacial.

Actualmente, el frontend no tiene un backend funcional, lo que limita su capacidad para procesar datos y generar soluciones.

---

## Objetivos
1. Diseñar e implementar un servidor backend que:
   - Reciba y procese capturas de pantalla.
   - Genere soluciones utilizando APIs externas.
   - Gestione usuarios y créditos.
   - Proporcione endpoints RESTful para interactuar con el frontend.

2. Asegurar que el servidor sea escalable, seguro y fácil de mantener.

---

## Requisitos

### Funcionales
- Endpoint para procesar capturas de pantalla (`POST /screenshots`).
- Endpoint para generar soluciones (`POST /solutions`).
- Endpoint para obtener el estado del usuario (`GET /user`).
- Endpoint para gestionar créditos (`POST /credits`).
- Autenticación mediante tokens JWT.

### No Funcionales
- Escalabilidad para manejar múltiples usuarios concurrentes.
- Seguridad en las comunicaciones mediante HTTPS.
- Logs para monitoreo y depuración.
- Tiempo de respuesta menor a 1 segundo para solicitudes comunes.

---

## Propuesta de Diseño

### Arquitectura General
El servidor será una aplicación Node.js utilizando **Express.js** como framework. Se conectará a una base de datos relacional (PostgreSQL) para almacenar información de usuarios, créditos y logs de procesamiento.

#### Diagrama de Arquitectura