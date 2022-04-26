<template>
  <div class="card">
  <BpmFilterMidi
    :bpmFilterValues="bpmFilterMidiValues"  
    @setBpmFilter="setBpmFilter"
  />
  <table class="track-list table table-striped table-hover">
    <thead>
      <tr>
        <th colspan="6">
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
      </tr>
    </thead>
    <tbody class="touchscreen-noselect">
      <tr
        v-for="track in filteredEntries"
        :key="track.id"
        :class="trackRowClass(track)"
        :id="`track-row-${track.id}`"
      >
        <td>
          <strong v-if="storage.getDeckIndexForTrackId(track.id) >= 0">
            <span class="btn btn-default btn-primary">D{{storage.getDeckIndexForTrackId(track.id)*1 + 1}}</span>
          </strong>
          <span v-html="formatArtistTitle(track)"></span>
        </td>
        <td>
          <IconArrow v-if="track.like > 0" additionalClasses="icon-in-text text-success" />
          <IconArrow v-if="track.like < 0" additionalClasses="icon-in-text text-danger icon-arrow-down" />
        </td>
        <td>{{ track.key }}</td>
        <td>
          <ColoredTempo :track="track" />
        </td>
        <td>{{ formatDuration(track.length) }}</td>
        <td class="d-flex">
          <span
            @mousedown="storage.sniffAudioStart(track)"
            @touchstart="storage.sniffAudioStart(track)"
            @mouseup="storage.sniffAudioStop()"
            @touchend="storage.sniffAudioStop()"
          >
          <strong :class="`btn btn-default ${storage.getSniffAudioIsPlaying === track.id ? 'btn-primary' : ''}`">
            <IconPlay additionalClasses="icon-in-text" />
          </strong>
        </span>
        <span @click="storage.loadTrack(0, track.id)" class="noselect">
          <strong v-if="storage.getDeckIndexForTrackId(track.id) < 0">
            <span :class="`ml-5 btn btn-default ${midistorage.getAdditionalClassForGuiElement('d.0.loadTrack')}`">LOAD</span>
          </strong>
        </span>
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
import mapValueMixin from '../../mixins/utils/mapValue'
import BpmFilter from '@/components/TrackList/BpmFilter.vue'
import BpmFilterMidi from '@/components/TrackList/BpmFilterMidi.vue'
import ColoredTempo from '@/components/ColoredTempo.vue'
import IconArrow from '@/components/Icons/Arrow.vue'
import IconPlay from '@/components/Icons/Play.vue'
import { useMainStore } from "@/store.js";
import { useMidiStore } from "@/midistore.js";

const { formatArtistTitle } = formatArtistTitleMixin()
const storage = useMainStore()
const midistorage = useMidiStore()
const { getBpm } = utils()
const { range } = rangeMixin()
const { formatDuration } = formatDurationMixin()
const { mapValue } = mapValueMixin()
const props = defineProps({
  tracks: {
    type: Array,
    default: []
  }
})
const bpmFilterValues = ref([])
const bpmFilterMidiValues = ref([])
const bpmFilter = ref(null)
const length = ref(0)
const searchInput = ref('')
const filteredEntries = ref([])

const bpmFilterStep = 5

// only needed for browsing via midi controller
let focusedTrackIndex = 0

watch(() => storage.loadCurrentTrackFocusToDeck, (value) => {
  if (value === false) {
    return
  }
  storage.setLoadCurrentTrackFocusToDeck(false)
  if (filteredEntries.value.length === 0) {
    return
  }
  storage.loadTrack(value, filteredEntries.value[focusedTrackIndex].id)
})

watch(() => storage.scrollToNextTrack, (value) => {
  if (value === false) {
    return
  }
  storage.setScrollToNextTrack(false)
  if (filteredEntries.value.length === 0) {
    focusedTrackIndex = 0
    return
  }
  focusedTrackIndex ++
  if (focusedTrackIndex > filteredEntries.value.length - 1) {
    focusedTrackIndex = 0
  }
  handleTrackFocusChange()
})


watch(() => storage.scrollToFocusedTrack, (value) => {
  if (value === false) {
    return
  }
  storage.setScrollToFocusedTrack(false)
  handleTrackFocusChange()
})


