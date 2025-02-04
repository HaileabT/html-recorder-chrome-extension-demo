// const injectRRWebScript = async () => {
//   const tab = await chrome.tabs.query({ active: true, currentWindow: true });
//   chrome.scripting.executeScript({
//     target: { tabId: tab[0].id },
//     files: ["scripts/content.js"],
//   });
// };

import { getStoredAppStates, resetIsRecordingState, setIsRecordingState } from "./utils/storageHelpers.js";

// injectRRWebScript();

let events = [];
let screenshot;

const recordEl = document.getElementById("record");
const stopRecordingEl = document.getElementById("stop-recording");
const screenshotEl = document.getElementById("screenshot-btn");

const setRecordingStateOnTheDOM = async () => {
  const { appStates } = await getStoredAppStates();

  console.log("DOM UPDATER RAN", appStates);
  if (appStates.isRecording) {
    stopRecordingEl.style.display = "block";
    recordEl.style.display = "none";
  } else {
    stopRecordingEl.style.display = "none";
    recordEl.style.display = "block";
  }
};

setRecordingStateOnTheDOM();

recordEl.addEventListener("click", async () => {
  stopRecordingEl.style.display = "block";
  recordEl.style.display = "none";
  await setIsRecordingState();
  chrome.runtime.sendMessage({ message: "RECORD" });
});

stopRecordingEl.addEventListener("click", async () => {
  stopRecordingEl.style.display = "none";
  recordEl.style.display = "block";
  await resetIsRecordingState();
  chrome.runtime.sendMessage({ message: "STOP RECORDING" });
});

screenshotEl.addEventListener("click", () => {
  chrome.runtime.sendMessage({ message: "SCREENSHOT" });
});

chrome.runtime.sendMessage({ message: "RUN" });

chrome.runtime.onMessage.addListener(({ message }) => {
  console.log(message);
  if (message.text === "RECORDED DATA") {
    console.log(message.data);
    events = message.data;

    console.log(rrwebReplay);
    document.querySelector(".replayer-container").innerHTML = "";
    const replayer = new rrwebReplay.Replayer(events, {
      UNSAFE_replayCanvas: true,
      root: document.querySelector(".replayer-container") ?? document.body,
    });

    const replayerEl = document.querySelector(".replayer-wrapper iframe");
    replayerEl.sandbox = "allow-scripts allow-same-origin";

    replayer.play();
  } else if (message.text === "SCREENSHOT TAKEN") {
    screenshot = message.data;
    console.log(screenshot);
    const iframe = document.querySelector(".snapshot-container");

    const nodeMap = new Map();
    iframe.contentDocument.innerHTML = "";
    const updatedNode = rrwebSnapshot.rebuild(screenshot, { doc: iframe.contentDocument });

    console.log(updatedNode.childNodes[1].childNodes[2]);
  }
});
