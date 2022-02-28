<template>
    <button :class="`btn ${permaClasses} ${activeClass}`" ref="btn" type="button">
      {{label}}
    </button>
</template>

<script setup>
import { watch, onMounted } from 'vue'
const props = defineProps({
  permaClasses: {
    type: String,
    default: 'btn'
  },
  activeClass: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})
watch(() => props.activeClass, () => {
})
/**
const factor = computed(() => {
  return parseFloat(localSliderValue.value).toFixed(2)
})

watch(localSliderValue, (newValue) => {
  emit('sliderChange', parseFloat(newValue))
})

watch(() => props.activeClass, () => {
  if (localSliderValue.value > props.maxSliderValue) {
    localSliderValue.value = props.maxSliderValue
  }
})
 */
onMounted(() => {

})

defineExpose({

})
</script>

<style lang="scss">

</style>
