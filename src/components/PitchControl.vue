<template>
    <div class="pitch-control">
        <div class="dropdown with-arrow">
            <button class="btn" data-toggle="dropdown" type="button" id="..." aria-haspopup="true" aria-expanded="false">
                {{pitchLabel}} <i class="fa fa-angle-down ml-5" aria-hidden="true"></i> <!-- ml-5 = margin-left: 0.5rem (5px) -->
            </button>
        <div class="dropdown-menu" aria-labelledby="dropdown-toggle-btn-1">
            <h6 class="dropdown-header">Pitch range</h6>
            <div class="dropdown-item" @click="changeRange(0.5)" data-dismiss="dropdown-menu">+/- 50%</div>
            <div class="dropdown-item" @click="changeRange(0.2)">+/- 20%</div>
            <div class="dropdown-item" @click="changeRange(0.1)">+/- 10%</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-content">
            <button class="btn btn-block" type="button">Button</button>
            </div>
        </div>
        </div>
        <VSlider
          :minSliderValue="min"
          :maxSliderValue="max"
          @sliderChange="sliderChange"
          ref="slider"
        />
        <button :class="buttonClasses" type="button" @click="$refs.slider.decrement()">&#x2796;</button>
        <button :class="buttonClasses" type="button" @click="$refs.slider.reset()">0</button>
        <button :class="buttonClasses" type="button" @click="$refs.slider.increment()">&#x2795;</button>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, computed } from 'vue'
import VSlider from '@/components/VSlider.vue'
const buttonClasses = ref('btn btn-square btn-primary btn-lg m-10')
const range = ref(0.5)
const min = ref(0.5)
const max = ref(1.5)
const props = defineProps({
  center: {
    type: Number,
    default: 1
  }
})

const track = ref()

const changeRange = (newRange) => {
  range.value = newRange
  min.value = props.center - newRange
  max.value = props.center + newRange
}

const sliderChange = (newPitchValue) => {
  emit('pitchChange', parseFloat(newPitchValue))
}

const pitchLabel = computed(() => {
  return `+/- ${range.value * 100} %`
})

const emit = defineEmits([
  'pitchChange'
])

onMounted(() => {

})
</script>

<style lang="scss">

</style>
