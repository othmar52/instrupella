<template>
  <Button
    label=""
    :permaClasses="`${buttonClasses}`"
    :activeClass="activeClass"
    @mousedown="pressHotCueStart"
    @touchstart="pressHotCueStart"
    @mouseup="pressHotCueEnd"
    @touchend="pressHotCueEnd"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Button from '@/components/Button.vue'
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10')

const eventStartHandled = ref(false)
const eventEndHandled = ref(false)
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  index: {
    type: Number
  },
  second: {
    type: Number,
    default: 0
  }
})

const pressHotCueStart = () => {
  if (eventStartHandled.value === false) {
    eventStartHandled.value = true
    setTimeout(function(){ eventStartHandled.value = false; }, 200);
    emit('pressHotCueStart', props.index)
  }
}

const pressHotCueEnd = () => {
  if (eventEndHandled.value === false) {
    eventEndHandled.value = true
    setTimeout(function(){ eventEndHandled.value = false; }, 200);
    emit('pressHotCueEnd', props.index)
  }
}

const emit = defineEmits([
  'pressHotCueStart',
  'pressHotCueEnd'
])

watch(() => props.track, () => { })

const activeClass = computed(() => {
  return props.second > 0 ? 'btn-primary' : ''
})

</script>

<style lang="scss">

</style>
