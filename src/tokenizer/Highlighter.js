const Grammar = require('./Grammar')
const Tokenizer = require('./Tokenizer')

class Highlighter {
  constructor (lang, prefix='syntax') {
    this.prefix = prefix // prefix for all classes
    this.language = lang
    this.grammar = new Grammar(lang)
    this.tokenizer = new Tokenizer(this.grammar)
  }

  escapeHTML (input) {
    let s = input
    s = s.replace('&', '&amp;')
    s = s.replace('<', '&lt;')
    s = s.replace('>', '&gt;')
    s = s.replace(/ /g, '&nbsp;')
		s = s.replace(/\t/g, '&nbsp;&nbsp;')
    return s
  }

  Highlight (input) {
    const that = this
    let tokensPerLine = this.tokenizer.TokenizeLines(input)
    let output = []

    for (let tpl in tokensPerLine) {
      let tokens = tokensPerLine[tpl]
      output[tpl] = `<div class="line ${tpl}">`
      for (let t in tokens) {
        let token = tokens[t]
        output[tpl] += `<span class="${that.prefix+' '+token.captures.replace(/\./g,' ')}">${that.escapeHTML(token.match)}</span>`
      }
      output[tpl] += '</div>'
    }

    this.html = output

    return output
  }
}

module.exports = Highlighter
