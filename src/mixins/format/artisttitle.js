export default () => {
  const replaceDividers = (string) => {
    return string
      .replaceAll(',', '<span class="text-muted">,</span>')
      .replaceAll('&', '<span class="text-muted">&</span>')
      .replaceAll(' ft. ', ' <span class="text-muted">ft.</span> ')
  }
  const formatArtistTitle = (track) => {
    if (track === null) {
      return ''
    }
    const beat = (track.beat)
      ? `<span class="text-danger">${track.beat}</span>`
      : ''
    const a = (track.artist) ? track.artist.trim() : ''
    const t = (track.title) ? track.title.trim() : ''
    if (`${a}${t}` === '') {
      return replaceDividers(
        track.path.split('/').slice(-1).join('/').split('.').slice(0, -1).join('.') + beat
      )
    }
    if (a.toLowerCase() === t.toLowerCase() && a !== '') {
      return replaceDividers(a) + beat
    }
    if (a !== '' && t !== '') {
      return replaceDividers(`
        <span class="text-white">${t}</span>
        <span class="text-muted">by</span>
        <span class="text-primary">${a}</span>
      ` + beat
      )
    }
    if (a === '') {
      return replaceDividers(t) + beat
    }
    if (t === '') {
      return replaceDividers(a) + beat
    }
    return `${a} bla ${t}` + beat
  }
  return {
    formatArtistTitle
  }
}
