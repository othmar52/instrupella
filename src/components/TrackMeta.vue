<template>
  <div class="track-meta p-5 d-flex justify-content-between" @click="toggleFormat">
    <div v-html="formattedArtistTitle"></div>
    <div v-html="formattedTempo"></div>
    <div>
        <div v-if="format">
            {{formatDuration(currentSecond)}}
            <span class="text-primary"> | </span>
            <span class="text-muted">{{formatDuration(duration)}}</span>
        </div>
        <div v-else>
            {{currentSecond.toFixed(2)}}
            <span class="text-primary"> | </span>
            <span class="text-muted">{{duration.toFixed(2)}}</span>
        </div>
    </div>
  </div>
</template>

<script setup>
// TODO: consider to have an optional 'time remaining' as format
import { ref, watch, computed } from 'vue'
const duration = ref(0)
const format = ref(true)
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  playbackRate: {
    type: Number,
    default: 1
  }
})

const toggleFormat = () => {
  format.value = !format.value
}

const formattedTempo = computed(() => {
  if (!props.track) {
    return '0 BPM'
  }
    return `
      <span class="text-primary">${(props.track.bpmdetect * props.playbackRate).toFixed(1)}</span>
      <span class="text-muted">BPM</span>
    `
})

const formattedArtistTitle = computed(() => {
  if (!props.track) {
    return 'no track loaded...'
  }
  const a = (props.track.artist) ? props.track.artist.trim() : ''
  const t = (props.track.title) ? props.track.title.trim() : ''
  if (`${a}${t}` === '') {
    return props.track.path.split('/').slice(-1).join('/').split('.').slice(0, -1).join('.')
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
})


// TODO move to util (code duplication in TrackList.vue)
const formatDuration = (duration) => {
  // thanks to https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds#answer-11486026
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600)
  const mins = ~~((duration % 3600) / 60)
  const secs = ~~duration % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}

watch(() => props.track, () => {
  duration.value = props.track.length
})
</script>

<style lang="scss">

</style>
