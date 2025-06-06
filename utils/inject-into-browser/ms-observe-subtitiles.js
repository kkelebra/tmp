let ws = null; // WebSocket instance

//*********** GLOBAL VARIABLES **********//
var BASE_URL_BACKEND = "http://localhost:7777/api"; // Cambiado para usar una API REST
var timeFormat = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

// Ensure these variables are defined globally
let captionsActivated = false;
let observerInitialized = false;
let transcriptMessages = [];
let transcript = [];

var speakerObservers = new Map(); // Track observers for each speaker
var activeSpeakerBuffers = new Map(); // Buffer for each active speaker's transcript
var speakerOrder = []; // Array to track the order of speakerIds

// Redirect console.log and console.error
var originalLog = console.log;
var originalError = console.error;

// // Suppress logs by default
// console.log = function (...args) {
//   // Uncomment the following line to enable logs when needed
//   originalLog.apply(console, args);
// };

// // Suppress errors by default
// console.error = function (...args) {
//   // Uncomment the following line to enable errors when needed
//   // originalError.apply(console, args);
// };

// Función para enviar datos a la API
var sendToApi = async function (payload) {
  try {
    const response = await fetch(`${BASE_URL_BACKEND}/transcripts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Datos enviados a la API con éxito.");
    } else {
      console.error("Error al enviar los datos a la API:", response.statusText);
    }
  } catch (error) {
    console.error("Error al conectar con la API:", error);
  }
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

    console.log(speakerId, speakerBuffer.text.trim());

    // Enviar el payload a la API
    sendToApi(formattedPayload);

    // Check if we need to remove the oldest speakerId
    if (speakerOrder.length > 3) {
      var oldestSpeakerId = speakerOrder.shift(); // Remove the oldest speakerId from the array
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

function setupObserver() {
  var transcriptWrapper = document.querySelector(
    '[data-tid="closed-caption-v2-window-wrapper"]'
  );

  if (transcriptWrapper) {
    console.log("Found the transcript wrapper");

    var virtualListContent = transcriptWrapper.querySelector(
      '[data-tid="closed-caption-v2-virtual-list-content"]'
    );

    if (virtualListContent) {
      console.log("Found the virtual list content");

      var config = { childList: true, subtree: true };

      var callback = (mutationsList, observer) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === "childList") {
            console.log(mutation);
            mutation.addedNodes.forEach((node) => {
              var messageDivs = node.querySelectorAll(
                ".ui-chat__item__message"
              );
              console.log(messageDivs);
              if (node.nodeType === 1 && node.matches("div")) {
                var messageDivs = node.querySelectorAll(
                  ".ui-chat__item__message"
                );
                messageDivs.forEach((messageDiv) => {
                  var nameElement = messageDiv.querySelector(
                    ".ui-chat__message__author"
                  );
                  var messageElement = messageDiv.querySelector(
                    '[data-tid="closed-caption-text"]'
                  );

                  var speakerName = nameElement
                    ? nameElement.textContent.trim()
                    : "Unknown";
                  var messageText = messageElement
                    ? messageElement.textContent.trim()
                    : "";
                  var timestamp = new Date().toLocaleString(); // Add local timestamp

                  // Generate a unique speaker ID
                  var speakerId = Date.now();

                  // Initialize buffer for this speaker
                  activeSpeakerBuffers.set(speakerId, {
                    name: speakerName,
                    startTime: timestamp,
                    text: messageText,
                    nextThreshold: 150, // Initialize the next threshold for processing
                  });

                  // Add the speakerId to the order array
                  speakerOrder.push(speakerId);

                  // Set up an observer for the message text element
                  var messageObserver = new MutationObserver(() => {
                    var updatedMessageText =
                      messageElement.textContent.trim();
                    if (updatedMessageText !== messageText) {
                      var speakerBuffer =
                        activeSpeakerBuffers.get(speakerId);
                      if (speakerBuffer) {
                        speakerBuffer.text = updatedMessageText;

                        // Check if the text length has reached the next threshold
                        if (
                          speakerBuffer.text.length >=
                          speakerBuffer.nextThreshold
                        ) {
                          processSpeakerTranscript(speakerId);
                        }
                      }
                    }
                  });

                  messageObserver.observe(messageElement, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                  });

                  // Create observer for this speaker's captions
                  var captionsObserver = new MutationObserver(function () {
                    var speakerBuffer =
                      activeSpeakerBuffers.get(speakerId);

                    if (speakerBuffer) {
                      speakerBuffer.text =
                        messageElement.textContent.trim();

                      // Check if the text length has reached the next threshold
                      if (
                        speakerBuffer.text.length >=
                        speakerBuffer.nextThreshold
                      ) {
                        processSpeakerTranscript(speakerId);

                        // Update the next threshold
                        speakerBuffer.nextThreshold += 100;
                      }
                    }
                  });

                  speakerObservers.set(speakerId, captionsObserver);

                  // Set timeout to process this speaker's transcript if they stop talking
                  setTimeout(function () {
                    processSpeakerTranscript(speakerId);
                  }, 5000); // 5 seconds timeout

                  // Start observing this speaker's captions
                  captionsObserver.observe(messageElement, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                  });
                });
              } else {
                console.log(
                  "Node does not match expected chat message structure."
                );
              }
            });
          }
        });
      };

      var observer = new MutationObserver(callback);
      observer.observe(virtualListContent, config);

      console.log(
        "MutationObserver initialized for Microsoft Teams transcript."
      );
    } else {
      console.log("No virtual list content found. Retrying in 500ms...");
      setTimeout(setupObserver, 1000); // Retry after 500 milliseconds
    }
  } else {
    console.log("Transcript wrapper not found. Waiting for content...");
  }
}

setupObserver();