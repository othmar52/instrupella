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
import { ref, onMounted, computed, watch } from 'vue'
import VSlider from '@/components/VSlider.vue'
import { useMainStore } from "@/store.js";
const storage = useMainStore()
const slider = ref(null)
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

// helper var used for bidirektional control
// slider -> store (via GUI)
// store -> slider (via midi)
let volString = ''

const sliderChange = (newVolumeValue) => {
  volString = newVolumeValue.toString()
  storage.setVolume(props.deck.index, parseFloat(newVolumeValue))
}

watch(() => props.deck.volume, (volume) => {
  if (volume.toString() !== volString) {
    volString = volume.toString()
    slider.value.setSliderValueFromMidi(volume)
  }
})

</script>

<style lang="scss">

</style>
