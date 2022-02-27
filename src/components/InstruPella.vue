<template>
  <div class="instrupella">
    <Deck :track="track" :index="0" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Deck from '@/components/Deck.vue'
const track = ref()

onMounted(() => {
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
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
