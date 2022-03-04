export default () => {
  const formatArtistTitle = (track) => {
    if (track === null) {
      return ''
    }
    const a = (track.artist) ? track.artist.trim() : ''
    const t = (track.title) ? track.title.trim() : ''
    if (`${a}${t}` === '') {
      return track.path.split('/').slice(-1).join('/').split('.').slice(0, -1).join('.')
    }
    if (a.toLowerCase() === t.toLowerCase() && a !== '') {
      return a
    }
    if (a !== '' && t !== '') {
      return `
        <span class="text-white">${t}</span>
        <span class="text-muted">by</span>
        <span class="text-primary">${a}</span>
      `
    }
    if (a === '') {
      return t
    }
    if (t === '') {
      return a
    }
    return `${a} bla ${t}`
  }
  return {
    formatArtistTitle
  }
}
