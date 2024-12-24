class WebRecording {

  temporalObjectRepository = {};
  dragTemporalObjectRepository = {};
  changeEventObjectRepository = {};
  keys = [];
  listeners = [];

  constructor() {
    this.temporalObjectRepository.tempobjectDetails = [];
    this.dragTemporalObjectRepository.dragtempobjectDetails = [];
    this.changeEventObjectRepository.changeeventobjectDetails = [];
  }

  start() {
    console.log('recording started');
    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.setupConditionListener('focusin', changeAction, true);
    this.setupConditionListener('focusout', changeAction, true);
    this.setupConditionListener('click', clickAction, false)
    this.setupConditionListener('change', changeAction, false)
    this.setupListener('keyup', false);
    this.setupListener('keydown', false);
    this.setupConditionListener('mousedown', mouseDownAction, false)
    this.setupListener('dragleave', false);
  }

  setupConditionListener(type, condition, options) {
    let listener = ev => {
      if (condition(ev)) {
        this.processEvent(ev)
      }
    };
    this.listeners.push({type, listener, options})
    document.addEventListener(type, listener, options)
  }

  setupListener(type, options) {
    let listener = (e) => {
      this.processEvent(e);
    };
    this.listeners.push({type, listener, options})
    document.addEventListener(type, listener, options);
  }

  processEvent(e) {
    const evt = e || document.event;

    if (!evt) {
      return;
    }
    if (evt.isPropagationStopped && evt.isPropagationStopped()) {
      return;
    }
    const target = evt.target ? evt.target : window;

    if ((target.tagName).localeCompare('HTML') === 0) {
      target.style.outline = 'solid red 2px';
      return;
    }
    WebRecording.#changeElementBorderColor(target);
    const eventType = evt.type ? evt.type : evt;
    let objectRepository = this.buildRepositoryBuilder(eventType, target,
        evt).build();

    let processedObjectRepository = this.postProcessObjectRepository(
        objectRepository, target);

    if (['click', 'change', 'mousedown', 'hotkey',
          'focusin'].includes(processedObjectRepository.action)
        && this.changeEventObjectRepository.changeeventobjectDetails.length
        === 0) {
      console.log(JSON.stringify(processedObjectRepository));
      console.log(
          '---------------------------------------------------------------------');
      chrome.runtime.sendMessage(
          {message: 'data', object: processedObjectRepository});
    }

  }

  static #changeElementBorderColor(target) {
    target.style.border = 'solid red 2px';
  }

  buildRepositoryBuilder(eventType, target, evt) {
    let repositoryBuilder = new RepositoryBuilder();
    repositoryBuilder
    .withAction(eventType)
    .withWindowsName(document.title)
    .withCurrentUrl(document.URL)
    .withElementType(target.type)
    .withPValue(target.textcontent || target.innerText)
    .withId(target.id || '')
    .withWebPageName(WebRecording.#buildPageName())
    .withName(target.getAttribute('name') || '')
    .withAbsoluteXPath1(HtmlUtils.getAbsoluteXPath1(target))
    .withRelativeXPath(HtmlUtils.getRelativeXpath(target))
    .withMultipleRelativeXPath(HtmlUtils.buildMultipleRelativeXPath(target))
    .withCssSelector(HtmlUtils.getCSSSelector(target))
    .withKeys(evt.code)
    .withUniqueId(StringUtils.replaceDash(WebRecording.#buildUniqueId(target)))
    .withClassName(
        WebRecording.#buildClassName(target.getAttribute('class') || ''))
    .withFileName(WebRecording.#buildFileNames(target))
    .withIndex(WebRecording.#getIndex(target))

    let textValue = WebRecording.#getTextValue(target);
    repositoryBuilder.withTextValue(textValue);
    let tagName = target.tagName || '';
    repositoryBuilder.withElementTagName(tagName)
    if (tagName.toLowerCase() === "a") {
      repositoryBuilder.withLinkText(textValue);
    }
    return repositoryBuilder;
  }

  static #buildPageName() {
    const windowsName = document.title;
    const url = new URL(document.URL)
    const hash = window.location.hash;
    let page = hash !== '' ? hash : (url.pathname !== '') ? url.pathname
        : windowsName;
    page = StringUtils.formatAsClassName(page);
    return page === '' ? StringUtils.formatAsClassName(windowsName) : page;
  }

  static #buildUniqueId(target) {
    let obj_tagName = (target.tagName || '').toLowerCase();
    let obj_id = target.id || '';
    let obj_className = target.getAttribute('class') || '';
    let obj_name = target.getAttribute('name') || '';
    let obj_txt_val = target.textcontent || target.innerText;
    try {

      if (obj_tagName === 'td') {
        return obj_tagName + WebRecording.#getIndex(target);
      } else if (obj_id) {
        return obj_tagName + '_' + obj_id.replace(/ /g, '');
      } else if (obj_name) {
        return obj_tagName + WebRecording.#getIndex(target)
            + '_'
            + obj_name.toLowerCase();
      } else if (obj_txt_val) {
        return obj_tagName + WebRecording.#getIndex(target)
            + '_'
            + StringUtils.truncate(
                obj_txt_val.toString().replace(/ /g, '_'), 13);
      } else {
        return obj_tagName + WebRecording.#getIndex(target)
            + '_'
            + StringUtils.truncate(
                obj_className.toString().replace(/ /g, '_'), 4);
      }
    } catch (error) {
      return obj_tagName + WebRecording.#getIndex(target);
    }
  }

  static #getIndex(el) {
    let nodeList = document.querySelectorAll(el.tagName);
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i] === el) {
        return i;
      }
    }
    return uid_1;
  }

  static #buildClassName(className) {
    if (!className || className.includes('{0}')) {
      console.log(`[DEBUG] Not a classname [${className}]`);
      return '';
    }
    return className
  }

  static #getTextValue(target) {
    if ('select' === target.tagName.toLowerCase()) {
      return WebRecording.#processTextValue(
          target.options[target.selectedIndex])
    }
    let eventType = target.type;
    let textValue = target.type === 'checkbox' ? (eventType !== 'change'
    ^ target.checked === true ? 'true' : 'false') : target.value
        || target.innerText;
    if (eventType === 'password') {
      return this.#encryptToBase64(textValue);
    }
    return textValue;
  }

  static #processTextValue(option) {
    let t = option.replace(/^ *(.*?) *$/, '$1');
    return t.match(/\xA0/) ? t.replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g,
        function (e) {
          return '\\' + e;
        }).replace(/\s+/g, function (e) {
      return e.match(/\xA0/) ? e.length > 1 ? '\\s+' : '\\s' : e;
    }) : t;
  }

  static #encryptToBase64(input) {
    let userPassword = window.btoa(input);
    let key = window.btoa('random');
    let reversed = userPassword.normalize('NFC').split('').reverse().join('');
    return key.substring(0, key.length / 2) + reversed + key.substring(
        (key.length / 2), key.length);
  }

  static #buildFileNames(target) {
    let type = target.type;
    let fileNameArr = [];
    if ('input' === target.tagName.toLowerCase() && type === 'file'
        && target.multiple) {
      for (let i = 0; i < target.files.length; ++i) {
        fileNameArr.push(target.files.item(i).name);
      }

    }
    return fileNameArr;
  }

  postProcessObjectRepository(object, event) {
    const eventType = event.type ? event.type : event;

    if (eventType === 'keydown') {
      this.processKeyDown(object, event);
    }

    if (eventType === 'keyup') {
      this.processKeyUp(object);
    }
    return object;
  }

  processKeyDown(object, event) {
    if (object['keys'] === 'Tab' || object['keys'] === 'Enter' && 'textarea'
        !== event.target.type) {  //no textarea because textarea consider enter as new line and not any navigation action
      object['keys'] = (object['keys']);
      object['action'] = 'hotkey';
    }
    if (!this.keys.includes(object['keys'])) {
      this.keys.push(object['keys']);
    }
    this.temporalObjectRepository.tempobjectDetails.push(object);
  }

  processKeyUp(object) {
    for (let i = this.temporalObjectRepository.tempobjectDetails.length - 1;
        i > 0;
        i--) {
      if (this.temporalObjectRepository.tempobjectDetails[i]['action']
          === 'keydown') {
        this.keys.push(
            this.temporalObjectRepository.tempobjectDetails[i]['keys']);
        this.temporalObjectRepository.tempobjectDetails.splice(i, 1);
      }
    }
    this.keys = [...new Set(this.keys)];
    if (this.keys.includes('Meta') ||
        this.keys.includes('Alt') ||
        this.keys.includes('Control')
    ) {
      object['action'] = 'hotkey';
      object['keys'] = this.keys.join('+');
    }
    this.keys = [];
    this.temporalObjectRepository.tempobjectDetails = [];
  }

  stop() {
    this.listeners.forEach(
        ({type, listener, options}) => document.removeEventListener(type,
            listener, options))
  }
}
