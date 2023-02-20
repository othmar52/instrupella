<template>
</template>

<script setup>
// thanks https://grantjam.es/creating-a-simple-metronome-using-javascript-and-the-web-audio-api/
import {Metronome} from '@/js/metronome.js'
import { ref, computed, watch, onMounted } from 'vue'
const isPlaying = ref(false)
const metronome = ref(null)
const props = defineProps({
  tempo: {
    type: Number,
    default: 120.0
  }
})

const play = (forcePlayState = null) => {
  isPlaying.value = !isPlaying.value
  if (forcePlayState !== null) {
    isPlaying.value = forcePlayState
  }

  if (isPlaying.value) {
    metronome.value.start();
  } else {
    metronome.value.stop();
  }
}

defineExpose({
  play,
  isPlaying
})

watch(() => props.tempo, (newValue) => {
  metronome.value.tempo = newValue
})

onMounted(() => {
  metronome.value = new Metronome()
  metronome.value.tempo = props.tempo
})

</script>

<style>

</style>
