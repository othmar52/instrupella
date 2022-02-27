<template>
  <div :class="`deck deck-${index}`">
      pitch: {{ pitch }}
    <WaveBig :track="track" :play="play" ref="player"/>
    <br>

    <div id="deck-minimap" class="deck-minimap">
    </div>
    <button class="btn btn-square  btn-primary btn-lg" type="button" @click="$refs.player.seekZero()">|&lt;</button>
    <button class="btn btn-square  btn-primary btn-lg" type="button" @click="togglePlay">&#9658;</button>
    <button class="btn btn-square  btn-primary btn-lg" type="button" @click="$refs.player.nudgeBehind()">&lt;</button>
    <button class="btn btn-square  btn-primary btn-lg" type="button" @click="$refs.player.nudgeAhead()">&gt;</button>
    <br>
    <input type="range" min="0" max="1" step="0.001" orient="vertical" />
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import WaveBig from '@/components/WaveBig.vue'
const play = ref(false)
const pitch = ref(1)
defineProps({
  index: {
    type: Number,
    default: 0
  },
  track: {
    type: Object,
    default: null
  }
})
const togglePlay = () => {
  play.value = !play.value
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.deck-minimap {
    width: 50vw;
    background: black;
}
</style>
