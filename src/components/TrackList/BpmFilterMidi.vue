<template>
  <div class="bpm-filter-midi backdropped" v-show="bpmFilterVisible">
    <h5>
      <span class="text-muted">Tempo filter: </span>
      <span v-if="bpmFilter === 'none'">OFF</span>
      <span v-else>{{bpmFilter}} <span class="text-muted">BPM</span></span>
    </h5>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMainStore } from "@/store.js"

const storage = useMainStore()
const props = defineProps({
  bpmFilterValues: {
    type: Array,
    default: []
  }
})
const bpmFilterMidi = computed(() => storage.getBpmFilterMidi)
const bpmFilter = ref('none')
const bpmFilterVisible = ref(false)
let fireTimeout = null

watch(() => storage.getBpmFilterMidi, (newValue) => {
  bpmFilter.value = props.bpmFilterValues[newValue]
  bpmFilterVisible.value = true
  if (fireTimeout) {
    clearTimeout(fireTimeout)
  }
  fireTimeout = setTimeout(() => {
    // console.log('fire bpmFilterMidi', bpmFilter.value)
    bpmFilterVisible.value = false
    emit(
      'setBpmFilter',
      bpmFilter.value === 'none'
        ? null
        : parseInt(bpmFilter.value)
    )
  }, 1000)
})

const emit = defineEmits([
  'setBpmFilter'
])

</script>

<style lang="scss">
</style>