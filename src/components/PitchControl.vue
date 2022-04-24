<template>
  <div class="pitch-control d-flex">
    <div class="">
      <VSlider
        :minSliderValue="min"
        :maxSliderValue="max"
        :showSliderValue="true"
        :midiLearn="midiLearn"
        @sliderChange="sliderChange"
        ref="slider"
      />
    </div>
    <div class="pitch-control-button-group d-flex flex-column">
      <div class="dropdown dropleft with-arrow" id="pitch-control-items">
        <button class="btn btn-sm ml-10" data-toggle="dropdown" type="button" aria-haspopup="true" aria-expanded="false">
          {{pitchLabel}} <i class="fa fa-angle-down ml-5 mr-0" aria-hidden="true"></i> <!-- ml-5 = margin-left: 0.5rem (5px) -->
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdown-toggle-btn-1">
          <h6 class="dropdown-header">Pitch range</h6>
          <div class="dropdown-content">
            <div data-toggle="dropdown" class="dropdown-item" @click="changeRange(0.5, 'pitch-control-items')">+/- 50 %</div>
            <div class="dropdown-divider"></div>
            <div data-toggle="dropdown" class="dropdown-item" @click="changeRange(0.2, 'pitch-control-items')">+/- 20 %</div>
            <div class="dropdown-divider"></div>
            <div data-toggle="dropdown" class="dropdown-item" @click="changeRange(0.1, 'pitch-control-items')">+/- 10 %</div>
          </div>
        </div>
      </div>
      <ButtonIcon
        componentName="IconPlus"
        :permaClasses="buttonClasses"
        :midiLearn="midiLearn"
        @click="$refs.slider.increment()"
      />
      <ButtonIcon
        componentName="IconArrowsToCenter"
        :permaClasses="buttonClasses"
        :midiLearn="midiLearn"
        @click="$refs.slider.reset()"
      />
      <ButtonIcon
        componentName="IconMinus"
        :permaClasses="buttonClasses"
        :midiLearn="midiLearn"
        @click="$refs.slider.decrement()"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import VSlider from '@/components/VSlider.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import { useMainStore } from "@/store.js";
const storage = useMainStore()
const slider = ref(null)
const buttonClasses = ref('btn btn-square btn-lg m-10 mr-0')

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
const range = ref(props.deck.pitchRange)
const min = ref(1 - props.deck.pitchRange)
const max = ref(1 + props.deck.pitchRange)
// helper var used for bidirektional control
// slider -> store (via GUI)
// store -> slider (via midi)
let playbackRateString = ''

const changeRange = (newRange, id) => {
  storage.setPitchRange(props.deck.index, newRange)

  // TODO: how to properly close halfmoon dropdown on click?
  setTimeout(() => {
    document.getElementById(id).classList.remove('show')
  }, 10)
}

const sliderChange = (newPitchValue) => {
  playbackRateString = newPitchValue.toString()
  storage.setPlaybackRate(
    props.deck.index,
    parseFloat(newPitchValue)
  )
}

watch(() => props.deck.pitchRange, (pitchRange) => {
  console.log('watch pitchRange', pitchRange)
  range.value = pitchRange
  min.value = props.center - pitchRange
  max.value = props.center + pitchRange
})

watch(() => props.deck.playbackRate, (playbackRate) => {
  if (playbackRate.toString() !== playbackRateString) {
    playbackRateString = playbackRate.toString()
    slider.value.setSliderValueFromMidi(playbackRate)
  }
})

const pitchLabel = computed(() => {
  return `${range.value * 100}%`
})

onMounted(() => {
  halfmoon.onDOMContentLoaded()
  changeRange(props.deck.pitchRange, 'pitch-control-items')
})
</script>

<style lang="scss">

</style>
