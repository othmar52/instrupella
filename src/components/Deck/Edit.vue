<template>
  <div class="edit-track">
    <div class="row">
      <div class="col-2 justify-content-between d-flex">
        <div class="font-size-18">Tempo {{editTempo.toFixed(1)}}</div>
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
            :permaClasses="`btn btn-square btn-default btn-lg m-5`"
            @click="decreaseTempo"
          />
          <ButtonIcon
            componentName="IconPlus"
            :permaClasses="`btn btn-square btn-default btn-lg m-5`"
            @click="increaseTempo"
          />
      </div>
    </div>
    <div class="row">
      <div class="col-2 justify-content-betweenXXXX d-flexXXXX">
        <span class="font-size-18">Set Downbeat</span>
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
        />
        <Metronome :tempo="editTempo" ref="metronome" />

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
const { getBpm, isManualBpm } = utils()
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
    default: 0.05
  }
})
const editTempo = ref(0)

const metronome = ref(null)
const metronameActive = ref(false)

const toggleMetronome = () => {
  metronameActive.value = !metronameActive.value
}
const doubleTempo = () => {
  editTempo.value *= 2
}

const halfTempo = () => {
  editTempo.value /= 2
}
const increaseTempo = () => {
  editTempo.value += parseFloat(props.step)
}
const decreaseTempo = () => {
  editTempo.value -= parseFloat(props.step)
}

const setTapTempo = (tempo) => {
  editTempo.value = parseFloat(tempo)
}

const setDownbeat = () => {
  emit(
    'updateTrack',
    {
      id: props.track.id,
      downbeat: props.currentSecond
    }
  )
}

const emit = defineEmits([
  'updateTrack',
  'newEditTempo'
])

watch(() => editTempo.value, (newValue) => {
  if (newValue < props.step) {
    newValue = 0
  }
  editTempo.value = parseFloat(newValue)
  emit('newEditTempo', editTempo.value)
})

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
