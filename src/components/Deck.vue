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
    <div class="wave-big-wrap">
      <Transition name="slide-fade">
        <div class="load-track" v-if="loadProgress >0 && loadProgress < 100">
          <h3>Loading</h3>
          <div class="progress">
            <div class="progress-bar" role="progressbar" :style="`width: ${loadProgress}%`" :aria-valuenow="loadProgress" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>
      </Transition>
      <WaveBig
        :track="track"
        :play="play"
        :mute="mute"
        :playbackRate="playbackRate"
        :pixelPerSecond="pixelPerSecond"
        @trackEnd="trackEnd"
        @trackLoad="trackLoad"
        @waveformReady="waveformReady"
        @trackReady="trackReady"
        ref="player"
        class="wave-big"
      />
    </div>
    <div class="d-flex">
      <div class="track-info">
        <div v-if="track">
          {{track.artist}}<br>
          {{track.title}}
        </div>
      </div>
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
const loadProgress = ref(0)
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
const trackLoad = (percent) => {
  // console.log('percent', percent)
  loadProgress.value = percent
}
const trackReady = () => {
  // console.log('trackReady')
}
const waveformReady = () => {
  // console.log('waveformReady')
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
  .wave-big-wrap {
    height: 150px;
  }
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

/* we will explain what these classes do next! */

.load-track {
  position: absolute;
  margin: 10px auto;
  width: 50%;
}
.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

</style>
