<template>
  <div class="blazing-baton">
    <h4 class="text-muted">{{numericBaton4Bars}}<span :class="classHyphen1">-</span>{{numericBaton1Bar}}<span :class="classHyphen2">-</span>{{numericBatonQuarter}}
    <span
      v-for="idx in range(0,16)"
      :key="idx"
      :class="`btn btn-sm btn-square mr-5 ${ledClasses[idx]}`"
    ></span>
    <span>{{debouncedTempo}}</span>
    </h4>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import rangeMixin from '../../mixins/utils/range'

const { range } = rangeMixin()
const isRunning = ref(false)
const ppqn = 24

// independent from start/stop state
// because many midi clocks send ticks during stop as well
let trackedTempo = 0
let trackedTempoCounter = 0
let trackedTempoLastQuarter = 0
let debouncedTempo = ref(0)


const ledClasses = ref([])

let tickCounterQuarterLoop = 0
let quarterNoteCounter = ref(1)

const numericBatonQuarter = ref(1)
const numericBaton1Bar = ref(1)
const numericBaton4Bars = ref(1)

const classDefault = 'btn-default'
const classQuarter = 'btn-primary'
const class4Bar = 'btn-danger'
const classCountDown = 'btn-success'

const classHyphen1 = computed(() => {
  return (isRunning.value === false && quarterNoteCounter.value % 2 === 1 )
    ? 'text-primary'
    : ''
})
const classHyphen2 = computed(() => {
  return (isRunning.value === false && quarterNoteCounter.value % 2 === 0 )
    ? 'text-primary'
    : ''
})

const nextQuarterNote = () => {
  numericBatonQuarter.value++
  quarterNoteCounter.value++
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
  if(quarterNoteCounter.value > 4 * 16) {
    quarterNoteCounter.value = 1
  }
  if (isRunning.value === false) {
    numericBatonQuarter.value = 1
    numericBaton1Bar.value = 1
    numericBaton4Bars.value = 1
  }
  setLedClasses()
}

const setLedClassesCountDown = () => {
  const indexRanges = []
  switch (quarterNoteCounter.value) {
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
  if (isRunning.value === false) {
      return
  }

  if (quarterNoteCounter.value > 4 * 16 - 4) {
    setLedClassesCountDown()
    return
  }

  // set quarter note classes
  const fillQuarterRange = (quarterNoteCounter.value % 16 === 0)
    ? 16
    : quarterNoteCounter.value % 16

  for (const idx of range(0, fillQuarterRange)) {
    ledClasses.value[idx] = classQuarter
  }

  // set 4 bar classes
  const withinBar = Math.ceil(quarterNoteCounter.value/16)
  const startBar = 12
  for (const idx of range(startBar, startBar + withinBar)) {
    ledClasses.value[idx] = class4Bar
  }
  ledClasses.value[fillQuarterRange-1] = classQuarter
}

const messageClock = (midiEvent) => {
  tickCounterQuarterLoop++
  if (tickCounterQuarterLoop >= ppqn) {
    tickCounterQuarterLoop = 0
    nextQuarterNote()
  }
  trackedTempoCounter++
  if (trackedTempoCounter % ppqn === 0) {
    trackedTempoCounter = 0
    if (trackedTempoLastQuarter === 0) {
      trackedTempoLastQuarter = new Date().getTime()
      return
    }
    trackedTempo = 60000 / (new Date().getTime() - trackedTempoLastQuarter)
    trackedTempoLastQuarter = new Date().getTime()
    if (debouncedTempo.value === 0) {
      debouncedTempo.value = trackedTempo
      return
    }
    debouncedTempo.value = debouncedTempo.value*0.9 + trackedTempo*0.1
    if (!isFinite(debouncedTempo.value) || debouncedTempo.value > 300) {
      debouncedTempo.value = trackedTempo
    }
  }
}

const messageStart = (midiEvent) => {
  isRunning.value = true
  resetBaton()
  setLedClasses()
}

const messageStop = (midiEvent) => {
  isRunning.value = false
  resetBaton()
  setLedClasses()
}

const resetBaton = () => {
  tickCounterQuarterLoop = 0
  quarterNoteCounter.value = 1
  numericBatonQuarter.value = 1
  numericBaton1Bar.value = 1
  numericBaton4Bars.value = 1
}

defineExpose({
  messageClock,
  messageStart,
  messageStop
})

onMounted(() => {
  resetLedClasses()
})
</script>

<style lang="scss">

</style>
