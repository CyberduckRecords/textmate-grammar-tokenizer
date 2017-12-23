const path = require('path')

class Grammar {
  constructor (lang) {
    let grammar = this.loadGrammar(lang)
    this.name = grammar.name
    this.patterns = grammar.patterns
    this.repository = grammar.repository
  }

  loadGrammar (lang) {
    let dir = path.resolve(__dirname, '..', 'grammars', lang)
    return require(dir)
  }

}

module.exports = Grammar
