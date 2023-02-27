<template>
    <button v-if="htmlLabel" v-html="label" :class="`btn ${permaClasses} ${activeClass}`" ref="btn" type="button">
    </button>
    <button v-else :class="`btn ${permaClasses} ${activeClass}`" ref="btn" type="button">
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
  },
  htmlLabel: {
    type: Boolean,
    default: false
  }
})
watch(() => props.activeClass, () => { })
</script>

<style lang="scss">

</style>
