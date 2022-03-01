<template>
    <div class="vslider slider" ref="sliderWrapper">
      <input
        type="range"
        orient="vertical"
        :min="props.minSliderValue"
        :step="props.step"
        :max="props.maxSliderValue"
        v-model="localSliderValue"
      />
      <span>{{factor}}</span>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
const localSliderValue = ref(1)
const props = defineProps({
  minSliderValue: {
    type: [Number, String],
    default: 0.5,
    validator: value => !isNaN(value - parseFloat(value))
  },
  maxSliderValue: {
    type: [Number, String],
    default: 1.5,
    validator: value => !isNaN(value - parseFloat(value))
  },
  step: {
    type: Number,
    default: 0.001
  },
  nudge: {
    type: Number,
    default: 0.005
  }
})
const factor = computed(() => {
  return parseFloat(localSliderValue.value).toFixed(3)
})
const emit = defineEmits([
  'sliderChange'
])

const increment = () => {
  if (localSliderValue.value + props.nudge <= props.maxSliderValue) {
    localSliderValue.value += props.nudge
  }
}
const decrement = () => {
  if (localSliderValue.value - props.nudge >= props.minSliderValue) {
    localSliderValue.value -= props.nudge
  }
}
const reset = () => {
  localSliderValue.value = 1
}

watch(localSliderValue, (newValue) => {
  emit('sliderChange', parseFloat(newValue))
})

watch(() => props.maxSliderValue, () => {
  if (localSliderValue.value > props.maxSliderValue) {
    localSliderValue.value = props.maxSliderValue
  }
})

watch(() => props.minSliderValue, () => {
  if (localSliderValue.value < props.minSliderValue) {
    localSliderValue.value = props.minSliderValue
  }
})

onMounted(() => {

})

defineExpose({
  decrement,
  increment,
  reset
})
</script>

<style lang="scss">
input[type=range][orient=vertical]
{
    -webkit-appearance: slider-vertical; /* Chromium */
    width: 8px;
    height: 175px;
    padding: 0 5px;
}
</style>
