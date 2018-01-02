const CdRegExp = require('./CdRegExp')

class Tokenizer {
  constructor (grammar) {
    this.grammar = grammar
    this.tokensPerLine = []
    this.statePerLine = [{ pattern: 0 }]
  }

  escapeRegex (input) {
    let s = input
    s = s.replace(/([\|~.&^%$#@!*(){}\[\]/+=-_,?])/g, '\\$1')
    return s
  }

  TokenizeLines (input) {
    let lines = input.split('\n')
    let changedLines = []
    let state = { pattern: 0 }

    for (let l = 0, length = lines.length; l < length; l++) {
      let line = lines[l]
      state = this.statePerLine[l]
      state = this.TokenizeLine(line, l, state)
      this.statePerLine[l+1] = state
    }

    return this.tokensPerLine
  }

  TokenizeLine (input, line=0, state) {
    let patterns = this.grammar.patterns
    let rest = input
    let tokens = []
    let runs = 0

    while (rest) {

      let p = 0, length = 0
      let action = ''

      if (state && (state.pattern)) p = state.pattern
      if (state && (state.pos)) action = state.pos

      if (runs!=0) {
        p = 0
        action = ''
      }

      for (p, length = patterns.length; p < length; p++) {
        let pattern = patterns[p]
        let start, startCaptures, end, endCaptures, match, captures, subPatterns
        if (pattern.start && pattern.startCaptures && pattern.end && pattern.endCaptures) {
            start = pattern.start, startCaptures = pattern.startCaptures
            end = pattern.end, endCaptures = pattern.endCaptures
        }
        else if (pattern.match && pattern.captures) {
            match = pattern.match, captures = pattern.captures
        }
        if (pattern.patterns) subPatterns = pattern.patterns

        state = { pattern: p }

        if (match) {
          let matchMatches = rest.match(match)
          if (matchMatches) {
            rest = rest.substring(matchMatches[0].length)
            //rest = rest.replace(new RegExp(this.escapeRegex(matchMatches[0])),'')
            matchMatches.shift(), delete matchMatches['input'], delete matchMatches['index']
            for (let m = 0, matchMatchesLength = matchMatches.length; m < matchMatchesLength; m++) tokens.push({
              match: matchMatches[m],
              captures: captures[m]
            })
          }
          if (/^(\n$|$)/.test(rest)) rest = ''
          if (!rest) break
        }

        else {
          let startMatches = rest.match(start)
          if (action == 'subPattern' || action == 'end') startMatches = true
          if (startMatches) {

            if (action != 'subPattern' && action != 'end') {
              rest = rest.substring(startMatches[0].length)
              startMatches.shift(), delete startMatches['input'], delete startMatches['index']
              for (let m = 0, startMatchesLength = startMatches.length; m < startMatchesLength; m++) tokens.push({
                match: startMatches[m],
                captures: startCaptures[m]
              })
            }
            state = { pattern: p, pos: 'subPattern' }

            if (/^(\n$|$)/.test(rest)) rest = ''
            if (!rest) break

            if (subPatterns || (subPatterns && action=='subPattern' && action!='end')) {
              let subStuff = this.TokenizeSubPatterns(rest, subPatterns)
              rest = subStuff.rest
              tokens.push.apply(tokens,subStuff.tokens)
              state = { pattern: p, pos: 'subPattern' }
            }

            if (/^(\n$|$)/.test(rest)) rest = ''
            if (!rest) break

            let endMatches = rest.match(end)
            if (endMatches || (endMatches && action=='end')) {
              rest = rest.substring(endMatches[0].length)
              endMatches.shift(), delete endMatches['input'], delete endMatches['index']
              for (let m = 0, endMatchesLength = endMatches.length; m < endMatchesLength; m++) tokens.push({
                match: endMatches[m],
                captures: endCaptures[m]
              })
              state = { pattern: p }
              if (/^(\n$|$)/.test(rest)) rest = ''
              if (!rest) break
            } else {
              tokens.push({
                match: rest,
                captures: 'invalid'
              })
              rest = ''
              state = { pattern: p, pos: 'end' }
            }

          }
        }

      }
      runs++
    }

    this.tokensPerLine[line] = tokens

    return state
  }

  TokenizeSubPatterns (input, patterns) {
    let tokens = []
    let rest = input, prevRest = input

    while (true) {
      for (let p = 0, length = patterns.length; p < length; p++) {
        let pattern = patterns[p]
        let start, startCaptures, end, endCaptures, match, captures, subPatterns, include
        if (pattern.start && pattern.startCaptures && pattern.end && pattern.endCaptures) {
            start = pattern.start, startCaptures = pattern.startCaptures
            end = pattern.end, endCaptures = pattern.endCaptures
        }
        else if (pattern.match && pattern.captures) {
            match = pattern.match, captures = pattern.captures
        }
        if (pattern.patterns) subPatterns = pattern.patterns
        if (pattern.include) include = pattern.include

        if (include) {
          let reposiStuff = this.TokenizeRepository(include, rest)
          tokens.push.apply(tokens,reposiStuff.tokens)
          rest = reposiStuff.rest
        }

        if (match) {
          let matchMatches = rest.match(match)
          if (matchMatches) {
            rest = rest.substring(matchMatches[0].length)
            matchMatches.shift(), delete matchMatches['input'], delete matchMatches['index']
            for (let m = 0, matchMatchesLength = matchMatches.length; m < matchMatchesLength; m++) tokens.push({
              match: matchMatches[m],
              captures: captures[m]
            })
          }
          if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }
        }

        else {
          let startMatches = rest.match(start)
          if (startMatches) {
            rest = rest.substring(startMatches[0].length)
            startMatches.shift(), delete startMatches['input'], delete startMatches['index']
            for (let m = 0, startMatchesLength = startMatches.length; m < startMatchesLength; m++) tokens.push({
              match: startMatches[m],
              captures: startCaptures[m]
            })
            if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }

            if (subPatterns) {
              let subStuff = this.TokenizeSubPatterns(rest, subPatterns)
              tokens.push.apply(tokens,subStuff.tokens)
              rest = subStuff.rest
            }

            if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }

            let endMatches = rest.match(end)
            if (endMatches) {
              rest = rest.substring(endMatches[0].length)
              endMatches.shift(), delete endMatches['input'], delete endMatches['index']
              for (let m = 0, endMatchesLength = endMatches.length; m < endMatchesLength; m++) tokens.push({
                match: endMatches[m],
                captures: endCaptures[m]
              })
              if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }
            } else {
              tokens.push({
                match: rest,
                captures: 'invalid'
              })
              rest = ''
            }

          }
        }

      }

      if (prevRest == rest) return { tokens, rest }
      prevRest = rest
    }
  }

  TokenizeRepository (name, input) {
    let repository = this.grammar.repository
    let pattern = repository[name.substring(1)]
    let tokens = []
    let rest = input, prevRest = input

    while (true) {
      let start, startCaptures, end, endCaptures, match, captures, subPatterns
      if (pattern.start && pattern.startCaptures && pattern.end && pattern.endCaptures) {
        start = pattern.start, startCaptures = pattern.startCaptures
        end = pattern.end, endCaptures = pattern.endCaptures
      }
      else if (pattern.match && pattern.captures) {
        match = pattern.match, captures = pattern.captures
      }
      if (pattern.patterns) subPatterns = pattern.patterns

      if (subPatterns && !start && !end && !match) {
        let subStuff = this.TokenizeSubPatterns(rest, subPatterns)
        rest = subStuff.rest
        tokens.push.apply(tokens,subStuff.tokens)
      }

      if (match) {
        let matchMatches = rest.match(match)
        if (matchMatches) {
          rest = rest.substring(matchMatches[0].length)
          matchMatches.shift(), delete matchMatches['input'], delete matchMatches['index']
          for (let m = 0, matchMatchesLength = matchMatches.length; m < matchMatchesLength; m++) tokens.push({
            match: matchMatches[m],
            captures: captures[m]
          })
        }
        if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }
      }

      else {
        let startMatches = rest.match(start)
        if (startMatches) {
          rest = rest.substring(startMatches[0].length)
          startMatches.shift(), delete startMatches['input'], delete startMatches['index']
          for (let m = 0, startMatchesLength = startMatches.length; m < startMatchesLength; m++) tokens.push({
            match: startMatches[m],
            captures: startCaptures[m]
          })
          if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }

          if (subPatterns) {
            let subStuff = this.TokenizeSubPatterns(rest, subPatterns)
            tokens.push.apply(tokens,subStuff.tokens)
            rest = subStuff.rest
          }

          if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }

          let endMatches = rest.match(end)
          if (endMatches) {
            rest = rest.substring(endMatches[0].length)
            endMatches.shift(), delete endMatches['input'], delete endMatches['index']
            for (let m = 0, endMatchesLength = endMatches.length; m < endMatchesLength; m++) tokens.push({
              match: endMatches[m],
              captures: endCaptures[m]
            })
            if (!rest || /^(\n$|$)/.test(rest)) return { tokens, rest }
          } else {
            tokens.push({
              match: rest,
              captures: 'invalid'
            })
            rest = ''
          }

        }
      }

      if (prevRest == rest) return { tokens, rest }
      prevRest = rest
    }
  }

}

module.exports = Tokenizer
