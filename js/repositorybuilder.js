class RepositoryBuilder {

  object = {
    action: null,
    window_name: null,
    current_url: null,
    ele_tagName: null,
    ele_type: null,
    txt_val: null,
    p_val: null,
    id: null,
    className: null,
    absolutexpath: null,
    absolutexpath1: null,
    relativexpath: null,
    cssSelector: null,
    keys: null,
    unique_id: null,
    name: null,
    filenames: null,
    multipleRealtiveXpath: [],
    hotkeyflag: false,
    linkText: null,
    webPageName: null,
    index: null,
  }

  withAction(action) {
    this.object.action = action;
    return this;
  }

  withWindowsName(windowsName) {
    this.object.window_name = windowsName
    return this;
  }

  withCurrentUrl(currentUrl) {
    this.object.current_url = currentUrl;
    return this;
  }

  withElementTagName(elementTagName) {
    this.object.ele_tagName = elementTagName;
    return this;
  }

  withElementType(elementType) {
    this.object.ele_type = elementType;
    return this;
  }

  withTextValue(textValue) {
    this.object.txt_val = textValue;
    return this;
  }

  withPValue(pValue) {
    this.object.p_val = pValue
    return this;
  }

  withId(id) {
    this.object.id = id;
    return this;
  }

  withClassName(className) {
    this.object.className = className;
    return this;
  }

  withAbsoluteXPath(absoluteXPath) {
    this.object.absolutexpath = absoluteXPath;
    return this;
  }

  withAbsoluteXPath1(absoluteXPath1) {
    this.object.absolutexpath1 = absoluteXPath1;
    return this;
  }

  withRelativeXPath(relativeXPath) {
    this.object.relativexpath = relativeXPath;
    return this;
  }

  withCssSelector(cssSelector) {
    this.object.cssSelector = cssSelector;
    return this;
  }

  withKeys(keys) {
    this.object.keys = keys;
    return this;
  }

  withUniqueId(uniqueId) {
    this.object.unique_id = uniqueId;
    return this;
  }

  withName(name) {
    this.object.name = name;
    return this;
  }

  withFileName(fileNames) {
    this.object.filenames = fileNames;
    return this;
  }

  withMultipleRelativeXPath(multipleXPaths) {
    this.object.multipleRealtiveXpath = multipleXPaths;
    return this;
  }

  withHotKeyFlag() {
    this.object.hotkeyflag = true;
    return this;
  }

  withLinkText(linkText) {
    this.object.linkText = linkText;
    return this;
  }

  withWebPageName(webPageName) {
    this.object.webPageName = webPageName;
    return this;
  }

  withIndex(index) {
    this.object.index = index;
    return this;
  }

  build() {
    return this.object;
  }
}
