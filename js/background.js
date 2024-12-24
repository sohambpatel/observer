const objectRepo = {};
objectRepo.objectDetails = [];
let focusinflag = false;
let started = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.message) {
    case 'stop':
      started = false;
      chrome.runtime.onMessage.removeListener();
      stop();
      break;
    case 'tabLoaded':
      if (!started) {
        sendResponse({started: false});
        break;
      }
      if (request.data.action === 'back' || request.data.action === 'refresh') {
        objectRepo.objectDetails.push(request.data);
      }
      sendResponse({started: true});
      break;
    case 'start':
      objectRepo.objectDetails = [];
      started = true;
      start();
      break;
    case 'data':
      if (request.object.action === 'dblclick') {
        objectRepo.objectDetails.pop();
        objectRepo.objectDetails.pop();
        objectRepo.objectDetails.push(request.object);
      }

      if ('focusin' === request.object.action) {
        focusinflag = true;
      }
      if ('change' === request.object.action) {
        processChangeEvents(request.object);
      } else {
        objectRepo.objectDetails.push(request.object);
      }
      break;
  }
  return true;
});

function processChangeEvents(object) {
  if (objectRepo.objectDetails.length > 1) {
    const poppedval1 = objectRepo.objectDetails.pop();

    if ('hotkey' === poppedval1.action) {
      if (poppedval1.unique_id === object.unique_id) {
        object.keys = poppedval1.keys; // just take the key and ignore the hotkey event
        object.hotkeyflag = true;
      } else {
        objectRepo.objectDetails.push(poppedval1);
      }
    } else {
      objectRepo.objectDetails.push(poppedval1);
    }

    let k;

    let temp = '';
    for (let i = objectRepo.objectDetails.length - 1; i >= 0; i--) {
      if (objectRepo.objectDetails[i]['action'] === 'click'
          && objectRepo.objectDetails[i]['unique_id'] === object.unique_id) {
        temp = objectRepo.objectDetails[i]['unique_id'];

        k = i;
      }
      if (objectRepo.objectDetails[i]['action'] === 'focusin'
          && objectRepo.objectDetails[i]['unique_id'] === object.unique_id) {
        if (temp === object.unique_id) {
          objectRepo.objectDetails[i] = objectRepo.objectDetails[k];
          objectRepo.objectDetails[k] = object;
        } else {
          objectRepo.objectDetails[i] = object;
        }
        return;
      }
    }
    objectRepo.objectDetails.push(object);
  }
}

function start() {
  new Promise(async (resolve) => {
    const tabList = [];
    chrome.windows.getAll({populate: true}, (windows) => {
      windows.forEach((window) => {
        window.tabs.forEach((tab) => {
          if (!tab.url.startsWith('chrome')) {
            tabList.push(tab);
          }
        });
      });
      resolve(tabList);
    });
  }).then((tabList) => {
    tabList.forEach((tab) => chrome.tabs.sendMessage(tab.id,
        {message: 'start', tab}));
  });
}

function stop() {
  const data = JSON.stringify(objectRepo);
  new Promise(async (resolve) => {
    const tabList = [];
    chrome.windows.getAll({populate: true}, (windows) => {
      windows.forEach((window) => {
        window.tabs.forEach((tab) => {
          tabList.push(tab);
        });
      });

      resolve(tabList);
    });
  }).then((tabList) => new Promise((resolve) => {
    let focusedTab;
    tabList.forEach((tab) => {
      if (tab.active) {
        focusedTab = tab;
      }
      chrome.tabs.sendMessage(tab.id, {message: 'stop'});
    });
    resolve(focusedTab);
  }))
  .then((tab) => sendDownloadMessage(tab, data))
  .then(() => {
        delete objectRepo.objectDetails;
      }
  );
  return false;
}

function sendDownloadMessage(tab, data) {
  chrome.tabs.sendMessage(tab.id, {message: 'download', data},
      (reponse) => {
        const url = reponse.url;
        chrome.downloads.download({
              url: url,
              filename: 'OBSERVEROUTPUT.json',
            }
            , function (downloadId) {
              console.log('Download has begun, downId is:' + downloadId);
              console.log(data)
            });
      });
}