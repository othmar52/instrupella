<template>
  <div class="instrupella">
    <div v-if="track">
      <Deck :track="track" :index="0" />
      <TrackList :tracks="tracks" @selectTrack="selectTrack"/>
    </div>
    <div v-else>
      loading...
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
  console.log(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/00-acajam.json`)
  fetch(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/00-acajam.json`)
    .then(response => response.json())
    .then(json => {
      tracks.value = json.map((track,idx)=> ({ ...track, id: idx }))
      track.value = tracks.value[0]
      console.log(track.value.artist)
      // console.log(this.tracks[0].path)
    })
})
</script>

<style lang="scss">

</style>
