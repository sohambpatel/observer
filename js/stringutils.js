class StringUtils {

  static formatAsClassName(className) {
    className = (StringUtils.#format(className)).join('_');
    if (className.startsWith('_')) {
      className = className.replace('_', '');
    }
    return className;
  }

  static #format(className) {
    let formated = className;

    formated = formated.replace(/([^a-zA-Z])+/g, '_');

    formated = formated.replace(/^\_+|\_+$/g, '');

    const words = formated.split('_');
    for (let i = 0; i < words.length; i++) {
      if (words[i]) {
        words[i] = words[i].substring(0, 1).toUpperCase() + words[i].substring(
            1).toLowerCase();
      }
    }
    return words;
  }

  static truncate(str, max) {
    return str.length > max ? str.substr(0, max - 1) : str;
  }

  static replaceDash(str) {
    if (!str) {
      return '';
    }
    return str.replace(/[^a-zA-Z0-9]/g, '_')
  }

  static permute(array, length) {
    return array.flatMap((v, i) =>
        length > 1 ?
            StringUtils.permute(array.slice(i + 1), length - 1).map((w) => [v, ...w])
            :
            [[v]],
    );
  }
}
