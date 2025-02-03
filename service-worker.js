chrome.runtime.onMessage.addListener(async ({ message }, sender, sendResponse) => {
  const tab = await chrome.tabs.query({ active: true, currentWindow: true });
  if (message === "RUN") {
    const injectScript = async (url) => {
      console.log("Script injected");
      console.log(tab[0].id);
      chrome.scripting.executeScript({
        target: { tabId: tab[0].id },
        files: [url],
      });
    };

    await injectScript("scripts/rrweb.js");
    await injectScript("scripts/rrweb-snapshot.js");
    await injectScript("scripts/content.js");
    //   } else if (message.text && message.text === "RECORDED DATA") {
    //     console.log("THIS PART RAN");
    //     chrome.runtime.sendMessage({ message: message });
    //   } else {
  } else {
    chrome.tabs.sendMessage(tab[0].id, { message: message });
  }
});
