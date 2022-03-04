<template>
  <div class="volume-control">
    <div class="">
      <VSlider
        :minSliderValue="min"
        :maxSliderValue="max"
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
