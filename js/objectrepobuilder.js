class ObjectRepoBuilder {

  values;
  sendKeysValue;
  action;
  windowsName;
  swipeCoords;

  constructor(values, action, windowsName, sendKeysValue, previousUniqueId,
    swipeCoords) {
    this.values = values;
    this.action = action;
    this.windowsName = windowsName;
    this.sendKeysValue = sendKeysValue;
    this.previousUniqueId = previousUniqueId;
    this.swipeCoords = swipeCoords;
  }

  getObjectRepo() {
    const tagName = this.#getValue('label');
    const txtValue = this.sendKeysValue || this.#getValue('text');
    const id = this.#getValue('id');
    const className = this.#getValue('class');
    const name = this.#getValue('name');

    const index = this.#getValue('index');
    const elementId = this.#getValue('elementId');
    let unique_id = this.sendKeysValue !== '' ? this.previousUniqueId :
      ObjectRepoBuilder.#getUniqueId(
        id,
        index,
        txtValue,
        className,
        elementId,
        name,
      );
    const ios_class_chain = this.#getValue('-ios class chain (docs)');
    const ios_predicate_string = this.#getValue(
      '-ios predicate string (docs)');
    const multipleRelativeXpath = [];
    multipleRelativeXpath=this.#getMultipleXpath(
      className,
      name,
      tagName,
      txtValue,
      this.#getValue('resource-id'),
      this.#getValue('content-desc'),
    );
   

    unique_id = ObjectRepoBuilder.#formatUniqueID(unique_id);

    return {
      action: this.action,
      window_name: this.windowsName,
      current_url: '',
      ele_tagName: tagName,
      ele_type: this.#getValue('type'),
      txt_val: txtValue,
      p_val: txtValue,
      id: id,
      className: className,
      absolutexpath: this.#getValue('xpath'),
      relativexpath: ObjectRepoBuilder.#getRelative(),
      cssSelector: this.#getCSS(),
      keys: '',
      unique_id: unique_id,
      name: name,
      filenames: null,
      multipleRelativeXpath: multipleRelativeXpath,
      hotkeyflag: false,
      linkText: null,
      webPageName: null,
      index: index,
      elementId: elementId,
      package: this.#getValue('package'),
      ios_class_chain: ios_class_chain,
      ios_predicate_string: ios_predicate_string,
      coord: ObjectRepoBuilder.#areCoordsAvailable(this.swipeCoords) ?
        [this.swipeCoords.initial.x, this.swipeCoords.initial.y,
          this.swipeCoords.end.x, this.swipeCoords.end.y] : [],
    };
  }

  #getValue(key) {
    for (let i = 0; i < this.values.length; i++) {
      if ((this.values)[i] === key) {
        return (this.values)[i + 2];
      }
    }
    return '';
  }

  static #getUniqueId(
    id,
    index,
    objTextValue,
    objClassName,
    elementId,
    objName,
  ) {
    try {
      if ('' != id) {
        id = StringUtils.truncate(id.toString().replace(/ /g, '_'), 15);
        return id.toLowerCase() + index.toLowerCase();
      }
      if ('' != objTextValue) {
        objTextValue = StringUtils.truncate(objTextValue.toString().replace(/ /g, '_'), 15);
        return objTextValue.toLowerCase() + index.toLowerCase();
      } else if ('' != index && '' != objName) {
        objName = StringUtils.truncate(objName.toString().replace(/ /g, '_'), 15);
        return objName.toLowerCase() + index.toLowerCase();
      } else if ('' != index && '' != objClassName) {
        objClassName = objClassName.toLowerCase().replace('.', '_');
        return objClassName + index.toLowerCase();
      } else if ('' != index) {
        return index.toLowerCase();
      } else if ('' != elementId) {
        return elementId.replace('-', '_');
      }
    } catch (error) {
      return objClassName + index.toLowerCase();
    }
  }

  #getMultipleXpath(
    objClassName,
    objName,
    objTagName,
    objTextValue,
    objResourceId,
    objContentDesc,
  ) {
    const xPaths = [];
    const prefix =
      objTagName !== '' ? objTagName : (objClassName = !'' ? objClassName
        : '*');

    const availableAttrs = ObjectRepoBuilder.#buildAvailableAttributes(
      objName,
      objTextValue,
      objResourceId,
      objContentDesc,
    );

    const buildXPath = function(attr) {
      return `//${prefix}[${attr}]`;
    };

    for (let i = 1; i <= availableAttrs.length; i++) {
      StringUtils.permute(availableAttrs, i).forEach((x) =>
        xPaths.push(buildXPath(`${x.join(' and ')}`)),
      );
    }
    return xPaths;
  }

  static #buildAvailableAttributes(
    objName,
    objTextValue,
    objResourceId,
    objContentDesc,
  ) {
    const attrs = [];

    if (objTextValue !== '') {
      attrs.push(`@text=\"${objTextValue}\"`);
    }

    if (objName !== '') {
      attrs.push(`@name=\"${objName}\"`);
    }

    if (objResourceId !== '') {
      attrs.push(`@resource-id=\"${objResourceId}\"`);
    }

    if (objContentDesc !== '') {
      attrs.push(`@content-desc=\"${objContentDesc}\"`);
    }

    return attrs;
  }

  static #formatUniqueID(uniqueId) {
    uniqueId = uniqueId.replace(/[^a-zA-Z0-9 ]/g, '');
    if (/^[0-9]+$/.test(uniqueId)) {
      uniqueId = 'id' + uniqueId;
    }
    return uniqueId;
  }

  #getCSS() {
    return this.#getValue('xpath').substring(1).replace('/', ' > ');
  }

  static #getRelative() {
    return '';
  }

  static #areCoordsAvailable(swipeCoord) {
    return swipeCoord.initial != null && swipeCoord.end != null;
  }
}
