<template>
  <div class="wave">
    <div :id="`wave-timeline${deck.index}`" class="wave-timeline">
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
      <div :id="`wave-surfer${deck.index}`" ref="wavesurfer">
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
import getNegativeDownbeatMixin from '../mixins/utils/negativeDownbeat'
import { useMainStore } from "@/store.js";
import { ref, watch, onMounted, computed } from 'vue'

const storage = useMainStore()
const workingTempo = computed(() => storage.getWorkingTempo)
const workingDownbeat = computed(() => storage.getWorkingDownbeat)
const { getBpm } = utils()
const { getNegativeDownbeat } = getNegativeDownbeatMixin()
const player = ref(null)

// some helpers for dragging waveform
const dragging = ref(false)
const dragX = ref(false)
const startDragPlayState = ref(false)
const lastSetSongPosition = ref(false)

const track = computed(() => props.deck.track)

const props = defineProps({
  deck: {
    type: Object,
    default: null
  }
})

const redrawBeatGrid = (clear=false) => {
  if (!player.value) {
    return
  }
  if (!props.deck.track) {
    return
  }
  if (workingTempo.value === 0) {
    return
  }
  try {
    player.value.timeline.params.offset = getBeatGridOffset()
    // avoid rendering invalid beatgrid during load
    player.value.timeline.params.timeInterval = clear
      ? 10000
      : function () {
          return 60 / workingTempo.value
        }
    player.value.timeline.render()
  } catch (e) { }
}

watch(() => props.deck.track, (newTrack) => {
  if (!newTrack) {
    return
  }
  // avoid rendering invalid beatgrid during load
  //player.value.timeline.params.timeInterval = 10000
  redrawBeatGrid(true)
  player.value.load(newTrack.path)
})


/*
watch(() => props.deck.skipLength, (value) => {
  console.log('watch skip length', value)
  player.value.params.skipLength = parseFloat(value)
})

*/

watch(() => props.deck.play, () => {
  if (!props.deck.track) {
    return
  }
  togglePlay()
})

watch(() => props.deck.mute, () => {
  player.value.toggleMute()
})
watch(() => props.deck.volume, (newVolume) => {
  setVolume(newVolume)
})

watch(() => props.deck.nudgeAhead, (nudgeValue) => {
  // console.log('watch nudgeAhead', nudgeValue)
  if (nudgeValue === 0) {
    player.value.params.skipLength = 0.05 // TODO remove hardcoded value
    return
  }
  player.value.params.skipLength = parseFloat(nudgeValue)
  player.value.skipForward()
  storage.clearNudge(props.deck.index)
})

watch(() => props.deck.nudgeBehind, (nudgeValue) => {
  if (nudgeValue === 0) {
    player.value.params.skipLength = 0.05 // TODO remove hardcoded value
    return
  }
  player.value.params.skipLength = parseFloat(nudgeValue)
  player.value.skipBackward()
  storage.clearNudge(props.deck.index)
})

watch(() => props.deck.seekToSecond, (sec) => {
  if (sec < 0) {
    return
  }
  seekToSecondAndCenter(sec)
  storage.seekToSecond(props.deck.index, -1)
})

watch(() => props.deck.seekToSecondAndPlay, (sec) => {
  if (sec < 0) {
    return
  }
  seekToSecondAndCenter(sec)
  forcePlay()
  storage.seekToSecondAndPlay(props.deck.index, -1)
})

watch(() => props.deck.seekToSecondAndStop, (sec) => {
  if (sec < 0) {
    return
  }
  seekToSecondAndCenter(sec)
  forceStop()
  storage.seekToSecondAndStop(props.deck.index, -1)
})

watch(() => props.deck.hotCuesChange, (value) => {
  if(value === false) {
    return
  }
  updateMarkers()
  storage.setHotCuesChange(props.deck.index, false)
})

watch(() => props.deck.pixelPerSecond, () => {
  player.value.zoom(props.deck.pixelPerSecond)

  // TODO: this approach for zoom seem to be faster!?
  //    but it does not zoom at the very beginning of the track
  // player.value.params.minPxPerSec = props.deck.pixelPerSecond
  // const targetSeekPercent = player.value.getCurrentTime() /player.value.getDuration()
  // console.log('percent', targetSeekPercent)
  // player.value.seekAndCenter(targetSeekPercent)

  // this works for beginning of the track. but its inperformant like zoom()
  // player.value.drawBuffer()
})

const emit = defineEmits([
  'waveformReady',
  'trackReady',
  'trackLoad',
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
    storage.togglePlay(props.deck.index, false)
    storage.toggleMute(props.deck.index, false)
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
    storage.setCurrentSecond(props.deck.index, sec)
  })
  player.value.on('seek', (value) => {
    const targetSecond = player.value.getDuration() * value
    storage.setCurrentSecond(props.deck.index, targetSecond)
    // console.log('seek listener', value, targetSecond)
    // emit('seek', value)
  })
  player.value.on('error', (error) => {
    emit('error', error)
  })
}
const wavesurferOptions = () => {
  const secondsPerQuarterNote = 60 / getBpm(props.deck.track)
  return {
    plugins: [
      MinimapPlugin.create({
        container: `#deck-minimap${props.deck.index}`,
        height: 50
      }),
      TimelinePlugin.create({
        container: `#wave-timeline${props.deck.index}`,
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
    container: `#wave-surfer${props.deck.index}`,
    backgroundColor: '#111417',
    backend: (props.deck.timestretch)
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
    audioRate: props.deck.playbackRate,
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
    skipLength: props.deck.skipLength,
    splitChannels: false
  }
}
const getBeatGridOffset = () => {
  if (workingTempo.value === 0) {
    return 0
  }
  // ensure we have timeline rendering from start to finish
  // by pushing the offset in 4-bar-steps to a negative value
  return getNegativeDownbeat(workingTempo.value, workingDownbeat.value)
}

const togglePlay = () => {
  if (player.value.isPlaying() === props.deck.play) {
    return
  }
  player.value[(props.deck.play) ? 'play' : 'pause']()
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
  if (targetSeekValue >= 0 && targetSeekValue <= 1) {
    player.value.seekAndCenter(targetSeekValue)
  }
}

const forcePlay = () => {
  // play audio but ignore props.deck.play
  // console.log('forcing play...')
  player.value.play()
}
const forceStop = () => {
  // play audio but ignore props.deck.play
  // console.log('forcing pause...')
  player.value.pause()
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
  let targetSecond = lastSetSongPosition.value - pixelDelta / props.deck.pixelPerSecond
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

const updateMarkers = () => {
  player.value.clearMarkers()
  for (const [idx, hotCue] of props.deck.hotCues.cues.entries()) {
    if (hotCue.second === null) {
      continue
    }
    player.value.addMarker({
      time: hotCue.second,
      label: idx + 1,
      position: 'top'
    })
  }
}


watch(() => props.deck.playbackRate, () => {
  try {
    player.value.setPlaybackRate(props.deck.playbackRate)
  } catch (e) { }
})

watch(() => storage.workingDownbeat, () => {
  redrawBeatGrid()
})

watch(() => storage.workingTempo, () => {
  redrawBeatGrid()
})

onMounted(() => {
  initPlayer()
  window.addEventListener('mouseup', stopDrag)
})

defineExpose({
  getDuration
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.wave-timeline {
  position: absolute;
  z-index:5;
  width: 100%;
}
wave {
  z-index: 6;
  position: relative;
}
</style>
