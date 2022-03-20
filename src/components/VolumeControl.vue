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
import { useMainStore } from "@/store.js";
const storage = useMainStore()
const min = ref(0)
const max = ref(1)
const props = defineProps({
  center: {
    type: Number,
    default: 1
  },
  deck: {
    type: Object,
    default: null
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const sliderChange = (newVolumeValue) => {
  storage.setVolume(props.deck.index, parseFloat(newVolumeValue))
}

</script>

<style lang="scss">

</style>
