export const checkIfAppStatesAreStored = async () => {
  const appStates = await chrome.storage.local.get("appStates");
  console.log(appStates);
  if (!appStates) false;
  if (appStates.hasOwnProperty("appStates")) return true;
  return false;
};

export const getStoredAppStates = async () => {
  const areAppStatesStored = await checkIfAppStatesAreStored();
  console.log(areAppStatesStored);
  let appStates;
  if (!areAppStatesStored) {
    appStates = {
      isRecording: false,
    };
    await chrome.storage.local.set({ appStates: appStates });
    console.log(await chrome.storage.local.get("appStates"));
  } else {
    appStates = await chrome.storage.local.get("appStates");
  }

  return appStates;
};

export const setIsRecordingState = async () => {
  const { appStates } = await getStoredAppStates();
  if (appStates.isRecording) return;

  appStates.isRecording = true;

  await chrome.storage.local.set({ appStates });
};

export const resetIsRecordingState = async () => {
  const { appStates } = await getStoredAppStates();
  if (!appStates.isRecording) return;

  appStates.isRecording = false;

  await chrome.storage.local.set({ appStates });
};
