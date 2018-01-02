const path = require('path')
const fs = require('fs')
const CdRegExp = require('./CdRegExp')

class Grammar {
  constructor (lang) {
    let grammar = this.loadGrammar(lang)
    this.name = grammar.name
    this.patterns = grammar.patterns
    this.repository = grammar.repository
  }

  loadGrammar (lang) {
    if (lang=='js'||lang=='es6') lang = 'javascript'
    let dir = path.resolve(__dirname, 'grammars', 'text')
    if (fs.existsSync(path.resolve(__dirname,'..','grammars',lang+'.json'))) dir = path.resolve(__dirname,'..','grammars',lang)
    let grammar = require(dir)
    let patterns = grammar.patterns
    let repository = grammar.repository
    let parsedGrammar = grammar

    for (let p in patterns) patterns[p] = this.parseRule(patterns[p])
    for (let p in repository) repository[p] = this.parseRule(repository[p])

    parsedGrammar.patterns = patterns
    parsedGrammar.repository = repository

    return parsedGrammar
  }

  parseRule (rule) {
    if (rule.start) rule.start = (new CdRegExp(rule.start)).regex
    if (rule.end) rule.end = (new CdRegExp(rule.end)).regex
    if (rule.match) rule.match = (new CdRegExp(rule.match)).regex
    if (rule.patterns) for (let p in rule.patterns) rule.patterns[p] = this.parseRule(rule.patterns[p])
    return rule
  }

}

module.exports = Grammar
