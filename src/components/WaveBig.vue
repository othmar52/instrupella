<template>
  <div class="wave">
    <h3>wave</h3>
    <div id="wave-timeline">
    </div>
    <div id="wave-surfer" ref="wavesurfer">
    </div>
    <div v-if="track">
      {{track.path}}
    </div>
    <span @click="initPlayer">init player</span>
  </div>
</template>

<script setup>
import WaveSurfer from 'wavesurfer.js'
import MinimapPlugin from 'wavesurfer.js/src/plugin/minimap/index.js'
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline/index.js'

import { ref, defineProps, watch, defineExpose } from 'vue'

const player = ref(null)
const props = defineProps({
  play: {
    type: Boolean,
    default: false
  },
  track: {
    type: Object,
    default: null
  },
  timestretch: {
    type: Boolean,
    default: false
  }
})

watch(() => props.track, (newTrack) => {
  if (!newTrack) {
    return
  }
  initPlayer()
})

watch(() => props.play, () => {
  if (!props.track) {
    return
  }
  togglePlay()
})

const initPlayer = () => {
  // console.log("initPlayer()")
  if (player.value !== null) {
    console.log('player.value', player.value)
    player.value.destroy()
  }
  console.log('creating wavesurfer begin')
  player.value = WaveSurfer.create(
    wavesurferOptions()
  )
  console.log('creating wavesurfer end')
  player.value.load(props.track.path)
  /*
  if (this.getCurrentTrack('bpmdetect') > 0) {
    this.referenceTempo = this.getCurrentTrack('bpmdetect')
  }
  if (this.getCurrentTrack('bpm') > 0) {
    this.referenceTempo = this.getCurrentTrack('bpm')
  }
  this.acaBpm = this.referenceTempo * this.acaPitch
  // console.log('this.acaBpm', this.acaBpm)
  player.on('audioprocess', () => {
    this.currentTrackTime = player.getCurrentTime()
    if (this.metronome === false) {
      return
    }
    if (this.metronomeRunning === true) {
      return
    }
    // we do not know the downbeat - so start immediatly
    if (this.getCurrentTrack('downbeat') === 0) {
      // console.log("starting immediatly", this.getCurrentTrack('downbeat'))
      this.$refs.metronome.play()
      return
    }
    // let milliSecondsPerQuarterNote = 60000 / this.tracks[0].bpm
    // console.log('audioprocess', this.metronome, this.metronomeRunning, milliSecondsPerQuarterNote)
    if (player.getCurrentTime() >= this.getCurrentTrack('downbeat')) {
      this.$refs.metronome.play()
    }
  })
  */
}
const wavesurferOptions = () => {
  const secondsPerQuarterNote = 60 / props.track.bpmdetect
  // const secondsPerQuarterNote = 2
  return {
    plugins: [
      MinimapPlugin.create({
        // plugin options ...
        container: '#deck-minimap'
      }),
      TimelinePlugin.create({
        // plugin options ...
        container: '#wave-timeline',
        primaryColor: '#565455',
        secondaryColor: '#565455',
        primaryFontColor: '#565455',
        secondaryFontColor: '#565455',
        unlabeledNotchColor: '#232323',
        height: 200,
        offset: -3,
        secondaryLabelInterval: 16,
        primaryLabelInterval: 4,
        timeInterval: function (pxPerSecond) { // eslint no-unused-vars: 0
          // console.log('pxPerSecond', pxPerSecond)
          // console.log('secondsPerQuarterNote', secondsPerQuarterNote)
          return secondsPerQuarterNote
        }
        // primaryLabelInterval: 4,
        // secondaryLabelInterval: 16,
        // formatTimeCallback: function () { return '' },
        // offset: this.getBeatGridOffset()
        // duration: 59 // this messes up the resolution
      })
    ],
    container: '#wave-surfer',
    backgroundColor: '#121212',
    // backend: 'WebAudio', // change tempo and pitch
    // backend: 'MediaElement',  // change tempo and keep pitch
    backend: (props.timestretch) ? 'MediaElement' : 'WebAudio',
    mediaControls: false,
    waveColor: '#7460cd',
    progressColor: '#13111f',
    loaderColor: 'purple',
    cursorColor: '#903d5c',
    cursorWidth: 3,
    barGap: 0,
    barWidth: 0,
    audioRate: 1,
    // forceDecode: true,
    height: 200,
    minPxPerSec: 400,
    fillParent: false,
    scrollParent: true,
    hideScrollbar: true,
    autoCenter: true,
    maxCanvasWidth: 4000,
    pixelRatio: 1,
    // autoCenterImmediately: true,
    partialRender: true,
    responsive: true,
    interact: true,
    skipLength: 0.05,
    splitChannels: false
  }
}
const getBeatGridOffset = () => { /* eslint no-unused-vars: 0 */
  if (this.track.downbeat < 0.001) {
    console.log("parseInt(this.getCurrentTrack('downbeat'))", parseInt(this.track.downbeat))
    return 0
  }
  if (this.track.bpmdetect === 0) {
    console.log("parseInt(this.getCurrentTrack('bpm'))", parseInt(this.track.bpmdetect))
    return 0
  }
  // offset needs seconds and not pixel

  // for now make a quick & dirty subtraction of 16 bars
  const secondsPerQuarterNote = 60 / this.track.bpmdetect
  const secondsFor16Bars = secondsPerQuarterNote * 4 * 16

  // let econdsPerQuarterNote = 60 / this.tracks[0].bpm
  // const secondsPerQuarterNote = 60 / this.getCurrentTrack('bpm')
  // const pixelPerQuarterNote = secondsPerQuarterNote * this.pxPerSec
  // const pixelPer4Bars = pixelPerQuarterNote * 16
  // const pixelPer16Bars = pixelPer4Bars * 16
  // console.log("this.pxPerSec", this.pxPerSec)
  // console.log("secondsPerQuarterNote", secondsPerQuarterNote)
  // console.log("pixelPerQuarterNote", pixelPerQuarterNote)
  // console.log("pixelPer4Bars", pixelPer4Bars)
  // console.log("pixelPer16Bars", pixelPer16Bars)
  console.log('offset', this.track.downbeat - secondsFor16Bars)
  // return this.track.downbeat - secondsFor16Bars
  return 5
}
const togglePlay = () => {
  if (player.value.isPlaying() === true) {
    player.value.pause()
    // this.requestedPlayState = false
    return
  }
  // this.requestedPlayState = true
  player.value.play()
}
const seekZero = () => {
  player.value.seekAndCenter(0)
}
const nudgeAhead = () => {
  player.value.skipForward()
}
const nudgeBehind = () => {
  player.value.setMute(true)
  player.value.skipBackward()
  setTimeout(() => {
    player.value.setMute(false)
    player.value.setVolume(1)
  }, player.value.params.skipLength * 1000)
}
defineExpose({
  nudgeBehind,
  nudgeAhead,
  seekZero
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#wave-timeline {
  position: absolute;
  z-index:100;
  width: 80vw;
}
wave {
  z-index: 101;
}
</style>
