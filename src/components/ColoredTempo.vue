<template>
  <span>
    <span v-if="track && track.tempoDrift" class="text-danger">!</span>
    <span :class="isManualBpm(track) ? 'text-success' : 'text-primary'">{{ formattedTempo }}</span>
    <span v-if="track && track.downbeatDrift" class="text-secondary">!</span>
    <span v-if="track && track.downbeat" class="text-success">*</span>
    <span v-if="showUnit" class="text-muted m-5">BPM</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import utils from '../mixins/utils'
const { getBpm, isManualBpm } = utils()
const props = defineProps({
  track: {
    type: Object
  },
  digits: {
    type: Number,
    default: 0
  },
  playbackRate: {
    type: Number,
    default: 1
  },
  tempoFactor: {
    type: Number,
    default: 1
  },
  showUnit: {
    type: Boolean,
    default: false
  }
})

const formattedTempo = computed(() => {
  return (getBpm(props.track)*props.playbackRate*props.tempoFactor).toFixed(props.digits)
})
</script>
