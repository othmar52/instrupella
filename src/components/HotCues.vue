<template>
  <div class="hotcues" v-if="cueItems.length">
    <HotCue
      :track="track"
      v-for="idx in range(0,amount)"
      :key="idx"
      :index="idx"
      :second="getSecondForIndex(idx)"
      :deleteMode="deleteMode"
      @pressHotCueStart="pressHotCueStart"
      @pressHotCueEnd="pressHotCueEnd"
      @deleteHotCue="deleteHotCue"
    />
    <ButtonIcon
      v-if="haveAnyCues && !deleteMode"
      componentName="IconTrash"
      permaClasses="btn btn-square btn-default btn-lg m-10"
      @click="toggleDelete"
    />
    <Button
      v-if="haveAnyCues && deleteMode"
      label="DONE"
      permaClasses="btn btn-square btn-default btn-lg m-10 font-size-12"
      activeClass="btn-danger alt-dm"
      @click="toggleDelete"
    />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import rangeMixin from '../mixins/utils/range'
import HotCue from '@/components/HotCue.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Button from '@/components/Button.vue'

const { range } = rangeMixin()
const cueItems = ref([])
const playStateOnCueStart = ref(false)
const ignoreNextEndEvent = ref(false)
const deleteMode = ref(false)

const props = defineProps({
  track: {
    type: Object,
    default: null
  },
  amount: {
    type: Number,
    default: 5
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  play: {
    type: Boolean,
    default: false
  }
})

const getSecondForIndex = (idx) => {
  return cueItems.value[idx].second
}

const toggleDelete = () => {
  deleteMode.value = !deleteMode.value
}

const deleteHotCue = (idx) => {
  cueItems.value[idx].second = 0
  emit('hotCuesChange', cueItems.value)
  // leave deleteMode in case there are no cues left
  if (haveAnyCues.value === false) {
    deleteMode.value = false
  }
}
const pressHotCueStart = (idx) => {
  if (!props.track) {
    return
  }
  // console.log('pressHotCueStart', idx, 'props.play', props.play)
  if (cueItems.value[idx].second === 0) {
    // set new cue point
    cueItems.value[idx].second = props.currentSecond
    emit('hotCuesChange', cueItems.value)
    ignoreNextEndEvent.value = true
    return
  }
  playStateOnCueStart.value = props.play
  emit('seekToAndPlay', cueItems.value[idx].second)
}

const pressHotCueEnd = (idx) => {
  if (ignoreNextEndEvent.value === true) {
    ignoreNextEndEvent.value = false
    // console.log('ignoring end event...')
    return
  }
  if (!props.track) {
    return
  }
  // console.log('pressHotCueEnd', idx, 'props.play', props.play, 'playStateOnCueStart', playStateOnCueStart.value)
  if (playStateOnCueStart.value === false) {
    emit('seekToAndStop', cueItems.value[idx].second)
  }
}

const haveAnyCues = computed(() => {
  return cueItems.value.filter(item => item.second > 0).length > 0
})

const emit = defineEmits([
  'seekToAndPlay',
  'seekToAndStop',
  'hotCuesChange'
])

const createEmptyHotCues = () => {
  cueItems.value = []
  for (const idx in range(0, props.amount)) {
    cueItems.value.push({ second: 0 })
  }

}

onMounted(() => {
  // TODO: read persisted cue items
  createEmptyHotCues()
})

watch(() => props.track, () => {
  // TODO read persisted hot cues as soon as persistence is implemented
  createEmptyHotCues()
  emit('hotCuesChange', cueItems.value)
})
</script>

<style lang="scss">

</style>
