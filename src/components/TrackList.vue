<template>
  <div class="card">
  <table class="track-list">
    <thead>
      <tr>
        <th colspan="5">
          <div class="container-fluid">
          <div class="row justify-content-center">
            <div class="col-sm-6 col-md-5 col-lg-6">
              <input
                type="search"
                class="form-control form-control-lg"
                placeholder="Search"
                v-model="searchInput"
                @keyup="searchEntries"
                @search="searchEntries"
              >
            </div>
          </div>
          </div>
          <div>
            <span
              v-for="tempo in bpmFilterValues" :key="tempo"
              @click="setBpmFilter(tempo)"
              :class="`btn btn-default ${(bpmFilter === tempo) ? 'btn-primary' : ''} m-5`">
              {{tempo}} BPM
            </span>
          </div>
        </th>
      </tr>
      <tr>
        <th>
            Artist - Title
            count {{filteredEntries.length}}
        </th>
        <th>KEY</th>
        <th>BPM</th>
        <th>LENGTH</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="track in filteredEntries" :key="track.id">
        <td>{{ track.artist }} - {{ track.title }}</td>
        <td>{{ track.key }}</td>
        <td :class="isManualBpm(track) ? 'text-success' : ''">{{ parseInt(getBpm(track))}}</td>
        <td>{{ formatDuration(track.length) }}</td>
        <td @click="loadTrack(track.id)">
          <strong class="btn btn-default btn-primary">LOAD</strong>
        </td>
      </tr>
    </tbody>
  </table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import utils from "../mixins/utils";
import formatDurationMixin from "../mixins/format/duration";

const { getBpm, isManualBpm } = utils();
const { formatDuration } = formatDurationMixin();
const props = defineProps({
  tracks: {
    type: Array,
    default: []
  }
})
const bpmFilterValues = ref([])
const bpmFilter = ref(null)
const length = ref(0)
const searchInput = ref('')
const filteredEntries = ref([])

const emit = defineEmits([
  'selectTrack'
])

const loadTrack = (trackIndex) => {
  // console.log('loadTrack(trackIndex)', trackIndex)
  
  const element = document.querySelector('.deck-0')
  if (!element) {
    return
  }
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'end'
  })
  setTimeout(() => { emit('selectTrack', trackIndex) }, 200)
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
      return tempoMatches(getBpm(track), bpmFilter.value)
    })
  }
}

const searchTermMatches = (track, searchTerm) => {
  for (const propName of ['artist', 'title', 'path']) {
    if (track[propName] && track[propName].toLowerCase().includes(searchTerm)) {
      return true
    }
  }
  return false
}

const tempoMatches = (trackTempo, tempo) => {
  return trackTempo && trackTempo >= tempo - 5 && trackTempo <= tempo + 5
}

// thanks to https://stackoverflow.com/questions/8273047/javascript-function-similar-to-python-range#8273091
const range = (start, stop, step = 1) => {
  if (typeof stop === 'undefined') {
    // one param defined
    stop = start
    start = 0
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
  height: 100%;
  width: 100%;

  /* Table */
  border-collapse: collapse;

  /* Text */
  text-align: left;
}

thead tr,
thead th {
  background: var(--dm-card-bg-color);
}
tr:nth-child(even) {
    background: var(--dm-input-bg-color);;
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
    padding: 10px;
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
