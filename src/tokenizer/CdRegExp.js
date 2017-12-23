class CDRegExp {
  constructor (regex) {
    let flagRegex = /([(][?][igmyu]+[)])(.+)/
    let flag = '', regexp = regex
    if (flagRegex.test(regex)) flag = regex.replace(flagRegex, '$1'); regexp = regex.replace(flagRegex, '$2')
    this.regex = new RegExp('^' + regexp, flag)
    this.flag = flag
    this.rawRegex = regexp
  }
}

module.exports = CDRegExp
