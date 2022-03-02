<template>
  <div>
    <div class="vslider slider" ref="sliderWrapper">
      <input
        type="range"
        orient="vertical"
        @touchstart="disableScroll"
        @touchend="enableScroll"
        :min="props.minSliderValue"
        :step="props.step"
        :max="props.maxSliderValue"
        v-model="localSliderValue"
      />
      
    </div>
    <div>{{factor}}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
const localSliderValue = ref(1)
const bodyStyles = ref(document.querySelector('body').style)
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
  return localSliderValue.value.toFixed(3)
})

const emit = defineEmits([
  'sliderChange'
])

// https://markus.oberlehner.net/blog/simple-solution-to-prevent-body-scrolling-on-ios/
const disableScroll = () => {
  bodyStyles.value.overflow = 'hidden'
  bodyStyles.value.position = 'fixed'
  bodyStyles.value.top = '0'
}
const enableScroll = () => {
  bodyStyles.value.removeProperty('overflow')
  bodyStyles.value.removeProperty('position')
  bodyStyles.value.removeProperty('top')
}
const increment = () => {
  if (localSliderValue.value + props.nudge <= props.maxSliderValue) {
    localSliderValue.value += props.nudge
    return
  }
  localSliderValue.value = props.maxSliderValue
}
const decrement = () => {
  if (localSliderValue.value - props.nudge >= props.minSliderValue) {
    localSliderValue.value -= props.nudge
    return
  }
  localSliderValue.value = props.minSliderValue
}
const reset = () => {
  localSliderValue.value = 1.0
}

watch(localSliderValue, (newValue) => {
  localSliderValue.value = parseFloat(newValue)
  emit('sliderChange', localSliderValue.value)
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
$track-w: 15em;
$track-h: .25em;
$thumb-d: 3.5em;

@mixin track() {
  box-sizing: border-box;
  border: none;
  width: $track-w; height: $track-h;
  background: #ccc;
}

@mixin thumb() {
  box-sizing: border-box;
  border: none;
  width: $thumb-d/3;
  height: $thumb-d;
  background-color: var(--dm-button-primary-bg-color);
}

.vslider {
  float: left;
  position: relative;
  margin: 0;
  padding: 0;
  height: $track-w;
  width: $thumb-d;
}

input[type=range][orient=vertical] {
  &, &::-webkit-slider-thumb {
    -webkit-appearance: none;
  }
  
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  padding: 0;
  width: $track-w;
  height: 3em;
  transform: translate(-50%, -50%) 
    rotate(-90deg);
  background: transparent;
  font: 1em/1 arial, sans-serif;
  
  &::-webkit-slider-runnable-track {
    @include track
  }
  &::-moz-range-track { @include track }
  &::-ms-track { @include track }
  
  &::-webkit-slider-thumb {
    margin-top: .5*($track-h - $thumb-d);
    @include thumb
  }
  &::-moz-range-thumb { @include thumb }
  &::-ms-thumb {
    margin-top: 0;
    @include thumb
  }
  
  &::-ms-tooltip { display: none }
}
</style>
