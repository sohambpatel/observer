class MobileRecording {
  CONTAINER;
  PHONE_ACTION_BUTTON_PANEL;
  RELOAD_ELEMENT;
  TAP_ELEMENT;
  action;
  windowInputName;
  mobileMainEventListener;
  previousUniqueId;
  swipeCoord = {initial: null, end: null};
  isSwipeActive = false;
  sendKeysValue;

  constructor() {
    this.CONTAINER = document.getElementById('screenshotContainer');
    this.PHONE_ACTION_BUTTON_PANEL = this.CONTAINER.firstChild.lastElementChild;
    this.RELOAD_ELEMENT = document.getElementById('btnReload');
    this.TAP_ELEMENT = document.getElementById('btnTapElement');
  }

  setupMobileRecording() {
    console.log('Start Recording');
    this.windowInputName = 'HomePage';
    this.mobileMainEventListener = (e) => this.#buildMainEventListener(e);
    document.addEventListener('click', this.mobileMainEventListener, false);
  }

  #buildMainEventListener(e) {
    this.action = '';
    this.sendKeysValue = '';
    if (document.URL !== APPIUM_INSPECTOR_URL || e.target == null) {
      return;
    }

    if (this.CONTAINER === e.target || this.CONTAINER.contains(e.target)) {
      if (this.PHONE_ACTION_BUTTON_PANEL.contains(e.target)) {
        const currentValue =
          this.PHONE_ACTION_BUTTON_PANEL.firstChild.getAttribute('value');
        if (currentValue === 'swipe') {
          this.isSwipeActive = true;
        } else {
          this.swipeCoord = {initial: null, end: null};
          this.isSwipeActive = false;
        }
        return;
      }

      if (this.isSwipeActive && this.swipeCoord.end == null) {
        console.log('SwipeActived');
        const coordinatesContainer =
          MobileRecording.#getElementByXpath(
            '//*[@class="_coordinatesContainer_c3e46"]');
        const currentX =
          coordinatesContainer.firstChild.textContent.split(' ')[1];
        const currentY =
          coordinatesContainer.lastElementChild.textContent.split(' ')[1];
        const currentCoord = {x: currentX, y: currentY};
        if (this.swipeCoord.initial == null) {
          this.swipeCoord.initial = currentCoord;
          return;
        }
        this.swipeCoord.end = currentCoord;
        this.action = 'swipe';
        this.#processEvent(e, '');
        this.swipeCoord = {initial: null, end: null};
        return;
      }

      this.action = 'click';
      this.#processEvent(e, '');
    } else if (this.RELOAD_ELEMENT === e.target || this.RELOAD_ELEMENT.contains(
      e.target)) {
      this.#processReload();
    } else if (this.TAP_ELEMENT === e.target || this.TAP_ELEMENT.contains(
      e.target)) {
      this.action = 'tap';
      this.#processTap();
    } else if (MobileRecording.#getConfirmSendKeysButton() != null &&
      (MobileRecording.#getConfirmSendKeysButton() === e.target ||
        MobileRecording.#getConfirmSendKeysButton().contains(e.target))
    ) {
      this.action = 'change';
      this.#processEvent(e, MobileRecording.#getSendKeysValue());
    }
  }

  #processEvent(e, sendkeysval) {
    try {
      let objectRepoBuilder = new ObjectRepoBuilder(
        MobileRecording.#getPropertyValues(), this.action, this.windowInputName,
        sendkeysval, this.previousUniqueId, this.swipeCoord);
      let objectRepo = objectRepoBuilder.getObjectRepo();
      let uniqueId = objectRepo.unique_id;

      if (uniqueId !== '') {
        this.previousUniqueId = uniqueId;
        console.log(objectRepo);
        console.log(
          '-----------------------------------------------------------------',
        );
        chrome.runtime.sendMessage({message: 'data', objectRepo});
      }
    } catch (error) {
      console.log(error);
    }
  }

  static #getPropertyValues() {
    const trgt = document.getElementById('selectedElementContainer');
    const obj_p_val = trgt.textcontent || trgt.innerText || trgt.value;
    return obj_p_val.split('\n');
  }

  static #getConfirmSendKeysButton() {
    return MobileRecording.#getElementByXpath(
      '//button[@class="ant-btn ant-btn-primary"]');
  }

  static #getSendKeysValue() {
    return MobileRecording.#getElementByXpath(
      `//input[@type='text' and @class='ant-input']`)
      .value;
  }

  static #getElementByXpath(xPath) {
    return document.evaluate(
      xPath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    ).singleNodeValue;
  }

  #processReload() {
    this.windowInputName = window.prompt('Add page name:',
      this.windowInputName);
    if (this.windowInputName != null) {
      this.windowInputName = formatClass(this.windowInputName);
    }
  }

  #processTap() {
    this.windowInputName = window.prompt('Add page name:',
      this.windowInputName);
    if (this.windowInputName != null) {
      this.windowInputName = formatClass(this.windowInputName);
    }
  }

  tearDownMobileRecording() {
    this.isSwipeActive = false;
    if (this.mobileMainEventListener == null) {
      return;
    }
    document.removeEventListener('click', this.mobileMainEventListener);
  }
}
