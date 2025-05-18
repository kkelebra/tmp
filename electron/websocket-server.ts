import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import path from "path";

export function createWebSocketServer(mainWindow: Electron.BrowserWindow) {
  // Crear el directorio "logs" si no existe
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Crear un archivo de log con la fecha y hora en el nombre
  const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]; // Formato: YYYY-MM-DDTHH-MM-SS
  const logFilePath = path.join(logsDir, `subtitles-${timestamp}.log`);
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" }); // Abrir en modo "append"

  const wss = new WebSocketServer({ port: 7777 });
  console.log("Servidor WebSocket iniciado en el puerto 7777");
  console.log("Ruta del archivo de log:", logFilePath);

  wss.on("connection", (ws) => {
    console.log("Cliente conectado al servidor WebSocket");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.text) {
          // Escribir el subtítulo en el archivo de log
          logStream.write(`${JSON.stringify(data)}\n`);

          // Enviar subtítulos al proceso de renderizado
          mainWindow.webContents.send("subtitle-received", data);
        }
      } catch (error) {
        console.error("Error al procesar el mensaje:", error);
      }
    });

    ws.on("close", () => {
      console.log("Cliente desconectado del servidor WebSocket");
    });
  });

  // Cerrar el stream al finalizar el programa
  process.on("exit", () => {
    logStream.end();
  });
}