<template>
  <div>
    <div v-if="midiLearn" class="btn btn-danger alt-dm"
    style="position: absolute; width: 22.5%; height: 80%; z-index: 200; opacity: 0.7;">
    
    </div>
    <div class="vslider slider" ref="sliderWrapper">
      <input
        type="range"
        orient="vertical"
        ref="sliderElement"
        @touchstart="disableScroll"
        @touchend="enableScroll"
        :max="sliderMaxValue"
        :step="props.step"
        :min="sliderMinValue"
        v-model="localSliderValue"
      />

    </div>
    <div v-if="showSliderValue">{{factor}}</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
const localSliderValue = ref(1)
const sliderElement = ref(null)
const bodyStyles = ref(document.querySelector('body').style)
const props = defineProps({
  bottomSliderValue: {
    type: [Number, String],
    default: 0.5,
    validator: value => !isNaN(value - parseFloat(value))
  },
  topSliderValue: {
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
  },
  showSliderValue: {
    type: Boolean,
    default: false
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})
const factor = computed(() => {
  return localSliderValue.value.toFixed(3)
})
const sliderMaxValue = computed(() => {
  return (props.bottomSliderValue > props.topSliderValue)
    ? props.bottomSliderValue
    : props.topSliderValue
})
const sliderMinValue = computed(() => {
  return (props.bottomSliderValue > props.topSliderValue)
    ? props.topSliderValue
    : props.bottomSliderValue
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
  if (localSliderValue.value + props.step <= sliderMaxValue.value) {
    localSliderValue.value += props.step
    return
  }
  localSliderValue.value = sliderMaxValue.value
}
const decrement = () => {
  if (localSliderValue.value - props.step >= sliderMinValue.value) {
    localSliderValue.value -= props.step
    return
  }
  localSliderValue.value = sliderMinValue.value
}
const reset = () => {
  localSliderValue.value = 1.0
}

const setSliderValueFromMidi = (newValue) => {
  localSliderValue.value = parseFloat(newValue)
}

watch(localSliderValue, (newValue) => {
  localSliderValue.value = parseFloat(newValue)
  emit('sliderChange', localSliderValue.value)
})

watch(() => props.topSliderValue, () => {
  if (localSliderValue.value > props.topSliderValue) {
    localSliderValue.value = props.topSliderValue
  }
})

watch(() => props.bottomSliderValue, () => {
  if (localSliderValue.value < props.bottomSliderValue) {
    localSliderValue.value = props.bottomSliderValue
  }
})

onMounted(() => {
  if (props.topSliderValue < props.bottomSliderValue) {
    // flip slider top to bottom
    sliderElement.value.style.transform = 'translate(-50%, -50%) rotate(90deg)';
  }
})

defineExpose({
  decrement,
  increment,
  reset,
  setSliderValueFromMidi
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
  border-radius: var(--button-border-radius);
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
