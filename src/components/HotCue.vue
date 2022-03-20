<template>
  <span v-if="midiLearn">
  <Button
    :label="`${index+1}`"
    activeClass="btn-danger alt-dm"
    :permaClasses="`${buttonClasses}`"
    @mousedown="pressHotCueStart"
    @touchstart="pressHotCueStart"
    @mouseup="pressHotCueEnd"
    @touchend="pressHotCueEnd"
  />
  </span>
  <span v-else>
  <Button
    v-if="!hotCues.deleteMode || hotCues.cues[index].second === null"
    :label="`${index+1}`"
    :permaClasses="`${buttonClasses}`"
    :activeClass="activeClass"
    @mousedown="pressHotCueStart"
    @touchstart="pressHotCueStart"
    @mouseup="pressHotCueEnd"
    @touchend="pressHotCueEnd"
  />
  <Button
    v-else
    label="x"
    activeClass="btn-danger alt-dm"
    @mousedown="pressHotCueStart"
    @touchstart="pressHotCueStart"
    @mouseup="pressHotCueEnd"
    @touchend="pressHotCueEnd"
    :permaClasses="`${buttonClasses}`"
  />
  </span>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Button from '@/components/Button.vue'
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10 btn-hotcue font-size-16 text-muted')

const eventStartHandled = ref(false)
const eventEndHandled = ref(false)
const props = defineProps({
  hotCues: {
    type: Object,
    default: {}
  },
  index: {
    type: Number
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const pressHotCueStart = () => {
  if (eventStartHandled.value === false) {
    eventStartHandled.value = true
    setTimeout(function () { eventStartHandled.value = false }, 200)
    emit('pressHotCueStart', props.index)
  }
}

const pressHotCueEnd = () => {
  if (eventEndHandled.value === false) {
    eventEndHandled.value = true
    setTimeout(function () { eventEndHandled.value = false }, 200)
    emit('pressHotCueEnd', props.index)
  }
}

const emit = defineEmits([
  'pressHotCueStart',
  'pressHotCueEnd'
])

const activeClass = computed(() => {
  return props.hotCues.cues[props.index].second !== null ? 'btn-primary' : ''
})

</script>

<style lang="scss">

</style>
