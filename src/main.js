const fs = require('fs')
const Highlighter = require( './tokenizer/Highlighter')
let highlighter = new Highlighter('html')
let code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1, user-scalable=no, minimal-ui">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="highlighted">
    stuff
  </div>
  <script src="main.js" charset="utf-8"></script>
</body>
</html>`

let highlighted = highlighter.Highlight(code)

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

document.querySelector('div#highlighted').innerHTML = highlighted

fs.writeFileSync('./src/stylesheet.css', stylesheet)

let link = document.createElement('link')
link.setAttribute('rel', 'stylesheet')
link.setAttribute('href', './stylesheet.css')

document.head.append(link)
