<template>
  <div class="pitch-control d-flex">
    <div class="">
      <VSlider
        :minSliderValue="min"
        :maxSliderValue="max"
        :showSliderValue="true"
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
        @click="$refs.slider.increment()"
      />
      <ButtonIcon
        componentName="IconArrowsToCenter"
        :permaClasses="buttonClasses"
        @click="$refs.slider.reset()"
      />
      <ButtonIcon
        componentName="IconMinus"
        :permaClasses="buttonClasses"
        @click="$refs.slider.decrement()"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VSlider from '@/components/VSlider.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
const buttonClasses = ref('btn btn-square btn-lg m-10 mr-0')
const range = ref(0.1)
const min = ref(0.8)
const max = ref(1.2)
const props = defineProps({
  center: {
    type: Number,
    default: 1
  }
})

const changeRange = (newRange, id) => {
  range.value = newRange
  min.value = props.center - newRange
  max.value = props.center + newRange

  // TODO: how to properly close halfmoon dropdown on click?
  setTimeout(() => {
    document.getElementById(id).classList.remove('show')
  }, 10)
}

const sliderChange = (newPitchValue) => {
  emit('pitchChange', parseFloat(newPitchValue))
}

const pitchLabel = computed(() => {
  return `${range.value * 100}%`
})

const emit = defineEmits([
  'pitchChange'
])

onMounted(() => {
  halfmoon.onDOMContentLoaded()
})
</script>

<style lang="scss">

</style>
