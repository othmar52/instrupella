<template>
  <button class="btn btn-default btn-square btn-lg m-5 btn-bars" @click="trigger" tabindex="-1">
    <strong class="bars">TAP</strong><br><span class="text-muted font-size-12 label-bars">BPM</span>
  </button>
</template>

<script setup>
// thanks to https://github.com/TheSommer/Vue-BPM-Tapper
import { ref, defineEmits } from 'vue'
const start = ref(0)
const bpm = ref(null)
const avgBpm = ref(null)
const taps = ref([])
const lastTap = ref(null)
const resetAfterMilliseconds = ref(5000)

const add = (a, b) => {
  return a + b
}

const trigger = () => {
  const time = new Date().getTime()
  if (lastTap.value !== null && time - lastTap.value > resetAfterMilliseconds.value) {
    resetTap()
  }
  if (start.value == 0) {
    start.value = time
    return
  }

  lastTap.value = time
  const diff = time - start.value
  bpm.value = 60000 / diff
  taps.value.push(bpm.value)
  const tempTaps = taps.value
  avgBpm.value = (tempTaps.reduce(add, 0) / taps.value.length)
  start.value = time
  emit('tapTempo', avgBpm.value)
}

const resetTap = () => {
  start.value = 0
  bpm.value = null
  avgBpm.value = null
  taps.value = []
  lastTap.value = null
}

const emit = defineEmits([
  'tapTempo'
])

</script>

<style>

</style>
