<template>
  <div class="wave">
    <div id="wave-timeline">
    </div>
    <div class="wave-dragger"
      @click="ignoreEvent"
      @dblclick="ignoreEvent"
      @mouseenter="ignoreEvent"
      @mouseleave="ignoreEvent"
      @mouseout="ignoreEvent"
      @mouseover="ignoreEvent"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @mouseup="stopDrag"
      @touchend="stopDrag"
      @mousemove="doDrag"
      @touchmove="doDrag"
    >
      <div id="wave-surfer" ref="wavesurfer">
    </div>
    </div>
  </div>
</template>

<script setup>
import WaveSurfer from 'wavesurfer.js'
import MinimapPlugin from 'wavesurfer.js/src/plugin/minimap/index.js'
import MarkersPlugin from 'wavesurfer.js/src/plugin/markers/index.js'
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline/index.js'
import utils from '../mixins/utils.js'
import { ref, watch, onMounted, computed } from 'vue'

const { getBpm } = utils()
const player = ref(null)

// some helpers for dragging waveform
const dragging = ref(false)
const dragX = ref(false)
const startDragPlayState = ref(false)
const lastSetSongPosition = ref(false)

const downbeat = computed(() => {
  if (!props.track) {
    return '0'
  }
  return props.track.downbeat
})

const props = defineProps({
  play: {
    type: Boolean,
    default: false
  },
  mute: {
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
  },
  playbackRate: {
    type: Number,
    default: 1
  },
  pixelPerSecond: {
    type: Number,
    default: 400
  },
  editTempo: {
    type: Number,
    default: 0
  }
})

watch(() => props.track, (newTrack) => {
  if (!newTrack) {
    return
  }
  // avoid rendering invalid beatgrid during load
  player.value.timeline.params.timeInterval = 10000

  // TODO clear minimap
  // approach with next 2 lines only work during pause and trackPosition 0
  // @see https://github.com/katspaugh/wavesurfer.js/issues/2479
  const len = player.value.minimap.drawer.getWidth();
  player.value.minimap.drawer.progress(0)
  player.value.minimap.drawer.drawPeaks([0], len, 0, len);

  player.value.load(newTrack.path)
})

const redrawBeatGrid = () => {
  const bpm = getBpm(props.track)
  if (bpm === 0) {
    return
  }
  player.value.timeline.params.offset = getBeatGridOffset()
  player.value.timeline.params.timeInterval = function () {
      return 60 / bpm
  }
  player.value.timeline.render()
}


watch(() => props.play, () => {
  if (!props.track) {
    return
  }
  togglePlay()
})

watch(() => props.mute, () => {
  player.value.toggleMute()
})

watch(() => props.pixelPerSecond, () => {
  player.value.zoom(props.pixelPerSecond)

  // TODO: this approach for zoom seem to be faster!?
  //    but it does not zoom at the very beginning of the track
  // this.player.params.minPxPerSec = pixelPerSecond.value
  // const targetSeekPercent = this.player.getCurrentTime() /this.player.getDuration()
  // console.log('percent', targetSeekPercent)
  // this.player.seekAndCenter(targetSeekPercent)
})

const emit = defineEmits([
  'waveformReady',
  'trackReady',
  'trackEnd',
  'trackLoad',
  'audioprocess',
  'seek',
  'error'
])

const destroyPlayer = () => {
  if (player.value === null) {
    return
  }
  player.value.unAll()
  player.value.destroy()
}

const initPlayer = (forceReInit = false) => {
  if (forceReInit === true) {
    destroyPlayer()
  }
  player.value = WaveSurfer.create(
    wavesurferOptions()
  )
  player.value.on('loading', (percent) => {
    emit('trackLoad', percent)
  })
  player.value.on('finish', () => {
    emit('trackEnd')
  })
  player.value.on('ready', () => {
    redrawBeatGrid()
    emit('trackReady')
  })
  player.value.on('waveform-ready', () => {
    redrawBeatGrid()
    emit('waveformReady')
  })
  player.value.on('audioprocess', (sec) => {
    emit('audioprocess', sec)
  })
  player.value.on('seek', (value) => {
    emit('seek', value)
  })
  player.value.on('error', (error) => {
    emit('error', error)
  })
}
const wavesurferOptions = () => {
  const secondsPerQuarterNote = 60 / getBpm(props.track)
  return {
    plugins: [
      MinimapPlugin.create({
        container: '#deck-minimap',
        height: 50
      }),
      TimelinePlugin.create({
        container: '#wave-timeline',
        primaryColor: 'tomato',
        secondaryColor: 'tomato',
        primaryFontColor: 'white', // 1 bar
        secondaryFontColor: '#ff4d4f', // 4 bars
        unlabeledNotchColor: '#232323', // quarter note
        height: 150,
        secondaryLabelInterval: 16,
        primaryLabelInterval: 4,
        offset: getBeatGridOffset(),
        formatTimeCallback: function () { return '' },
        timeInterval: function () { return secondsPerQuarterNote }
      }),
      MarkersPlugin.create({
      })
    ],
    container: '#wave-surfer',
    backgroundColor: '#111417',
    backend: (props.timestretch)
      ? 'MediaElement' // change tempo and keep pitch
      : 'WebAudio', // change tempo and pitch
    mediaControls: false,
    waveColor: '#1890ff',
    progressColor: '#05121e',
    loaderColor: 'purple',
    cursorColor: '#903d5c',
    cursorWidth: 3,
    barGap: 0,
    barWidth: 0,
    audioRate: props.playbackRate,
    // forceDecode: true,
    height: 150,
    minPxPerSec: 400,
    fillParent: false,
    scrollParent: true,
    hideScrollbar: true,
    autoCenter: true,
    maxCanvasWidth: 4000,
    pixelRatio: 1,
    autoCenterImmediately: true,
    partialRender: true,
    responsive: true,
    interact: true,
    skipLength: 0.05,
    splitChannels: false
  }
}
const getBeatGridOffset = (overrideDownbeat = null) => {
  let useTempo = 0
  if (getBpm(props.track) > 0) {
    useTempo = getBpm(props.track)
  }
  if (props.editTempo > 0) {
    useTempo = props.editTempo
  }
  if (useTempo === 0) {
    return 0
  }
  const useDownbeat = (overrideDownbeat !== null)
    ? overrideDownbeat
    : props.track.downbeat

  // ensure we have timeline rendering from start to finish
  // by pushing the offset in 4-bar-steps to a negative value
  const seconds4Bars = 60 / useTempo * 16
  let newOffset = useDownbeat
  while (newOffset > 0) {
    newOffset -= seconds4Bars
  }
  return newOffset
}

