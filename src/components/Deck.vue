<template>
  <div :class="`card deck deck-${index}`">
    <!--playbackRate: {{ playbackRate }} -->
    <WaveBig
      :track="track"
      :play="play"
      :mute="mute"
      ref="player"
      :playbackRate="playbackRate"
      class="wave-big"
    />
    <br>

    <div class="d-flex">
      <Button
        label="|&lt;"
        :permaClasses="`${buttonClasses}`"
        @click="$refs.player.seekZero()"
      />
      <div id="deck-minimap" class="deck-minimap m-10"> </div>
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
    <br>
    <PitchControl
      @pitchChange="setPitch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WaveBig from '@/components/WaveBig.vue'
import Button from '@/components/Button.vue'
import PitchControl from '@/components/PitchControl.vue'
const play = ref(false)
const mute = ref(false)
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
