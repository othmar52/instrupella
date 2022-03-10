<template>
    <button :class="buttonClasses" ref="btn" type="button" :title="title">
      <component :is="IconPlay" v-if="componentName === 'IconPlay'"></component>
      <component :is="IconPause" v-if="componentName === 'IconPause'"></component>
      <component :is="IconArrowToFirst" v-if="componentName === 'IconArrowToFirst'"></component>
      <component :is="IconMute" v-if="componentName === 'IconMute'"></component>
      <component :is="IconPlus" v-if="componentName === 'IconPlus'"></component>
      <component :is="IconMinus" v-if="componentName === 'IconMinus'"></component>
      <component :is="IconArrowsToCenter" v-if="componentName === 'IconArrowsToCenter'"></component>
      <component :is="IconDownbeat" v-if="componentName === 'IconDownbeat'"></component>
      <component :is="IconMetronome" v-if="componentName === 'IconMetronome'"></component>
      <component :is="IconTrash" v-if="componentName === 'IconTrash'"></component>
      <component :is="IconMidi" v-if="componentName === 'IconMidiDin'"></component>
      <component :is="IconMidi" v-if="componentName === 'IconMidiLearn'"></component>
      <component :is="IconClock" v-if="componentName === 'IconClock'"></component>
    </button>
</template>

<script setup>
// ugly workaround for passing component to a component...
// but <component :is="props.componentName"></component> did not work
import { watch, onMounted, computed } from 'vue'
import IconPlay from '@/components/Icons/Play.vue'
import IconPause from '@/components/Icons/Pause.vue'
import IconArrowToFirst from '@/components/Icons/ArrowToFirst.vue'
import IconMute from '@/components/Icons/Mute.vue'
import IconPlus from '@/components/Icons/Plus.vue'
import IconMinus from '@/components/Icons/Minus.vue'
import IconArrowsToCenter from '@/components/Icons/ArrowsToCenter.vue'
import IconDownbeat from '@/components/Icons/Downbeat.vue'
import IconMetronome from '@/components/Icons/Metronome.vue'
import IconTrash from '@/components/Icons/Trash.vue'
import IconMidiDin from '@/components/Icons/MidiDin.vue'
import IconMidiLearn from '@/components/Icons/MidiLearn.vue'
import IconClock from '@/components/Icons/Clock.vue'
const props = defineProps({
  permaClasses: {
    type: String,
    default: 'btn'
  },
  activeClass: {
    type: String,
    default: ''
  },
  componentName: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})
watch(() => props.activeClass, () => {
})

const buttonClasses = computed(() => {
  return (props.midiLearn)
    ? `btn btn-danger alt-dm ${props.permaClasses}`
    : `btn ${props.permaClasses} ${props.activeClass}`
})

onMounted(() => {

})

defineExpose({

})
</script>

<style lang="scss">

</style>
