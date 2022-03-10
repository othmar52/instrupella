<template>
  <div class="volume-control">
    <div class="">
      <VSlider
        :minSliderValue="min"
        :maxSliderValue="max"
        :midiLearn="midiLearn"
        @sliderChange="sliderChange"
        ref="slider"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VSlider from '@/components/VSlider.vue'
const min = ref(0)
const max = ref(1)
const props = defineProps({
  center: {
    type: Number,
    default: 1
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const sliderChange = (newVolumeValue) => {
  emit('volumeChange', parseFloat(newVolumeValue))
}

const emit = defineEmits([
  'volumeChange'
])

</script>

<style lang="scss">

</style>
