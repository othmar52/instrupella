<template>
  <Button
    v-if="!deleteMode || second === 0"
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
    activeClass="btn-danger"
    @click="deleteHotCue"
    :permaClasses="`${buttonClasses}`"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Button from '@/components/Button.vue'
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10 btn-hotcue font-size-16 text-muted')

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
  },
  deleteMode: {
    type: Boolean,
    default: false
  }
})

const deleteHotCue = () => {
  emit('deleteHotCue', props.index)
}

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
  'pressHotCueEnd',
  'deleteHotCue'
])

watch(() => props.track, () => { })

const activeClass = computed(() => {
  return props.second > 0 ? 'btn-primary' : ''
})

</script>

<style lang="scss">

</style>
