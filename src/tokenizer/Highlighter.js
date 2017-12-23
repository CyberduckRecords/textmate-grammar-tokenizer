const Grammar = require('./Grammar')
const Tokenizer = require('./Tokenizer')

class Highlighter {
  constructor (lang) {
    this.language = lang
    this.grammar = new Grammar(lang)
    this.tokenizer = new Tokenizer(this.grammar)
  }

  escapeHTML (input) {
    let s = input
    s = s.replace('&', '&amp;')
    s = s.replace('<', '&lt;')
    s = s.replace('>', '&gt;')
    s = s.replace(/\t/g, '&nbsp;&nbsp;')
    s = s.replace(/ /g, '&nbsp;')
    return s
  }

  Highlight (input) {
    let tokens = this.tokenizer.TokenizeLines(input)
    let output = ''
    for (let t in tokens) {
      let token = tokens[t]
      output += `<span class="${token.captures.replace(/\./g, ' ')}">${this.escapeHTML(token.match)}</span>`
    }
    let lines = output.split(/\n/g)
    output = ''
    for (let l in lines) {
      output += `<div class="line" id="${l*1+1}">`
      if (!(/<span/.test(lines[l]))) {
        output += `<span class="html text">${lines[l]}</span>`
      } else {
        output += lines[l]
      }
      output += '</div>'
    }
    return output
  }
}

module.exports = Highlighter
