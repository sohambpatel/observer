'use strict';

document.getElementById('start').addEventListener('click', function(e) {
  alert('OBSERVER ACTIVATED!');
  chrome.runtime.sendMessage({message: 'start'});
});

document.getElementById('stop').addEventListener('click', function(e) {
  alert('OBSERVER DEACTIVATED!');
  chrome.runtime.sendMessage({message: 'stop'});
});