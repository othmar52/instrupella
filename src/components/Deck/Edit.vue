<template>
  <div class="edit-track">
    <div class="row">
      <div class="col-2 justify-content-between d-flex">
        <div class="font-size-18">Tempo {{workingTempo.toFixed(3)}}</div>
      </div>
      <div class="col-10">
          <ButtonIcon
            componentName="IconMetronome"
            :permaClasses="`btn btn-square btn-default btn-lg m-5`"
            :activeClass="(metronameActive) ? 'btn-primary' : ''"
            @click="toggleMetronome"
          />
          <Button
            label="&#x00D7;2"
            :permaClasses="`btn btn-square btn-default btn-lg m-5`"
            @click="doubleTempo"
          />
          <Button
            label="&#247;2"
            :permaClasses="`btn btn-square btn-default btn-lg m-5`"
            @click="halfTempo"
          />
          <Button
            :label="getBpm(track).toFixed(1)"
            :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
            @click="setTapTempo(getBpm(track))"
          />
          <TapBpm
            @tapTempo="setTapTempo"
          />
          <ButtonIcon
            componentName="IconMinus"
            :permaClasses="`btn btn-square btn-rect btn-default btn-lg m-5`"
            @click="decreaseTempo"
          />
          <ButtonIcon
            componentName="IconPlus"
            :permaClasses="`btn btn-square btn-rect btn-default btn-lg m-5`"
            @click="increaseTempo"
          />
          <Button
            label="APPLY"
            :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
            @click="persistTempo"
          />
      </div>
    </div>
    <div class="row">
      <div class="col-2 justify-content-betweenXXXX d-flexXXXX">
        <span class="font-size-18">Set Downbeat {{workingDownbeat.toFixed(2)}}</span>
      </div>
      <div class="col-10">
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars" @click="setDownbeat">
            <strong class="bars">1</strong><br><span class="text-muted font-size-12 label-bars">bar</span>
        </button>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
            <strong class="bars">4</strong><br><span class="text-muted font-size-12 label-bars">bars</span>
        </button>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars">
            <strong class="bars">8</strong><br><span class="text-muted font-size-12 label-bars">bars</span>
        </button>

        <Button
        label="RESET"
        :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
        />
        <Button
        label="APPLY"
        :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
        @click="persistDownbeat"
        />
        <span class="ml-20"></span>
        <Button
        label="+1"
        :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12 ml-30`"
        @click="persistLike"
        />
        <Button
        label="-1"
        :permaClasses="`btn btn-square btn-default btn-lg m-5 font-size-12`"
        @click="persistUnlike"
        />
        <button class="btn btn-default btn-square btn-lg m-5 ml-20 btn-bars" @click="persistToggleTempoDrift">
            <strong class="bars">DRIFT</strong><br><span class="text-muted font-size-12 label-bars">tempo</span>
        </button>
        <button class="btn btn-default btn-square btn-lg m-5 btn-bars" @click="persistToggleDownbeatDrift">
            <strong class="bars">DRIFT</strong><br><span class="text-muted font-size-12 label-bars">dBeat</span>
        </button>
        <Metronome :tempo="workingTempo" ref="metronome" />

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Button from '@/components/Button.vue'
import Metronome from '@/components/Metronome.vue'
import TapBpm from '@/components/Deck/TapBpm.vue'
import utils from '../../mixins/utils'
import { useMainStore } from "@/store.js";
const { getBpm, isManualBpm } = utils()
const storage = useMainStore()
const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  play: {
    type: Boolean,
    default: false
  },
  playbackRate: {
    type: Number,
    default: 0
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  step: {
    type: Number,
    default: 0.01
  }
})
const workingTempo = computed(() => storage.getWorkingTempo)
const workingDownbeat = computed(() => storage.getWorkingDownbeat)

const metronome = ref(null)
const metronameActive = ref(false)

const toggleMetronome = () => {
  metronameActive.value = !metronameActive.value
}
const doubleTempo = () => {
  storage.setWorkingTempo(workingTempo.value * 2)
}

const halfTempo = () => {
  storage.setWorkingTempo(workingTempo.value / 2)
}
const increaseTempo = (event) => {
  storage.setWorkingTempo(workingTempo.value + getStepFactor(event))
}
const decreaseTempo = (event) => {
  storage.setWorkingTempo(workingTempo.value - getStepFactor(event))
}

// very left 15% -> minimum (= props.step bpm) 
// very right 15% -> maxIncrease (= 0.5 bpm)
// everything in between will be calculated
const getStepFactor = (event) => {
  const boundryPercent = 15
  const maxIncrease = 0.5
  const x = event.clientX - event.target.getBoundingClientRect().left; //x position within the element.
  const percentX = x / (event.target.getBoundingClientRect().width/100)
  if (percentX < boundryPercent) {
    return parseFloat(props.step)
  }
  if (percentX > 100 - boundryPercent) {
    return maxIncrease
  }
  const inBetweenPercent = (percentX - boundryPercent) * 1/(100-2*boundryPercent)*100
  const valueToIncrease = props.step + inBetweenPercent * (maxIncrease-props.step)/100
  return valueToIncrease
}

const setTapTempo = (tempo) => {
  storage.setWorkingTempo(parseFloat(tempo))
}

const setDownbeat = () => {
  storage.setWorkingDownbeat(parseFloat(props.currentSecond))
}

const persistDownbeat = () => {
  props.track.downbeat = workingDownbeat.value
  persistTrackProperty('downbeat')
}

const persistTempo = () => {
  props.track.bpm = workingTempo.value
  persistTrackProperty('bpm')
}

const persistTrackProperty = (propName) => {
  const trackProps = { path: props.track.path }
  trackProps[propName] = props.track[propName]
  emit('updateTrack', trackProps)
}

const persistToggleDownbeatDrift = () => {
  props.track.downbeatDrift = !props.track.downbeatDrift
  persistTrackProperty('downbeatDrift')
}

const persistToggleTempoDrift = () => {
  props.track.tempoDrift = !props.track.tempoDrift
  persistTrackProperty('tempoDrift')
}
const persistLike = () => {
  props.track.like = 1
  persistTrackProperty('like')
}

const persistUnlike = () => {
  props.track.like = -1
  persistTrackProperty('like')
}

const emit = defineEmits([
  'updateTrack'
])


watch(() => props.play, (newPlayState) => {
  if (metronameActive.value === false) {
    return
  }
  metronome.value.play(newPlayState)
})

watch(() => metronameActive.value, (newMetronomeState) => {
  if (metronameActive.value === false) {
    // ensure metronome is not playing
    metronome.value.play(false)
    return
  }
  if (props.play && metronome.value.isPlaying === false) {
    metronome.value.play(true)
  }
})

</script>

<style lang="scss">
.edit-track {
  .btn-bars {
    position: relative;
    .bars {
        position: absolute;
        top: -0.6rem;
        left: 0;
        width: 5rem;
        text-align: center;
    }
    .label-bars {
        position: absolute;
        top: 1.2rem;
        left: 0;
        width: 5rem;
        text-align: center;
    }
  }
}
</style>
