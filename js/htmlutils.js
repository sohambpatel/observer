class HtmlUtils {

  static getAbsoluteXPath1(el) {
    let nodeElem = el;

    const parts = [];
    while (nodeElem && nodeElem.nodeType === Node.ELEMENT_NODE) {
      let nbOfPreviousSiblings = 0;
      let hasNextSiblings = false;
      let sibling = nodeElem.previousSibling;
      while (sibling) {
        if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName
          === nodeElem.nodeName) {
          nbOfPreviousSiblings++;
        }
        sibling = sibling.previousSibling;
      }
      sibling = nodeElem.nextSibling;
      while (sibling) {
        if (sibling.nodeName === nodeElem.nodeName) {
          hasNextSiblings = true;
          break;
        }
        sibling = sibling.nextSibling;
      }
      const prefix = nodeElem.prefix ? nodeElem.prefix + ':' : '';
      const nth = nbOfPreviousSiblings || hasNextSiblings
        ? `[${nbOfPreviousSiblings + 1}]` : '';
      parts.push(prefix + nodeElem.localName + nth);
      nodeElem = nodeElem.parentNode;
    }
    return parts.length ? '/' + parts.reverse().join('/') : '';

  }

  static getRelativeXpath(el) {
    try {
      if (typeof el == "string") {
        return document.evaluate(el, document, null, 0,
          null)
      }
      if (!el || el.nodeType !== 1) {
        return ''
      }
      if (el.id) {
        return "//" + el.tagName + "[@id='" + el.id + "']"
      }
      if (el.parentNode === null) {
        return '';
      }
      let sames = [].filter.call(el.parentNode.children, function (x) {
        return x.tagName === el.tagName
      })
      return HtmlUtils.getRelativeXpath(el.parentNode) + '/'
        + el.tagName.toLowerCase() + (sames.length > 1 ? '['
          + ([].indexOf.call(sames, el) + 1) + ']' : '')
    } catch (error) {
      return '';
    }
  }

  static getCSSSelector(el) {
    let names = [];
    while (el.parentNode) {
      if (el.id) {
        names.unshift('#' + el.id);
        break;
      } else {
        if (el === el.ownerDocument.documentElement) {
          names.unshift(el.tagName);
        } else {
          let c, e;
          for (c = 1, e = el; e.previousElementSibling;
            e = e.previousElementSibling, c++) {
          }
          names.unshift(el.tagName + ":nth-child(" + c + ")");
        }
        el = el.parentNode;
      }
    }
    return names.join(" > ");
  }

  static buildMultipleRelativeXPath(element) {
    element = this.getWorkableElement(element);
    const tagName = element.tagName.toLowerCase();
    const toXPath = (attributes) => `//${tagName}[${attributes}]`;
    const availableAttributes = this.#buildAvailableAttributes(element);
    const xPaths = []
    const text_val = element.textcontent || element.innerText;
    console.log(text_val);
    if (text_val != '') {
      var xpath = '//' + tagName + `[text()='${text_val}']`;
      if (!xPaths.includes(xpath))
        xPaths.push(xpath);
    }
    for (let i = 0; i < availableAttributes.length; i++) {
      StringUtils.permute(availableAttributes, i).forEach(
        (x) => this.pushToArr(xPaths,toXPath(`${x.join(' and ')}`))
      );
    }
    if (xPaths.length === 0) {
      xPaths.push(HtmlUtils.getRelativeXpath(element));
      return xPaths
    }
    return xPaths;
  }
  static pushToArr(xPaths, val) {
    if (!xPaths.includes(val))
      xPaths.push(val);
    return xPaths;
  }
  static getWorkableElement(elm) {
    let eleTagName = elm.tagName.toLowerCase();
    let attrs = elm.attributes;
    if (elm.tagName.toLowerCase().localeCompare("svg", undefined,
      { sensitivity: 'accent' })
      === 0) {
      let counter = 0;
      while (counter < 5) {
        elm = elm.parentNode
        attrs = elm.attributes;
        eleTagName = elm.tagName.toLowerCase();
        if (attrs.getNamedItem("id") || attrs.getNamedItem("class")
          || attrs.getNamedItem("name")) {
          counter++;
          break;
        }
      }
    } else if (attrs.getNamedItem("for")) {
      elm = elm.previousElementSibling
    }
    return elm;
  }

  static #buildAvailableAttributes(element) {
    const attributes = HtmlUtils.#namedNodeMapToList(element.attributes);
    const supportedAttributes = ['type', 'id', 'class', 'name', 'aria-label',
      'href', 'label', 'placeholder', 'alt', 'title', 'src'];
    let availableAttributes = attributes.filter(
      a => supportedAttributes.includes(a.name)).map(
        a => `@${a.name}='${a.value}'`);
    const text_val = element.textcontent || element.innerText;
    if (text_val !== '') {
      availableAttributes.push(`contains(.,'${text_val}')`);
    }
    return availableAttributes;
  }

  static #namedNodeMapToList(attributes) {
    const list = [];
    for (let i = 0; i < attributes.length; i++) {
      list.push(attributes[i]);
    }
    return list;
  }

  static #lookupElementByXPath(path) {
    try {
      let query = document.evaluate(path, document, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      return Array(query.snapshotLength).fill(0).map(
        (element, index) => query.snapshotItem(index));
    } catch (error) {
      return []
    }
  }
}
