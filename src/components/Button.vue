<template>
    <button :class="`btn ${permaClasses} ${activeClass}`" ref="btn" type="button">
      {{label}}
    </button>
</template>

<script setup>
import { watch } from 'vue'
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
watch(() => props.activeClass, () => { })
</script>

<style lang="scss">

</style>
