window.rrwebEvents = [];

console.log("Content JS Injected");
chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
  if (message === "RECORD") {
    window.stopRecording = rrweb.record({
      emit(event) {
        window.rrwebEvents.push(event);
      },
    });
  } else if (message === "STOP RECORDING") {
    if (window.stopRecording) {
      console.log(window.rrwebEvents);
      chrome.runtime.sendMessage({ message: { text: "RECORDED DATA", data: window.rrwebEvents } });
      //   console.log(window.rrwebEvents);
      window.stopRecording();
    } else {
      console.log("NOT RECORDING");
    }
  } else if (message === "SCREENSHOT") {
    window.snap = rrwebSnapshot.snapshot(document);

    chrome.runtime.sendMessage({ message: { text: "SCREENSHOT TAKEN", data: snap } });
  }
});
