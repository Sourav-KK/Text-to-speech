let playBtn = document.getElementById("playBtn");
let stopBtn = document.getElementById("stopBtn");

let selectArea = document.getElementById("voiceSelect");

let textArea = document.querySelector("textarea");
let textValue = null;

let errorMessage = document.getElementById("errorMessage");

let isAudioPlaying = false;
let selectedVoice = null;
let synth = window.speechSynthesis;

window.onload = () => {
  playBtn.style.visibility = "visible";
  stopBtn.style.visibility = "hidden";

  if (!synth) {
    displayError("Speech synthesis is not supported in your browser.");
    disableControls();
    return;
  }

  populateVoiceList();

  synth.onvoiceschanged = populateVoiceList;
};

playBtn.addEventListener("click", playVoice);

function playVoice() {
  try {
    // Exit if audio is playing
    if (isAudioPlaying) {
      displayError("Audio is still playing, please wait.");
      throw Error("Audio is playing");
    }

    textValue = textArea.value.trim();

    // Exit if no text is found
    if (!textValue) {
      displayError("Please enter text to be spoken.");
      throw Error("Please enter text to be spoken.");
    }

    // Exit if no voice is selected
    if (!selectedVoice) {
      console.error("No voice selected");
      selectedVoice = synth.getVoices()[0];
      displayError("No voice selected.");
      throw Error("No voice selected.");
    }

    console.log("selectedVoice:", selectedVoice);
    let utterance = new SpeechSynthesisUtterance(textValue);
    utterance.voice = selectedVoice;
    console.log("utterance:", utterance);

    isAudioPlaying = true;

    // Timeout to check if synthesis didn't start (e.g., due to no audio support)
    console.log("about to audio play");
    //     utterance.onstart = () => {
    //       console.log("start audio play");
    //       setTimeout(() => {
    //         if (isAudioPlaying) {
    //           console.error("Speech synthesis may have failed.");
    //           isAudioPlaying = false;
    //           toggleButtonState();
    //         }
    //       }, 1000);
    //     };

    utterance.onerror = (event) => {
      const errorType = event.error;
      let errorMessage = "";

      switch (errorType) {
        case "audio-busy":
          errorMessage = "Audio device is currently in use";
          break;
        case "audio-hardware":
          errorMessage = "No audio hardware available";
          break;
        case "network":
          errorMessage = "Network communication failed";
          break;
        case "synthesis-unavailable":
          errorMessage = "Speech synthesis engine unavailable";
          break;
        case "synthesis-failed":
          errorMessage = "Failed to synthesize speech";
          break;
        case "language-unavailable":
          errorMessage = "Selected voice language unavailable";
          break;
        case "voice-unavailable":
          errorMessage = "Selected voice unavailable";
          break;
        case "text-too-long":
          errorMessage = "Text too long to synthesize";
          break;
        case "invalid-argument":
          errorMessage = "Invalid parameters provided";
          break;
        case "not-allowed":
          errorMessage = "Operation not allowed";
          break;
        default:
          errorMessage = "Unknown error occurred";
      }

      console.error(`Speech synthesis error: ${errorMessage}`);
      displayError(errorMessage);
      isAudioPlaying = false;
      toggleButtonState();
    };

    utterance.onend = () => {
      console.log("audio ended");
      isAudioPlaying = false;
      toggleButtonState();
    };

    synth.speak(utterance);

    // Add timeout check for failed initialization
    // setTimeout(() => {
    //   if (isAudioPlaying && !utterance.pending) {
    //     console.error("Speech synthesis failed to initialize");
    //     displayError("Failed to start speech synthesis");
    //     isAudioPlaying = false;
    //     toggleButtonState();
    //   }
    // }, 1000);
  } catch (error) {
    console.error("error caught ", error);
    isAudioPlaying = false;
    displayError("An unexpected error occurred.");
  }
}

// Function to populate voice options
function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    console.error("Speech synthesis is not supported");
    return;
  }

  if (!synth) {
    console.error("Speech synthesis not supported");
    return;
  }

  const voices = speechSynthesis.getVoices();

  // If voices are empty, try again after 100ms
  if (voices.length === 0) {
    console.log("No voices found. Retrying...");
    setTimeout(populateVoiceList, 100);
    return;
  }

  selectArea.innerHTML = ""; // Clear the existing options

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.textContent += " — DEFAULT";
    }

    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    selectArea.appendChild(option);

    // Set default voice
    if (voice.default && !selectedVoice) {
      selectArea.value = voice.name; // Link the voice object
      selectedVoice = voice;
    }
  });

  // If no default voice was found, select the first voice
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices[0];
    selectArea.value = voices[0].name; // Select the first voice in the dropdown
  }
}

stopBtn.addEventListener("click", () => {
  if (isAudioPlaying) {
    synth.cancel();
    isAudioPlaying = false;
    toggleButtonState();
    displayError("Speech playback stopped."); // Change the messaging for feedback
  }
});

// Function to display error messages on the UI
function displayError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block"; // Make it visible
}

// Function to toggle button states
function toggleButtonState() {
  playBtn.disabled = isAudioPlaying;
  stopBtn.disabled = !isAudioPlaying;
  if (!isAudioPlaying) {
    playBtn.style.visibility = "visible";
    stopBtn.style.visibility = "hidden";
  } else {
    playBtn.style.visibility = "hidden";
    stopBtn.style.visibility = "visible";
  }
}

// Hide error messages when input is updated
textArea.addEventListener("input", () => {
  errorMessage.style.display = "none"; // Hide error when text is updated
});

// Event listener to update selected voice when dropdown changes
selectArea.addEventListener("change", function () {
  const selectedVoiceName = selectArea.value; // Get the selected value
  selectedVoice = synth
    .getVoices()
    .find((voice) => voice.name === selectedVoiceName);

  if (selectedVoice) {
    console.log("Updated selectedVoice:", selectedVoice);
  } else {
    console.error("Failed to update selectedVoice. Voice not found.");
  }
});
