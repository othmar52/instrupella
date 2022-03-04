<template>
  <div class="instrupella">
    <div v-if="tracks">
      <Deck :track="track" :index="0" @updateTrack="persistUpdateTrack" />
      <TrackList :tracks="tracks" @selectTrack="selectTrack" />
    </div>
    <div v-else>
      loading tracklist...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Deck from '@/components/Deck.vue'
import TrackList from '@/components/TrackList.vue'
const track = ref(null)
const tracks = ref([])

const selectTrack = (trackIndex) => {
  track.value = tracks.value[trackIndex]
}

// how to persist edit's (tempo, downbeat, hotcues)?
// maybe local storage?
// or is it really necessary to use a database?
//   case yes - does it make sense to use mpd?
// for now simply set tracks.track prop without persisting...

const persistUpdateTrack = (properties) => {
  console.log('TODO: persist update track', properties)
  for (const [key, value] of Object.entries(properties)) {
    track.value[key] = value
  }
}

onMounted(() => {
  /*
  track.value = {
    // path: 'https://ia804502.us.archive.org/13/items/DontWatchTheDJ128BPMDry/Don%27t%20Watch%20The%20DJ%20128BPM%20Dry.mp3',
    path: './sample.mp3',
    artist: 'dont watch the DJ',
    title: 'dont watch the DJ',
    year: 1991,
    length: 437.565,
    bpmdetect: 141.019,
    bpm: 0,
    key: 'Bbm',
    downbeat: 4.234,
    hotcues: []
  }
  */
  // console.log(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/00-acajam.json`)
  fetch(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/00-acajam.json`)
    .then(response => response.json())
    .then(json => {
      tracks.value = json.map((track, idx) => ({ ...track, id: idx }))
      // track.value = tracks.value[0]
      // console.log(track.value.artist)
      // console.log(this.tracks[0].path)
    })
})
</script>

<style lang="scss">

</style>
