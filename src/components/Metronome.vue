<template>
  <div class="metronome">
   <button @click="play" tabindex="-1">{{ isPlaying? 'STOP' : 'START' }}<br>METRONOME</button>
  </div>
</template>

<script setup>
// thanks to https://github.com/scottwhudson/metronome for inspiration
// thanks to Peter Mueller for metronome sounds
//   https://www.reddit.com/r/audioengineering/comments/kg8gth/free_click_track_sound_archive/
import { ref, watch, onMounted } from 'vue'
const clickHi = ref(null)
const clickLo = ref(null)
const isPlaying = ref(false)
const quarterNotes = ref(0)
const timerWorker = ref(null)

const props = defineProps({
  tempo: {
    type: Number,
    default: 120.0
  }
})

const play = (forcePlayState = null) => {
  isPlaying.value = !isPlaying.value;
  if (forcePlayState !== null) {
    isPlaying.value = forcePlayState
  }
  // this.$emit('onMetronomeStateChange', isPlaying.value)

  if (isPlaying.value) {
    timerWorker.value.postMessage('start');
    clickHi.value.play()
    quarterNotes.value = 0
  } else {
    timerWorker.value.postMessage('stop');
  }
}

const createWorker = () => {
  if (!timerWorker.value) {
    timerWorker.value = new Worker("js/worker.js");
  }
  timerWorker.value.onmessage = (message) => {
    if (message.data !== "tick") {
      // console.log("message: " + message.data);
      return
    }
    // console.log("tickmessage: " + message.data);
    quarterNotes.value ++
    if (quarterNotes.value % 4 == 0) {
      clickHi.value.play()
      return
    }
    clickLo.value.play()
  }
  let milliSecondsPerQuarterNote = 60000 / props.tempo

  timerWorker.value.postMessage({"interval":milliSecondsPerQuarterNote});
}

/*
const emit = defineEmits([
  'play'
])
*/
defineExpose({
  play,
  isPlaying
})

watch(() => props.tempo, (newValue) => {
  let milliSecondsPerQuarterNote = 60000 / newValue
  timerWorker.value.postMessage({
    "interval": milliSecondsPerQuarterNote
  });
})

onMounted(() => {
  createWorker()
  // const metronomeType = 'Synth_Tick_A'
  const metronomeType = 'Perc_Castanet'
  clickHi.value = new Audio(`./metronome-sounds/${metronomeType}_hi.wav`)
  clickLo.value = new Audio(`./metronome-sounds/${metronomeType}_lo.wav`)
})
</script>

<style>

</style>