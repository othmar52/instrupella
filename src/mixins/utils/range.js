// // thanks to https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range#8273091
export default () => {
  const range = (start, stop, step = 1) => {
    if (typeof stop === 'undefined') {
      // one param defined
      stop = start
      start = 0
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return []
    }

    const result = []
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i)
    }
    return result
  }
  return {
    range
  }
}
