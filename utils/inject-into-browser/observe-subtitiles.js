let ws = null; // WebSocket instance

//*********** GLOBAL VARIABLES **********//
const BASE_URL_BACKEND = "ws://localhost:7777"; // Cambiado para conectar a localhost:7777
const timeFormat = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

var speakerObservers = new Map(); // Track observers for each speaker
var activeSpeakerBuffers = new Map(); // Buffer for each active speaker's transcript
var speakerOrder = []; // Array to track the order of speakerIds

// Función para configurar el WebSocket
var setupWebSocket = function () {
  console.log("Setting up WebSocket");
  const meetingId = document.location.pathname.split("/")[1];
  const userId = "defaultUser"; // Usar un valor predeterminado para userId

  const wsUrl = `ws://${BASE_URL_BACKEND.replace(
    "http://",
    ""
  )}/ws?meeting_id=${meetingId}&user_id=${userId}`;

  console.log("WebSocket URL:", wsUrl);

  ws = new WebSocket(BASE_URL_BACKEND);

  ws.onopen = () => {
    console.log("WebSocket Connected");
  };

  ws.onclose = () => {
    console.log("WebSocket Disconnected");
    // Intentar reconectar después de 5 segundos
    setTimeout(setupWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };
};

// Función para verificar si un texto es una oración válida usando Compromise.js
var isSentence = function (text) {
  var doc = nlp(text); // `nlp` estará disponible después de cargar Compromise.js
  return doc.sentences().length > 0; // Verifica si contiene al menos una oración
};

var processSpeakerTranscript = function (speakerId) {
  var speakerBuffer = activeSpeakerBuffers.get(speakerId);
  if (speakerBuffer && speakerBuffer.text.trim()) {
    // Crear el payload como un objeto JSON
    var formattedPayload = {
      speakerId: speakerId,
      name: speakerBuffer.name,
      startTime: speakerBuffer.startTime,
      text: speakerBuffer.text.trim(),
    };

    // Enviar el payload como JSON
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(formattedPayload));
    } else {
      console.error("WebSocket no está abierto. No se puede enviar la transcripción.");
    }

    // Check if we need to remove the oldest speakerId
    if (speakerOrder.length > 3) {
      var oldestSpeakerId = speakerOrder.shift(); // Remove the oldest speakerId from the array
      //console.log("Eliminando el speakerId más viejo:", oldestSpeakerId);
      removeObserver(oldestSpeakerId);
    }
  }
};

var removeObserver = function (speakerId) {
  var observer = speakerObservers.get(speakerId);
  if (observer) {
    observer.disconnect();
    speakerObservers.delete(speakerId);
  }
  activeSpeakerBuffers.delete(speakerId);
};

// Callback function to execute when transcription mutations are observed.
var transcriber = function (mutationsList, observer) {
  mutationsList.forEach(function (mutation) {
    try {
      // Check for new speaker divs
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('nMcdL')) {
          var speakerId = Date.now(); // Unique ID for this speaker instance
          var speakerName = node.querySelector(".KcIKyf").textContent.trim();
          var captionsDiv = node.querySelector(".bh44bd");

          // Initialize buffer for this speaker
          activeSpeakerBuffers.set(speakerId, {
            name: speakerName,
            startTime: new Date().toLocaleString("default", timeFormat).toUpperCase(),
            text: captionsDiv.textContent.trim(),
            nextThreshold: 150 // Initialize the next threshold for processing
          });

          // Add the speakerId to the order array
          speakerOrder.push(speakerId);

          // Create observer for this speaker's captions
          var captionsObserver = new MutationObserver(function (captionsMutations) {
            var speakerBuffer = activeSpeakerBuffers.get(speakerId);

            if (speakerBuffer) {
              speakerBuffer.text = captionsDiv.textContent.trim();

              // Check if the text length has reached the next threshold
              if (speakerBuffer.text.length >= speakerBuffer.nextThreshold) {
                processSpeakerTranscript(speakerId);

                // Update the next threshold
                speakerBuffer.nextThreshold += 100;
              }
            }
          });

          speakerObservers.set(speakerId, captionsObserver);

          // Set timeout to process this speaker's transcript if they stop talking
          setTimeout(function () {
            //console.log("Timeout reached for speakerId:", speakerId);
            processSpeakerTranscript(speakerId);
          }, 5000); // 5 seconds timeout

          // Start observing this speaker's captions
          captionsObserver.observe(captionsDiv, {
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      });

      // Check for removed speaker divs
      mutation.removedNodes.forEach(function (node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('nMcdL')) {
          // Process any remaining transcripts for removed speakers
          speakerObservers.forEach(function (observer, speakerId) {
            processSpeakerTranscript(speakerId);
          });
        }
      });
    } catch (error) {
      console.error("Transcript observer error:", error);
    }
  });
};

// Create transcript observer instance linked to the callback function
var transcriptObserver = new MutationObserver(transcriber);

// CRITICAL DOM DEPENDENCY. Grab the transcript element. This element is present, irrespective of captions ON/OFF, so this executes independent of operation mode.
var transcriptTargetNode = document.querySelector(".a4cQT");

setupWebSocket(); // Set up the WebSocket connection

if (transcriptTargetNode) {
  transcriptObserver.observe(transcriptTargetNode, {
    childList: true,
    subtree: true
  });
  console.log("Observando el nodo de transcripción...");
} else {
  console.error("El nodo de transcripción no se encontró.");
}