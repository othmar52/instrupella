<template>
  <p></p>
  <table class="track-list">
    <thead>
      <tr colspan="5">
        <th>
          <div>
            <input type="text" class="form-control" placeholder="Search" v-model="searchInput" @keyup="searchEntries">
          </div>
          <div>
            <span
              v-for="tempo in bpmFilterValues" :key="tempo"
              @click="setBpmFilter(tempo)"
              :class="`btn btn-default ${(bpmFilter === tempo) ? 'btn-primary' : ''}`">
              {{tempo}} BPM
            </span>
          </div>
        </th>
      </tr>
      <tr>
        <th>
            Artist - Title
            count {{trackCount}}
            </th>
        <th>KEY</th>
        <th>BPM</th>
        <th>LENGTH</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="track in tracksToRender" :key="track.id">
        <td>{{ track.artist }} - {{ track.title }}</td>
        <td>{{ track.key }}</td>
        <td>{{ parseInt(track.bpmdetect) }}</td>
        <td>{{ formatDuration(track.length) }}</td>
        <td @click="loadTrack(track.id)">
          <strong class="btn btn-default">LOAD</strong>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
const props = defineProps({
  tracks: {
    type: Array,
    default: []
  }
})
const bpmFilterValues = ref([])
console.log(bpmFilterValues)
const bpmFilter = ref(null)
const length = ref(0)
const searchInput = ref('')
const filteredEntries = ref([])

const emit = defineEmits([
  'selectTrack'
])

const loadTrack = (trackIndex) => {
  // console.log('loadTrack(trackIndex)', trackIndex)
  emit('selectTrack', trackIndex)
  const element = document.querySelector('.deck-0')
  if (!element) {
    return
  }
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'end'
  })
}
const setBpmFilter = (tempo) => {
  bpmFilter.value = (bpmFilter.value === tempo) ? null : tempo
  searchEntries()
}
const searchEntries = () => {
  filteredEntries.value = props.tracks
  if (searchInput.value !== '') {
    filteredEntries.value = filteredEntries.value.filter(track => {
      return searchTermMatches(track, searchInput.value.toLowerCase())
    })
  }
  if (bpmFilter.value !== null) {
    filteredEntries.value = filteredEntries.value.filter(track => {
      return tempoMatches(track, bpmFilter.value)
    })
  }
  return filteredEntries.value
}

const searchTermMatches = (track, searchTerm) => {
  for (const propName of ['artist', 'title', 'path']) {
    if (track[propName] && track[propName].toLowerCase().includes(searchTerm)) {
      return true
    }
  }
  return false
}

const tempoMatches = (track, tempo) => {
  if (track.bpmdetect && track.bpmdetect >= tempo - 5 && track.bpmdetect <= tempo + 5) {
    return true
  }
  return false
}

const formatDuration = (duration) => {
  // thanks to https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds#answer-11486026
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600)
  const mins = ~~((duration % 3600) / 60)
  const secs = ~~duration % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}

const trackCount = computed(() => props.tracks.length)

const tracksToRender = computed(() => {
  return filteredEntries.value
})

// thanks to https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range#8273091
const range = (start, stop, step) => {
  if (typeof stop === 'undefined') {
    // one param defined
    stop = start
    start = 0
  }

  if (typeof step === 'undefined') {
    step = 1
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return []
  }

  const result = []
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i)
  }
  return result
}

onMounted(() => {
  bpmFilterValues.value = range(80, 180, 10)
})

watch(() => props.tracks, () => {
  searchEntries()
})
</script>

<style scoped lang="scss">
table {
  /* Display */
  width: 100%;
  height: 100%;

  /* Table */
  border-collapse: collapse;

  /* Text */
  text-align: left;
}

thead tr,
tr:nth-child(even) {
    background: #1b1b1b;
}
thead tr {
    border: 1px solid #777;
}

td, th {
    padding: 0.6em;
    text-align: center;
}
td:first-child,
th:first-child {

    text-align: left;
}
th {
    color: #BBB;
}
tbody tr:hover td {
    background-color: black;
}

table thead,
table tfoot {
  position: sticky;
}
table thead {
  inset-block-start: 0; /* "top" */
}
table tfoot {
  inset-block-end: 0; /* "bottom" */
}
</style>
