<template>
    <div class="pitch-control">
        <div class="dropdown with-arrow">
            <button class="btn" data-toggle="dropdown" type="button" id="..." aria-haspopup="true" aria-expanded="false">
                {{pitchLabel}} <i class="fa fa-angle-down ml-5" aria-hidden="true"></i> <!-- ml-5 = margin-left: 0.5rem (5px) -->
            </button>
        <div class="dropdown-menu" aria-labelledby="dropdown-toggle-btn-1">
            <div class="dropdown-content">
              <div class="dropdown-item" @click="changeRange(0.5)" data-dismiss="dropdown-menu">+/- 50%</div>
              <div class="dropdown-item" @click="changeRange(0.2)">+/- 20%</div>
              <div class="dropdown-item" @click="changeRange(0.1)">+/- 10%</div>
            </div>
        </div>
        </div>
        <VSlider
          :minSliderValue="min"
          :maxSliderValue="max"
          @sliderChange="sliderChange"
          ref="slider"
        />
        <Button
          label="&#x2796;"
          :permaClasses="buttonClasses"
          @click="$refs.slider.decrement()"
        />
        <Button
          label="0"
          :permaClasses="buttonClasses"
          @click="$refs.slider.reset()"
        />
        <Button
          label="&#x2795;"
          :permaClasses="buttonClasses"
          @click="$refs.slider.increment()"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VSlider from '@/components/VSlider.vue'
import Button from '@/components/Button.vue'
const buttonClasses = ref('btn btn-square btn-lg m-10')
const range = ref(0.2)
const min = ref(0.8)
const max = ref(1.2)
const props = defineProps({
  center: {
    type: Number,
    default: 1
  }
})

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
