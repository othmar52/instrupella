<template>
  <div class="blazing-baton">
    <h4 class="text-muted">{{numericBaton4Bars}}<span :class="classHyphen1">-</span>{{numericBaton1Bar}}<span :class="classHyphen2">-</span>{{numericBatonQuarter}}
    <span
      v-for="idx in range(0,16)"
      :key="idx"
      :class="`btn btn-sm btn-square mr-5 ${ledClasses[idx]}`"
    ></span>
    </h4>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMidiStore } from "@/midistore.js";
import rangeMixin from '../../mixins/utils/range'

const { range } = rangeMixin()

const midistorage = useMidiStore()
const getExternalClockIsRunning = computed(
  () => midistorage.getExternalClockIsRunning
)
const getExternalClockQuarterNoteCounter = computed(
  () => midistorage.getExternalClockQuarterNoteCounter
)


const ledClasses = ref([])
const classHyphen1 = ref('')
const classHyphen2 = ref('')

let quarterNoteCounter = 1

const numericBatonQuarter = ref(1)
const numericBaton1Bar = ref(1)
const numericBaton4Bars = ref(1)

const classDefault = 'btn-default'
const classQuarter = 'btn-primary'
const class4Bar = 'btn-danger'
const classCountDown = 'btn-success'

const nextQuarterNote = () => {
  numericBatonQuarter.value++
  quarterNoteCounter++
  if (numericBatonQuarter.value > 4) {
    numericBatonQuarter.value = 1
    numericBaton1Bar.value++
  }
  if (numericBaton1Bar.value > 4) {
    numericBaton1Bar.value = 1
    numericBaton4Bars.value++
  }
  if (numericBaton4Bars.value > 4) {
    numericBaton4Bars.value = 1
  }
  if(quarterNoteCounter > 4 * 16) {
    quarterNoteCounter = 1
  }
  if (getExternalClockIsRunning.value  === false) {
    numericBatonQuarter.value = 1
    numericBaton1Bar.value = 1
    numericBaton4Bars.value = 1
  }
  setLedClasses()
  if (quarterNoteCounter % 2 === 1) {
    classHyphen1.value = 'text-primary'
    classHyphen2.value = ''
    return
  }
  classHyphen1.value = ''
  classHyphen2.value = 'text-primary'
}

const setLedClassesCountDown = () => {
  const indexRanges = []
  switch (quarterNoteCounter) {
    case 61:
      indexRanges.push([0,4])
      indexRanges.push([6,10])
      indexRanges.push([12,16])
      break
    case 62:
      indexRanges.push([2,6])
      indexRanges.push([10,14])
      break
    case 63:
      indexRanges.push([6,10])
      break
    case 64:
      indexRanges.push([0,16])
      break
  }
  for (const indexRange of indexRanges) {
    for (const idx of range(indexRange[0], indexRange[1])) {
      ledClasses.value[idx] = classCountDown
    }
  }
}

const resetLedClasses = () => {
  for (const idx of range(0, 16)) {
    ledClasses.value[idx] = classDefault
  }
}

const setLedClasses = () => {
  resetLedClasses()
  if (getExternalClockIsRunning.value  === false) {
    return
  }

  if (quarterNoteCounter > 4 * 16 - 4) {
    setLedClassesCountDown()
    return
  }

  // set quarter note classes
  const fillQuarterRange = (quarterNoteCounter % 16 === 0)
    ? 16
    : quarterNoteCounter % 16

  for (const idx of range(0, fillQuarterRange)) {
    ledClasses.value[idx] = classQuarter
  }

  // set 4 bar classes
  const withinBar = Math.ceil(quarterNoteCounter/16)
  const startBar = 12
  for (const idx of range(startBar, startBar + withinBar)) {
    ledClasses.value[idx] = class4Bar
  }
  ledClasses.value[fillQuarterRange-1] = classQuarter
}

watch(() => midistorage.getExternalClockIsRunning, (val) => {
  resetBaton()
  setLedClasses()
})
watch(() => midistorage.getExternalClockQuarterNoteCounter, (val) => {
  if (val > 1) {
    nextQuarterNote()
    return
  }
  resetBaton()
  setLedClasses()
})

const resetBaton = () => {
  quarterNoteCounter = 1
  numericBatonQuarter.value = 1
  numericBaton1Bar.value = 1
  numericBaton4Bars.value = 1
}

onMounted(() => {
  resetLedClasses()
})
</script>

<style lang="scss">

</style>
