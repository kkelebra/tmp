import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { configHelper } from "./ConfigHelper";
import { OpenAI } from "openai";
import { deprecate } from "util";

let openaiClient: OpenAI | null = null;
const config = configHelper.loadConfig();
let messages: Array<{ text: string; startTime: string; name: string }> = []; // Almacenar mensajes

openaiClient = new OpenAI({
  apiKey: config.apiKey,
  timeout: 60000, // 60 second timeout
  maxRetries: 2, // Retry up to 2 times
});

// Crear el directorio "logs" si no existe
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Crear un archivo de log con la fecha y hora en el nombre
const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]; // Formato: YYYY-MM-DDTHH-MM-SS
const logFilePath = path.join(logsDir, `s-${timestamp}.log`);
const logStream = fs.createWriteStream(logFilePath, { flags: "a" }); // Abrir en modo "append"

// Crear el servidor API REST
const app = express();
app.use(bodyParser.json());

// Endpoint para recibir mensajes
app.post("/api/messages", (req, res) => {
  try {
    const { text, startTime, name } = req.body;

    if (text && startTime && name) {
      // Guardar el mensaje en el array
      messages.push({ text, startTime, name });

      // Escribir el mensaje en el archivo de log
      logStream.write(`${startTime} ${name} ${text}\n`);
      console.log(`Mensaje recibido y almacenado: ${text}`);

      res.status(200).send({ message: "Mensaje recibido con éxito" });
    } else {
      res.status(400).send({ error: "Faltan campos en el cuerpo de la solicitud" });
    }
  } catch (error) {
    console.error("Error al procesar el mensaje:", error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});

// Método para enviar los dos últimos mensajes
export async function sendLastTwoMessages(): Promise<void> {
  if (messages.length >= 2) {
    const lastTwoMessages = messages.slice(-2);
    //console.log("Enviando los dos últimos mensajes:");

    for (const [index, message] of lastTwoMessages.entries()) {
      try {
        const solutionResponse = await openaiClient.chat.completions.create({
          model: config.solutionModel || "gpt-4o",
          messages: [
            { role: "system", content: "You are an expert coding interview assistant. Provide a solution or suggestion for this interview question. Answer as short as possible in bullet points." },
            { role: "system", content: "Answer in English." },
            { role: "user", content: message.text },
          ],
          max_tokens: 4000,
          temperature: 0.2,
        });

        //console.log(`Respuesta de OpenAI para el mensaje ${index + 1}:`, ;
        logStream.write(`${message.text}\n`);
        logStream.write(`${message.startTime} ${message.name} ${JSON.stringify(solutionResponse.choices[0].message)}\n`);
      } catch (error) {
        console.error(`Error al enviar el mensaje ${index + 1}:`, error);
      }
    }
    logStream.write(`\n`);
  } else {
    console.error("No hay suficientes mensajes para enviar");
  }
}

//@deprecate
export async function startApiRest(): Promise<void> {
  try {
    const PORT = 7777;

    // Iniciar el servidor en el puerto especificado
    app.listen(PORT, () => {
      console.log(`Servidor API REST iniciado en el puerto ${PORT}`);
      console.log("Ruta del archivo de log:", logFilePath);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor API REST:", error);
  }
}