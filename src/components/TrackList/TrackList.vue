<template>
  <div class="card">
  <table class="track-list table table-striped table-hover">
    <thead>
      <tr>
        <th colspan="7">
          <div class="container-fluid">
          <div class="row justify-content-center">
            <div class="col-2">
              <span class="btn" @click="loadRandom">Random</span>
            </div>
            <div class="col-4">
              <input
                type="search"
                class="form-control form-control-lg"
                placeholder="Search"
                v-model="searchInput"
                @keyup="searchEntries"
                @search="searchEntries"
              >
            </div>
            <div class="col-1"></div>
            <div class="col-4 d-flex">
              <BpmFilter
                :filterValues="bpmFilterValues"
                @setBpmFilter="setBpmFilter"
              />
            </div>
          </div>
          </div>
        </th>
      </tr>
      <tr>
        <th>
            Artist - Title
            count {{filteredEntries.length}}
        </th>
        <th></th>
        <th>KEY</th>
        <th>BPM</th>
        <th>LENGTH</th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="track in filteredEntries"
        :key="track.id"
        :class="storage.getDeckIndexForTrackId(track.id) >= 0 ? 'table-primary' : ''"
      >
        <td v-html="formatArtistTitle(track)"></td>
        <td>
          <span v-if="track.like > 0" class="text-success">&#129093;</span>
          <span v-if="track.like < 0" class="text-danger">&#129095;</span>
        </td>
        <td>{{ track.key }}</td>
        <td>
          <ColoredTempo :track="track" />
        </td>
        <td>{{ formatDuration(track.length) }}</td>
        <td
          @mousedown="storage.sniffAudioStart(track)"
          @touchstart="storage.sniffAudioStart(track)"
          @mouseup="storage.sniffAudioStop()"
          @touchend="storage.sniffAudioStop()"
        >
          <strong class="btn btn-default btn-primary">&#9658;</strong>
        </td>
        <td @click="storage.loadTrack(0, track.id)">
          <strong class="btn btn-default btn-primary">LOAD</strong>
        </td>
      </tr>
    </tbody>
  </table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import utils from '../../mixins/utils'
import rangeMixin from '../../mixins/utils/range'
import formatDurationMixin from '../../mixins/format/duration'
import formatArtistTitleMixin from '../../mixins/format/artisttitle'

import BpmFilter from '@/components/TrackList/BpmFilter.vue'
import ColoredTempo from '@/components/ColoredTempo.vue'
import { useMainStore } from "@/store.js";
const { formatArtistTitle } = formatArtistTitleMixin()
const storage = useMainStore()
const { getBpm } = utils()
const { range } = rangeMixin()
const { formatDuration } = formatDurationMixin()
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

const bpmFilterStep = 5

const loadRandom = () => {
  const randomItem = filteredEntries.value[Math.floor(Math.random()*filteredEntries.value.length)];
  if (randomItem) {
    storage.loadTrack(0, randomItem.id)
  }
}

const setBpmFilter = (tempo) => {
  bpmFilter.value = tempo
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
      return tempoMatches(getBpm(track), parseInt(bpmFilter.value))
        // TODO: make double&half tempo matches optional by configuration
        || tempoMatches(getBpm(track)/2, parseInt(bpmFilter.value))
        || tempoMatches(getBpm(track)*2, parseInt(bpmFilter.value))
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
  const tempoDiff = bpmFilterStep/2
  return trackTempo !== null && trackTempo >= tempo - tempoDiff && trackTempo <= tempo + tempoDiff
}

watch(() => props.tracks, () => {
  bpmFilterValues.value = []
  for (const tempo of range(0, 180, bpmFilterStep)) {
    const tracksWithTempo = props.tracks.filter(track => {
      return tempoMatches(getBpm(track), tempo)
    })
    if (tracksWithTempo.length > 0) {
      bpmFilterValues.value.push(tempo)
    }
  }
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

.table td,
.table th {
    padding: 0.6em;
    text-align: center;
    &:first-child {
      text-align: left;
    }
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
