<template>
  <p></p>
  <table class="">
    <thead>
      <tr>
        <th>
            Artist - Title <input type="text" placeholder="Search..." v-model="searchInput" @keyup="searchEntries" />
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
        <td @click="loadTrack(track.id)"><strong>LOAD</strong></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const props = defineProps({
  tracks: {
    type: Array,
    default: []
  }
})
const length = ref(0)
const searchInput = ref("")
const filteredEntries = ref([])

const emit = defineEmits([
  'selectTrack'
])

const loadTrack = (trackIndex) => {
  console.log("loadTrack(trackIndex)", trackIndex)
  emit('selectTrack', trackIndex)
}
const searchEntries = () => {
  if (searchInput.value !== "") {
    console.log("searchInput", searchInput.value)
    filteredEntries.value = props.tracks.filter(track => {
      if(!track.artist || !track.title || !track.path) {
        return false
      }
      return (
        track.artist.toLowerCase().includes(searchInput.value.toLowerCase()) || track.title.toLowerCase().includes(searchInput.value.toLowerCase()) || track.path.toLowerCase().includes(searchInput.value.toLowerCase())
      )
    })
  }
}
const formatDuration = (duration) => {
  // thanks to https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds#answer-11486026
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

const trackCount = computed(() => props.tracks.length )

const tracksToRender = computed(() => {
  return (searchInput.value !== "") ? filteredEntries.value : props.tracks
})

</script>

<style scoped>
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
</style>