const togglePlay = () => {
  if (player.value.isPlaying() === props.play) {
    return
  }
  player.value[(props.play) ? 'play' : 'pause']()
}
const seekZero = () => {
  player.value.seekAndCenter(0)
}
const nudgeAhead = () => {
  player.value.skipForward()
}

const setVolume = (newVolume) => {
  player.value.setVolume(newVolume)
}

const getDuration = () => {
  return player.value.getDuration()
}

const seekToSecondAndCenter = (second) => {
  // seekTo() needs a value between 0 and 1
  const targetSeekValue = second / (player.value.getDuration())
  player.value.seekAndCenter(targetSeekValue)
}

const forcePlay = () => {
  // play audio but ignore props.play
  // console.log('forcing play...')
  player.value.play()
}
const forceStop = () => {
  // play audio but ignore props.play
  // console.log('forcing pause...')
  player.value.pause()
}

const nudgeBehind = () => {
  player.value.setMute(true)
  player.value.skipBackward()
  setTimeout(() => {
    player.value.setMute(false)
    player.value.setVolume(1)
  }, player.value.params.skipLength * 1000)
}

const ignoreEvent = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const startDrag = (event) => {
  // console.log('start drag', player.value.params.interact)
  player.value.params.interact = false
  // player.value.toggleInteraction()
  event.preventDefault()
  event.stopPropagation()
  startDragPlayState.value = player.value.isPlaying()
  dragging.value = true
  dragX.value = event.clientX
  if (typeof dragX.value === 'undefined') {
    dragX.value = event.touches[0].pageX
  }
  lastSetSongPosition.value = player.value.getCurrentTime()
  // console.log('lastSetSongPosition.value', lastSetSongPosition.value)
}

const stopDrag = (event) => {
  // TODO: how to support multitouch?
  //    e.g. press play/pause during "holding" the waveform in place
  if (event.target.nodeName === 'WAVE') {
    event.preventDefault()
    event.stopPropagation()
  }
  if (dragging.value === true) {
    if (startDragPlayState.value === true) {
      player.value.play()
    }
    setTimeout(() => {
      player.value.params.interact = true
    }, 100)
  }
  dragging.value = false
  // console.log('dragging.value', dragging.value)
}

const doDrag = (event) => {
  if (dragging.value === false) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  // mouse or touch event
  let clientX = event.clientX
  if (typeof clientX === 'undefined') {
    clientX = event.touches[0].pageX
  }
  const pixelDelta = clientX - dragX.value
  let targetSecond = lastSetSongPosition.value - pixelDelta / props.pixelPerSecond
  if (targetSecond < 0) {
    targetSecond = 0
  }

  // seekTo() needs a value between 0 and 1
  let targetSeekValue = targetSecond / (player.value.getDuration())
  if (targetSeekValue >= 1) {
    targetSeekValue = 0.999
  }
  player.value.seekAndCenter(targetSeekValue)

  // TODO: change playBackRate and lengthToPlay accoring to drag event
  // for now keep it simple and repeat a millisecond in current pitch during drag
  const targetSecond2 = targetSecond + 0.001
  player.value.play(targetSecond, targetSecond2)
}

const updateMarkers = (allHotCues) => {
  player.value.clearMarkers()
  for (const [idx, hotCue] of allHotCues.entries()) {
    if (hotCue.second === 0) {
      continue
    }
    player.value.addMarker({
      time: hotCue.second,
      label: idx + 1,
      position: 'top'
    })
  }
}

watch(() => props.playbackRate, () => {
  try {
    player.value.setPlaybackRate(props.playbackRate)
  } catch (e) { }
})

watch(() => downbeat.value, (newDownbeat) => {
  if (!player.value) {
    return
  }
  try {
    // console.log('downbeat has changed - updating timeline')
    player.value.timeline.params.offset = getBeatGridOffset(newDownbeat)
    player.value.timeline.render()
  } catch (e) { }
})

watch(() => props.editTempo, (newTempo) => {
  if (newTempo === 0) {
    return
  }
  try {
    // console.log('edit tempo has changed - updating timeline')
    const secondsPerQuarterNote = 60 / newTempo
    player.value.timeline.params.timeInterval = function () {
      return secondsPerQuarterNote
    }
    player.value.timeline.params.offset = getBeatGridOffset()
    player.value.timeline.render()
  } catch (e) { }
})

onMounted(() => {
  initPlayer()
  window.addEventListener('mouseup', stopDrag)
})

defineExpose({
  nudgeBehind,
  nudgeAhead,
  seekZero,
  seekToSecondAndCenter,
  forcePlay,
  forceStop,
  updateMarkers,
  setVolume,
  getDuration
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#wave-timeline {
  position: absolute;
  z-index:5;
  width: 100%;
}
wave {
  z-index: 6;
  position: relative;
}
</style>
