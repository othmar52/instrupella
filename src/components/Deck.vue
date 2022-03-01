<template>
  <div :class="`card p-0 deck deck-${index}`">
    <div class="zoom-control">
      <Button
        label="&#x2796;"
        :permaClasses="`btn btn-square btn-default m-5`"
        :activeClass="(pixelPerSecond === 50) ? 'disabled' : ''"
        @click="zoomOut"
      />
      <Button
        label="&#x2795;"
        :permaClasses="`btn btn-square btn-default m-5`"
        :activeClass="(pixelPerSecond === 700) ? 'disabled' : ''"
        @click="zoomIn"
      />
    </div>
    <!--playbackRate: {{ playbackRate }} -->
    <WaveBig
      :track="track"
      :play="play"
      :mute="mute"
      :playbackRate="playbackRate"
      :pixelPerSecond="pixelPerSecond"
      @trackEnd="trackEnd"
      ref="player"
      class="wave-big"
    />
    <div class="d-flex">
      <Button
        label="|&lt;"
        :permaClasses="`${buttonClasses}`"
        @click="$refs.player.seekZero()"
      />
      <div id="deck-minimap" class="deck-minimap m-10"></div>
      <Button
        :label="play ? '&#9611;&#9611;' : '&#x25B6;'"
        :permaClasses="`${buttonClasses}`"
        :activeClass="play ? 'btn-primary' : ''"
        @click="togglePlay"
      />
      <Button
        label="&#x2796;"
        :permaClasses="`rounded-circle ${buttonClasses}`"
        @click="$refs.player.nudgeBehind()"
      />
      <Button
        label="&#x2795;"
        :permaClasses="`rounded-circle ${buttonClasses}`"
        @click="$refs.player.nudgeAhead()"
      />
      <Button
        label="&#x1f507;"
        :permaClasses="`${buttonClasses}`"
        :activeClass="mute ? 'btn-danger' : ''"
        @click="toggleMute"
      />
    </div>
    <br />
    <PitchControl @pitchChange="setPitch" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WaveBig from '@/components/WaveBig.vue'
import Button from '@/components/Button.vue'
import PitchControl from '@/components/PitchControl.vue'
const player = ref(null)
const play = ref(false)
const mute = ref(false)
const pixelPerSecond = ref(400)
const playbackRate = ref(1)
const buttonClasses = ref('btn btn-square btn-default btn-lg m-10')

// const muteState = computed(() => false )

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
const toggleMute = () => {
  mute.value = !mute.value
}
const setPitch = (newPitchValue) => {
  playbackRate.value = newPitchValue
}

const trackEnd = () => {
  play.value = false
  mute.value = false
}
const zoomIn = () => {
  if (pixelPerSecond.value >= 700) {
    return
  }
  if (pixelPerSecond.value === 50) {
    zoomTo(100)
    return
  }
  zoomTo(pixelPerSecond.value + 100)
}

const zoomOut = () => {
  if (pixelPerSecond.value <= 50) {
    return
  }
  if (pixelPerSecond.value <= 100) {
    zoomTo(50)
    return
  }
  zoomTo(pixelPerSecond.value - 100)
}

const zoomTo = (pxPerSec) => {
  pixelPerSecond.value = pxPerSec
}

/*
const zoomInButton = computed(() => {
  return parseFloat(localSliderValue.value).toFixed(3)
})
*/

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../scss/_variables.scss";
.deck {
  .wave-dragger {
    z-index: 102;
  }
  .wave-big {
    width: 80%;
    display: inline-block;
  }
  .wave-timeline {
    width: 80%;
    display: inline-block;
  }
  .zoom-control {
    position: absolute;
    z-index: 103;
  }
}
.deck-minimap {
  width: 50vw;
  height: var(--large-button-height);
  background: $waveFormBackground;
}
</style>
