export default () => {
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
      return track.path.split('/').slice(-1).join('/').split('.').slice(0, -1).join('.') + beat
    }
    if (a.toLowerCase() === t.toLowerCase() && a !== '') {
      return a + beat
    }
    if (a !== '' && t !== '') {
      return `
        <span class="text-white">${t}</span>
        <span class="text-muted">by</span>
        <span class="text-primary">${a}</span>
      ` + beat
    }
    if (a === '') {
      return t + beat
    }
    if (t === '') {
      return a + beat
    }
    return `${a} bla ${t}` + beat
  }
  return {
    formatArtistTitle
  }
}
