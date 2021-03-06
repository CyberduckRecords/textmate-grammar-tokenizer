# Textmate Grammar Tokenizer
As the name suggests, this is a tokenizer that makes use of textmate format grammars (in json format) using  javascript. Which is browser compatible. If you have any suggestions, issues or improvements for this system please post them in the issues section, because this system is far from perfect.
This might also be turned in to an editor in the future.

###### For any of these scripts to work, make sure the folder structure looks like this, or you can edit the filepaths.
```
|-- src
  |- main.js // main js file
  |- tokenizer
    |- Tokenizer.js
    |- Grammar.js
    |- CdRegExp.js
    |- Highlighter.js
  |- grammars
    |- html.json
```

### Highlighter Usage
This script was mainly created to do syntax highlighting, so there is also a Highlighter class supplied.
```javascript
const Highlighter = require( './tokenizer/Highlighter')
let highlighter = new Highlighter('html')
let code = `<template lang="html">
  <div id="app" class="test">App</div>
</template>`

let highlightedLines = highlighter.Highlight(code)
```

'highlightedLines' returns an array with these content:
```html
[
  <div class="line LINENUM">                       // for all lines
    <span class="TOKEN CLASSES">TOKEN MATCH</span> // for all tokens in line
  </div>
]
```

### Tokenizer Usage
```javascript
const Grammar = require('./tokenizer/Grammar')
const Tokenizer = require('./tokenizer/Tokenizer')
let grammar = new Grammar('html')
let tokenizer = new Tokenizer(grammar)
let code = `<template lang="html">
  <div id="app" class="test">App</div>
</template>`

let tokens = tokenizer.TokenizeLines(code)
```

'tokens' returns:
```json
[
  {
    "match": "MATCH VALUE",
    "captures": "CLASS1.CLASS2.CLASS3..."
  }
]
```

Currently the grammars are in the format of:
```json
{
  "name": "html",
  "patterns": [
    {
      "include": "#whitespace"
    },
    {
      "start": "(<\/?)(.+)",
      "startCaptures": [
        "html.punctuation.start",
        "html.tag"
      ],
      "end": "(>)",
      "endCaptures": [
        "html.punctuation.end"
      ],
      "patterns": [
        {
          "include": "#whitespace"
        }
      ]
    }
  ],
  "repository": {
    "whitespace": {
      "match": "([\\s]+)",
      "captures": [
        "whitespace"
      ]
    }
  }
}
```

### Todo List:
* `Add More Grammars`
* `Turn into fully working editor`
