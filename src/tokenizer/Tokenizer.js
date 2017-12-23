const CdRegExp = require('./CdRegExp')

class Tokenizer {
  constructor (grammar) {
    this.grammar = grammar
  }

  TokenizeLines (input) {
    let patterns = this.grammar.patterns
    let rest = input
    let prevRest = rest
    let tokens = []
    while (rest) { // keep running until rest is null, all tokens are matched
      for (let p in patterns) { // loop through all patterns
        let pattern = patterns[p] // set current pattern variable
        let subPatterns = pattern.patterns // set subPatterns
        let startRegex = null, endRegex = null, mainRegex = null // declare regex variables
        let startCaptures = [], endCaptures = [], mainCaptures = [] // declare capture variables
        if (pattern.start && pattern.end) { // set start/end variables if present in pattern
          startRegex = (new CdRegExp(pattern.start)).regex, startCaptures = pattern.startCaptures
          endRegex = (new CdRegExp(pattern.end)).regex, endCaptures = pattern.endCaptures
        } else { // set main variables if start/end not present in pattern
          mainRegex = (new CdRegExp(pattern.match)).regex, mainCaptures = pattern.captures
        }

        if (!mainRegex) { // if start/end regexes
          let startMatches = rest.match(startRegex) // match start regex
          if (startMatches) { // if start regex matched
            rest = rest.replace(new RegExp(startMatches[0]), '') // subtract match from input
            startMatches.shift(), delete startMatches['input'], delete startMatches['index'] // delete unwanted match items
            for (let m in startMatches) tokens.push({ // create tokens from match
              match: startMatches[m],
              captures: startCaptures[m]
            })

            if (subPatterns) { // check if pattern has subPatterns
              let subTokens = this.TokenizeSubPatterns(subPatterns, rest) // get tokens from subPatterns
              if (subTokens) {
                for (let s in subTokens.tokens) tokens.push(subTokens.tokens[s]) // add subTokens to tokens
                rest = subTokens.rest
              }
            }

            let endMatches = rest.match(endRegex) // match end regex
            if (endMatches) { // if end regex matched
              rest = rest.replace(new RegExp(endMatches[0]), '') // subtract match from input
              endMatches.shift(), delete endMatches['input'], delete endMatches['index'] // delete unwanted match items
              for (let m in endMatches) tokens.push({ // create tokens from match
                match: endMatches[m],
                captures: endCaptures[m]
              })
            } else { tokens.push({ // if end regex not matched, push invalid token
              match: rest,
              captures: 'invalid'
            }); rest = ''; }

          }

        } else { // if no start/end regexes
          let mainMatches = rest.match(mainRegex) // match main regex
          if (mainMatches) { // if mainRegex matched anything
            rest = rest.replace(new RegExp(mainMatches[0]), '') // subtract match from input
            mainMatches.shift(), delete mainMatches['input'], delete mainMatches['index'] // delete unwanted match items
            for (let m in mainMatches) tokens.push({ // create tokens from match
              match: mainMatches[m],
              captures: mainCaptures[m]
            })
          }
        }
      }
      if (prevRest == rest) {
        let invalidChar = rest.substring(0,1)
        tokens.push({
          match: invalidChar,
          captures: 'invalid'
        })
        rest = rest.substring(1)
      }
      prevRest = rest
    }
    return tokens // return all found tokens
  }

  TokenizeSubPatterns (subPatterns, input) {
    let subTokens = []
    let prevRest = input
    let rest = input
    while (rest) { // repeat script for as long as rest is a string
      for (let s in subPatterns) { // loop through subPatterns
        let subPattern = subPatterns[s] // declare subPattern variable
        if (subPattern.include) { // test if subPattern is an include
          let repositoryName = subPattern.include.replace(/#(.+)/, '$1') // get name of referenced repository
          let repositoryTokens = this.TokenizeRepository(repositoryName, rest) // get tokens from repository patterns
          for (let s in repositoryTokens.tokens) subTokens.push(repositoryTokens.tokens[s]) // add repositoryTokens to subTokens
          rest = repositoryTokens.rest // set rest variable to the rest from repositoryTokens
        }
      }
      if (prevRest == rest) return { tokens: subTokens, rest: rest } // return if no patterns match anymore
      prevRest = rest
    }
  }

  TokenizeRepository (name, input) {
    let repository = this.grammar.repository // get grammar's repository
    let tokens = []
    let rest = input
    let patterns = repository[name].patterns

    for (let p in patterns) { // same script as TokenizeLines
      let pattern = patterns[p]
      let subPatterns = pattern.patterns
      let startRegex = null, endRegex = null, mainRegex = null
      let startCaptures = [], endCaptures = [], mainCaptures = []
      if (pattern.start && pattern.end) {
        startRegex = (new CdRegExp(pattern.start)).regex, startCaptures = pattern.startCaptures
        endRegex = (new CdRegExp(pattern.end)).regex, endCaptures = pattern.endCaptures
      }
      else if (pattern.match) {
        mainRegex = (new CdRegExp(pattern.match)).regex, mainCaptures = pattern.captures
      }
      else {
        let repositoryName = pattern.include.replace(/#(.+)/, '$1')
        let repositoryTokens = this.TokenizeRepository(repositoryName, rest)
        rest = repositoryTokens.rest
        for (let t in repositoryTokens.tokens) tokens.push(repositoryTokens.tokens[t])
      }

      if (!mainRegex) {
        let startMatches = rest.match(startRegex) // match start regex
        if (startMatches) { // if start regex matched
          rest = rest.replace(new RegExp(startMatches[0]), '') // subtract match from input
          startMatches.shift(), delete startMatches['input'], delete startMatches['index'] // delete unwanted match items
          for (let m in startMatches) tokens.push({ // create tokens from match
            match: startMatches[m],
            captures: startCaptures[m]
          })

          if (subPatterns) { // check if pattern has subPatterns
            let subTokens = this.TokenizeSubPatterns(subPatterns, rest) // get tokens from subPatterns
            if (subTokens) {
              for (let s in subTokens.tokens) tokens.push(subTokens.tokens[s]) // add subTokens to tokens
              rest = subTokens.rest
            }
          }

          let endMatches = rest.match(endRegex) // match end regex
          if (endMatches) { // if end regex matched
            rest = rest.replace(new RegExp(endMatches[0]), '') // subtract match from input
            endMatches.shift(), delete endMatches['input'], delete endMatches['index'] // delete unwanted match items
            for (let m in endMatches) tokens.push({ // create tokens from match
              match: endMatches[m],
              captures: endCaptures[m]
            })
          } else { tokens.push({ // if end regex not matched, push invalid token
            match: rest,
            captures: 'invalid'
          }); rest = ''; }

        }

      } else { // if no start/end regexes
        let mainMatches = rest.match(mainRegex) // match main regex
        if (mainMatches) {
          rest = rest.replace(new RegExp(mainMatches[0]), '') // subtract match from input
          mainMatches.shift(), delete mainMatches['input'], delete mainMatches['index'] // delete unwanted match items
          for (let m in mainMatches) tokens.push({ // create tokens from match
            match: mainMatches[m],
            captures: mainCaptures[m]
          })
        }
      }
    }

    return { tokens: tokens, rest: rest }
  }

}

module.exports = Tokenizer
