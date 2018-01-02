const fs = require('fs'), path = require('path'), Tokenizer = require('./src/tokenizer/Tokenizer'), Grammar = require('./src/tokenizer/Grammar')
const grammar = new Grammar('html')
const tokenizer = new Tokenizer(grammar)
const code = fs.readFileSync(path.resolve(__dirname,'test.html'),'utf-8')

let start = new Date()
let tokensPerLine = tokenizer.TokenizeLines(code)
let end = new Date()

let time = end-start

let tokenCount = 0
for (let t in tokensPerLine) tokenCount += tokensPerLine[t].length

let tps = Math.round(tokenCount / time)

console.log(`Generated ${tokenCount} tokens for ${tokensPerLine.length} lines in ${time} ms (${tps} tokens/ms)`)
