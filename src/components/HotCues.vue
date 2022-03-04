<template>
  <div class="hotcues" v-if="cueItems.length">
    <HotCue
      :track="track"
      v-for="idx in range(0,amount)"
      :key="idx"
      :index="idx"
      :second="getSecondForIndex(idx)"
      @pressHotCueStart="pressHotCueStart"
      @pressHotCueEnd="pressHotCueEnd"
    />
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import HotCue from '@/components/HotCue.vue'

const cueItems = ref([])
const playStateOnCueStart = ref(false)
const ignoreNextEndEvent = ref(false)

const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  amount: {
    type: Number,
    default: 6
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  play: {
    type: Boolean,
    default: false
  }
})

const getSecondForIndex = (idx) => {
  return cueItems.value[idx].second
}

const pressHotCueStart = (idx) => {
  if (!props.track) {
    return
  }
  // console.log('pressHotCueStart', idx, 'props.play', props.play)
  if (cueItems.value[idx].second === 0) {
    // set new cue point
    cueItems.value[idx].second = props.currentSecond
    emit('hotCuesChange', cueItems.value)
    ignoreNextEndEvent.value = true
    return
  }
  playStateOnCueStart.value = props.play
  emit('seekToAndPlay', cueItems.value[idx].second)
}

const pressHotCueEnd = (idx) => {
  if (ignoreNextEndEvent.value === true) {
    ignoreNextEndEvent.value = false
    // console.log('ignoring end event...')
    return
  }
  if (!props.track) {
    return
  }
  // console.log('pressHotCueEnd', idx, 'props.play', props.play, 'playStateOnCueStart', playStateOnCueStart.value)
  if (playStateOnCueStart.value === false) {
    emit('seekToAndStop', cueItems.value[idx].second)
  }
}

const emit = defineEmits([
  'seekToAndPlay',
  'seekToAndStop',
  'hotCuesChange'
])

onMounted(() => {
  // TODO: read persisted cue items
  for (let idx in range(0, props.amount)) {
    cueItems.value.push({second: 0})
  }
})



// thanks to https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range#8273091
const range = (start, stop, step = 1) => {
  if (typeof stop === 'undefined') {
    // one param defined
    stop = start
    start = 0
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return []
  }

  const result = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i)
  }
  return result
}

watch(() => props.track, () => { })
</script>

<style lang="scss">

</style>
