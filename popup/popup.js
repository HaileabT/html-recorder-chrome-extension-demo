// const injectRRWebScript = async () => {
//   const tab = await chrome.tabs.query({ active: true, currentWindow: true });
//   chrome.scripting.executeScript({
//     target: { tabId: tab[0].id },
//     files: ["scripts/content.js"],
//   });
// };

// injectRRWebScript();

let events = [];
let screenshot;

const recordEl = document.getElementById("record");
const stopRecordingEl = document.getElementById("stop-recording");
const screenshotEl = document.getElementById("screenshot-btn");
stopRecordingEl.style.display = "none";
recordEl.style.display = "block";

recordEl.addEventListener("click", () => {
  stopRecordingEl.style.display = "block";
  recordEl.style.display = "none";
  chrome.runtime.sendMessage({ message: "RECORD" });
});

screenshotEl.addEventListener("click", () => {
  chrome.runtime.sendMessage({ message: "SCREENSHOT" });
});

stopRecordingEl.addEventListener("click", () => {
  stopRecordingEl.style.display = "none";
  recordEl.style.display = "block";
  chrome.runtime.sendMessage({ message: "STOP RECORDING" });
});
chrome.runtime.sendMessage({ message: "RUN" });

chrome.runtime.onMessage.addListener(({ message }) => {
  console.log(message);
  if (message.text === "RECORDED DATA") {
    console.log(message.data);
    events = message.data;

    console.log(rrwebReplay);
    const replayer = new rrwebReplay.Replayer(events, {
      UNSAFE_replayCanvas: true,
      root: document.querySelector(".replayer-container") ?? document.body,
    });

    const replayerEl = document.querySelector(".replayer-wrapper iframe");
    replayerEl.sandbox = "allow-scripts allow-same-origin";

    replayer.play();
  } else if (message.text === "SCREENSHOT TAKEN") {
    console.log(message.data);
    screenshot = message.data;
  }
});
