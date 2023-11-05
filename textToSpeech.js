let button = document.querySelector("button");
let text = document.querySelector("textarea");

const synth = window.speechSynthesis;

button.addEventListener("click", () => {
  let utterance = new SpeechSynthesisUtterance(text.value);
  speechSynthesis.speak(utterance);
});
