<template>
  <Button
    :label="`${index}`"
    :permaClasses="`${buttonClasses}`"
    activeClass="btn-primary"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import Button from '@/components/Button.vue'
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10')
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  index: {
    type: Number
  }
})
watch(() => props.track, () => { })
</script>

<style lang="scss">

</style>