watch(() => storage.scrollToPreviousTrack, (value) => {
  if (value === false) {
    return
  }
  storage.setScrollToPreviousTrack(false)
  if (filteredEntries.value.length === 0) {
    focusedTrackIndex = 0
    return
  }
  focusedTrackIndex --
  if (focusedTrackIndex < 0) {
    focusedTrackIndex = filteredEntries.value.length - 1
  }
  handleTrackFocusChange()
})

watch(() => storage.scrollToRandomTrack, (value) => {
  if (value === false) {
    return
  }
  storage.setScrollToRandomTrack(false)
  if (filteredEntries.value.length === 0) {
    focusedTrackIndex = 0
    return
  }
  focusedTrackIndex = Math.floor(Math.random() * filteredEntries.value.length)
  handleTrackFocusChange(true)
})

const handleTrackFocusChange = (sniffAudio = false) => {
  // console.log(`#track-row-${filteredEntries.value[focusedTrackIndex].id}`)
  document.querySelector(`#track-row-${filteredEntries.value[focusedTrackIndex].id}`).scrollIntoView({
    behavior: 'auto',
    block: 'center'
  })
  storage.setCurrentTrackFocus(filteredEntries.value[focusedTrackIndex])
  if (sniffAudio === false) {
    return
  }
  storage.sniffAudioStartMidi()
}

const loadRandom = () => {
  const randomItem = filteredEntries.value[Math.floor(Math.random()*filteredEntries.value.length)];
  if (randomItem) {
    storage.loadTrack(0, randomItem.id)
  }
}

const trackRowClass = (track) => {
  return (storage.getCurrentTrackFocus && storage.getCurrentTrackFocus.id === track.id)
    ? 'table-primary'
    : ''
}

const setBpmFilter = (tempo) => {
  bpmFilter.value = tempo
  // console.log('setBpmFilter', tempo)
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
  focusedTrackIndex = 0
  storage.setCurrentTrackFocus(
    filteredEntries.value.length
      ? filteredEntries.value[0]
      : null
  )
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
  for (const tempo of range(0, 215, bpmFilterStep)) {
    const tracksWithTempo = props.tracks.filter(track => {
      return tempoMatches(getBpm(track), tempo)
    })
    if (tracksWithTempo.length > 0) {
      bpmFilterValues.value.push(tempo)
    }
  }
  assertMidiFilterValues()
  searchEntries()
})

/**
 * this fills an array with index cc value (0-127) and values tempos of existing tracks
 * we have to ensure:
 *   that each cc value brings a tempo result
 *   to exclude tempos that do not exist
 */
const assertMidiFilterValues = () => {
  const tmpFilterValues = []
  for (const track of props.tracks) {
    const trackTempo = parseInt(getBpm(track))
    const fuzzyTempoDiff = Math.floor(bpmFilterStep/2)
    for(const tempo of range(trackTempo - fuzzyTempoDiff, trackTempo + fuzzyTempoDiff)) {
      if (tempo < 0) {
        continue
      }
      tmpFilterValues.push(tempo)
    }
    let trackTempoFactor = trackTempo * 2
    for(const tempo of range(trackTempoFactor - fuzzyTempoDiff, trackTempoFactor + fuzzyTempoDiff)) {
      if (tempo < 0) {
        continue
      }
      if (tempo > 200) {
        continue
      }
      tmpFilterValues.push(tempo)
    }
    trackTempoFactor = parseInt(trackTempo / 2)
    for(const tempo of range(trackTempoFactor - fuzzyTempoDiff, trackTempoFactor + fuzzyTempoDiff)) {
      if (tempo < 0) {
        continue
      }
      if (tempo > 200) {
        continue
      }
      tmpFilterValues.push(tempo)
    }
  }
  let tmpFilterValues2 = tmpFilterValues.filter(
    (value, index, self) => self.indexOf(value) === index
  ).sort((a, b) => a - b)

  bpmFilterMidiValues.value = ['none']
  // we need exactly 127 values (1 - 127)
  for (const ccValue of range(0, 127)) {
    let grabIndex = Math.floor(mapValue(ccValue, 0, 127, 0, tmpFilterValues2.length))
    bpmFilterMidiValues.value.push(tmpFilterValues2[grabIndex])
  }

  searchEntries()
}
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
