window.rrwebEvents = [];

window.initRrwebDBIfNotExist = () => {
  const request = indexedDB.open("rrweb-html-recorder-db", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
  };
};

initRrwebDBIfNotExist();

window.checkIfStorageContainsEvents = async () => {
  const rrwebEvents = await chrome.storage.local.get("rrwebEvents");
  if (!rrwebEvents) false;
  if (rrwebEvents.hasOwnProperty("rrwebEvents")) return true;
  return false;
};

window.getEventsFromStorage = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rrweb-html-recorder-db", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["events"], "readwrite");
      const store = transaction.objectStore("events");

      const getRequest = store.getAll();

      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };

      getRequest.onerror = (ev) => {
        reject("ERROR: Events not fetched.");
      };
    };

    request.onerror = (ev) => {
      reject("ERROR: DB not opened.");
    };
  });
};

window.appendEventToStorage = async (event) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rrweb-html-recorder-db", 1);

    request.onsuccess = (ev) => {
      const db = ev.target.result;
      const transaction = db.transaction(["events"], "readwrite");
      const store = transaction.objectStore("events");

      const addRequest = store.add(event);

      addRequest.onsuccess = (successEvent) => {
        resolve(successEvent.target.result);
      };

      addRequest.onerror = (errorEvent) => {
        reject("ERROR: Event not added.");
      };
    };

    request.onerror = (ev) => {
      reject("ERROR: DB not opened.");
    };
  });
};

window.clearEventsFromStorage = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rrweb-html-recorder-db", 1);

    request.onsuccess = (ev) => {
      const db = ev.target.result;
      const transaction = db.transaction(["events"], "readwrite");
      const store = transaction.objectStore("events");

      const clearRequest = store.clear();

      clearRequest.onsuccess = (successEvent) => {
        resolve(successEvent.target.result);
      };

      clearRequest.onerror = (errorEvent) => {
        reject("ERROR: Events not removed.");
      };
    };

    request.onerror = (ev) => {
      reject("ERROR: DB not opened.");
    };
  });
};

window.actualEventsCount = 0;

console.log("Content JS Injected");
chrome.runtime.onMessage.addListener(async ({ message }, sender, sendResponse) => {
  if (message === "RECORD") {
    window.stopRecording = rrweb.record({
      async emit(event) {
        actualEventsCount++;
        console.log(actualEventsCount);
        await appendEventToStorage(event);
      },
      // checkoutEveryNms: 200,
    });
  } else if (message === "STOP RECORDING") {
    if (window.stopRecording) {
      const rrwebEvents = await getEventsFromStorage();
      console.log(rrwebEvents);
      chrome.runtime.sendMessage({ message: { text: "RECORDED DATA", data: rrwebEvents } });
      //   console.log(window.rrwebEvents);
      window.stopRecording();
      await clearEventsFromStorage();
      const rrwebEventsCleared = await getEventsFromStorage();
      console.log(rrwebEventsCleared);
    } else {
      console.log("NOT RECORDING");
    }
  } else if (message === "SCREENSHOT") {
    window.snap = rrwebSnapshot.snapshot(document);

    chrome.runtime.sendMessage({ message: { text: "SCREENSHOT TAKEN", data: snap } });
  }
});
