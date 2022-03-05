<template>
  <select
    class="form-control form-control-sm m-5"
    v-model="bpmFilter"
    @change="setBpmFilter"
  >
    <option value="none">BPM filter</option>
    <option
      v-for="tempo in filterValues"
      :key="tempo"
      :value="tempo"
    >{{tempo}} BPM</option>
  </select>
  <button class="btn btn-default btn-sm m-5" @click="decrease">&lt;</button>
  <button class="btn btn-default btn-sm m-5" @click="increase">&gt;</button>
  <button class="btn btn-default btn-sm m-5" @click="clear">x</button>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  filterValues: {
    type: Array,
    default: []
  }
})

const bpmFilter = ref('none')
const setBpmFilter = (event) => {
  bpmFilter.value = event.target.value
  fireEmit()
}

const fireEmit = () => {
  emit(
    'setBpmFilter',
    bpmFilter.value === 'none'
      ? null
      : parseInt(bpmFilter.value)
  )
}

const increase = () => {
  const currentIndex = getIndexOfCurrentFilter()
  if (typeof props.filterValues[currentIndex + 1] !== 'undefined') {
    bpmFilter.value = props.filterValues[currentIndex + 1]
  }
  fireEmit()
}

const decrease = () => {
  const currentIndex = getIndexOfCurrentFilter()
  if (typeof props.filterValues[currentIndex - 1] !== 'undefined') {
    bpmFilter.value = props.filterValues[currentIndex - 1]
  }
  if (currentIndex === 0) {
    // first option is not included in props.filterValues
    bpmFilter.value = 'none'
  }
  fireEmit()
}

const clear = () => {
  bpmFilter.value = 'none'
  fireEmit()
}

const getIndexOfCurrentFilter = () => {
  return props.filterValues.findIndex(
    (item) => parseInt(item) === parseInt(bpmFilter.value)
  )
}

const emit = defineEmits([
  'setBpmFilter'
])

</script>