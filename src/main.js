const fs = require('fs'), path = require('path')
const Highlighter = require( './tokenizer/Highlighter')
let highlighter = new Highlighter('html')
let code = fs.readFileSync(path.resolve(__dirname,'..','..','cd-code','src','program','test.html'),'utf-8')

let start = new Date()

let highlightedLines = highlighter.Highlight(code)

let end = new Date()

console.log(end-start)

//for (let l in highlightedLines) document.write(highlightedLines[l])

let stylesheet = `
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto Mono'), local('RobotoMono-Regular'), url(https://fonts.gstatic.com/s/robotomono/v5/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
}
#highlighted {
  --blue            : #4D88FF;
  --orange          : #FF7A00;
  --green           : #44CC00;
  --red             : #F23D33;
  --cyan            : #00F288;
  --lighblue        : #00E0E9;
  --very-light-grey : #E0E0E0;
  --light-grey      : #ADADAD;
  --grey            : #7F7F7F;
  --dark-grey       : #515151;
  --very-dark-grey  : #1E1E1E;
}
#highlighted {
  font-family: 'Roboto Mono', monospace;
  font-size: 20px;
  font-weight: 500;
  background:var(--very-dark-grey);
  color: var(--very-light-grey);
  white-space: pre;
}
.line {
  height: 30px;
}
.html.tag {
  color: var(--blue);
}
.html.punct,
.html.punctuation {
  color: var(--very-light-grey);
}
.html.punctuation.string {
  color: var(--cyan);
}
.html.string {
  color: var(--orange)
}
.html.entity {
  color: var(--blue);
}
.html.entity.punct {
  color: var(--very-light-grey);
}
.invalid {
  background: var(--red);
  border-radius: 3px;
}
`

let highlighted = ''
for (let l in highlightedLines) highlighted += highlightedLines[l]
document.querySelector('div#highlighted').innerHTML = highlighted

fs.writeFileSync('./src/stylesheet.css', stylesheet)

let link = document.createElement('link')
link.setAttribute('rel', 'stylesheet')
link.setAttribute('href', './stylesheet.css')

document.head.append(link)
