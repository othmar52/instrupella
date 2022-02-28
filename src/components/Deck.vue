<template>
  <div :class="`card deck deck-${index}`">
    <!--playbackRate: {{ playbackRate }} -->
    <WaveBig
      :track="track"
      :play="play"
      ref="player"
      :playbackRate="playbackRate"
      class="wave-big"
    />
    <br>
    
    <div class="d-flex">
      <button :class="buttonClasses" type="button" @click="$refs.player.seekZero()">|&lt;</button>
      <div id="deck-minimap" class="deck-minimap m-10"> </div>
      <button :class="buttonClasses" type="button" @click="togglePlay" v-html="play ? '&#9611;&#9611;' : '&#x25B6;'"></button>
      <button :class="buttonClasses" type="button" @click="$refs.player.nudgeBehind()">&#x2796;</button>
      <button :class="buttonClasses" type="button" @click="$refs.player.nudgeAhead()">&#x2795;</button>
      <button :class="buttonClasses" type="button" @click="$refs.player.nudgeAhead()">&#x1f507;</button>
    </div>
    <br>
    <PitchControl
      @pitchChange="setPitch"
    />
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import WaveBig from '@/components/WaveBig.vue'
import PitchControl from '@/components/PitchControl.vue'
const play = ref(false)
const playbackRate = ref(1)
const buttonClasses = ref('btn btn-square btn-primary btn-lg m-10')

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
const setPitch = (newPitchValue) => {
  playbackRate.value = newPitchValue
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../scss/_variables.scss";
.deck {
  .wave-big {
    width: 80%;
    display: inline-block;
  }
  .wave-timeline {
    width: 80%;
    display: inline-block;
  }
}
.deck-minimap {
    width: 50vw;
    height: var(--large-button-height);
    background: $waveFormBackground;
}

</style>
