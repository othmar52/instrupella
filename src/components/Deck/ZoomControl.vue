<template>

  <div class="zoom-control">
    <ButtonIcon
      componentName="IconMinus"
      :permaClasses="`btn btn-square btn-default m-5`"
      :activeClass="(pixelPerSecond === 50) ? 'disabled' : ''"
      @click="zoomOut"
    />
    <ButtonIcon
      componentName="IconPlus"
      :permaClasses="`btn btn-square btn-default m-5`"
      :activeClass="(pixelPerSecond === 700) ? 'disabled' : ''"
      @click="zoomIn"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
const props = defineProps({
  pixelPerSecond: {
    type: Number
  }
})

const emit = defineEmits([
  'zoomTo'
])

const zoomIn = () => {
  if (props.pixelPerSecond >= 700) {
    return
  }
  if (props.pixelPerSecond === 50) {
    emit('zoomTo', 100)
    return
  }
  emit('zoomTo', props.pixelPerSecond + 100)
}

const zoomOut = () => {
  if (props.pixelPerSecond <= 50) {
    return
  }
  if (props.pixelPerSecond <= 100) {
    emit('zoomTo', 50)
    return
  }
  emit('zoomTo', props.pixelPerSecond - 100)
}

// watch(() => props.pixelPerSecond, () => { })
</script>

<style lang="scss">

</style>
