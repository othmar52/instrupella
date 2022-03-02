<template>
    <div class="hotcues">
        <HotCue :track="track" v-for="idx in range(0,6)" :key="idx" :index="idx" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import HotCue from '@/components/HotCue.vue'
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  amount: {
    type: Number,
    default: 6
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
