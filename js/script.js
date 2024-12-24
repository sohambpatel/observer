const APPIUM_INSPECTOR_URL = 'https://inspector.appiumpro.com/inspector.html#/inspector';
const APPIUM_SESSION_URL = 'https://inspector.appiumpro.com/inspector.html#/session';

let mobileRecordingObject;
let webRecording;
let started = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.message) {
    case 'start':
      stop();
      start();
      started = true;
      break;
    case 'stop':
      stop();
      started = false;
      break;
    case 'download':
      sendResponse({url: buildObjectRepoUrl(request.data)});
      break;
  }
  return true;
});

function stop() {
  if (document.URL === APPIUM_INSPECTOR_URL
      || document.URL === APPIUM_SESSION_URL) {
    if (mobileRecordingObject == null) {
      return;
    }
    mobileRecordingObject.tearDownMobileRecording();
  } else if (started) {
    if (webRecording == null) {
      return;
    }
    webRecording.stop();
    window.location.reload();
  }
}

function start() {
  if (document.URL === APPIUM_INSPECTOR_URL
      || document.URL === APPIUM_SESSION_URL) {
    alert('recording started');
    mobileRecordingObject = new MobileRecording();
    mobileRecordingObject.setupMobileRecording();
  } else {
    webRecording = new WebRecording();
    webRecording.start();
  }
}

function buildObjectRepoUrl(data) {
  const blob = new Blob([data], {type: 'application/json'});
  return URL.createObjectURL(blob);
}

window.addEventListener('load', () => {
  let action;
  const perfEntries = performance.getEntriesByType('navigation');
  if ('undefined' !== perfEntries) {
    if (perfEntries[0].type === 'back_forward') {
      action = 'back';
      console.log('sback/forward pressed');
    }
    if (perfEntries[0].type === 'reload') {
      action = 'refresh';
      console.log('srefresh button pressed');
    }
  }
  const data = {
    action: action,
    window_name: document.title,
    current_url: document.URL,
    webPageName: document.title,
  };
  chrome.runtime.sendMessage({message: 'tabLoaded', data}, (response) => {
    console.log(
        `[DEBUG] Tab load is ${response.started ? "started" : "stopped"}`);
    started = response.started;
    if (started) {
      start();
    }
  });
});



