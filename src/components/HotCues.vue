<template>
  <div class="hotcues" v-if="deck">
    <HotCue
      v-for="(item, idx) in hotCues.cues"
      :key="idx"
      :index="idx"
      :hotCues="hotCues"
      :midiLearn="midiLearn"
      @pressHotCueStart="pressHotCueStart"
      @pressHotCueEnd="pressHotCueEnd"
    />
    <ButtonIcon
      v-if="(hotCues.haveAnyCues && !hotCues.deleteMode) || midiLearn"
      componentName="IconTrash"
      permaClasses="btn btn-square btn-default btn-lg m-10"
      :activeClass="midiLearn ? 'btn-danger alt-dm' : ''"
      @click="storage.fireControlElement(`d.${deck.index}.toggleHotCueDeleteMode`)"
    />
    <Button
      v-if="hotCues.haveAnyCues && hotCues.deleteMode"
      label="DONE"
      permaClasses="btn btn-square btn-default btn-lg m-10 font-size-12"
      activeClass="btn-danger alt-dm"
      @click="storage.fireControlElement(`d.${deck.index}.toggleHotCueDeleteMode`)"
    />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import rangeMixin from '../mixins/utils/range'
import HotCue from '@/components/HotCue.vue'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Button from '@/components/Button.vue'
import { useMainStore } from "@/store.js";

const { range } = rangeMixin()
const cueItems = ref([])
const deleteMode = ref(false)
const storage = useMainStore()

const hotCues = computed(() => props.deck.hotCues)
const props = defineProps({
  deck: {
    type: Object,
    default: null
  },
  midiLearn: {
    type: Boolean,
    default: false
  }
})

const getSecondForIndex = (idx) => {
  return hotCues.cues[idx].second
}

const pressHotCueStart = (idx) => {
  storage.fireControlElement(`d.${props.deck.index}.hotCueDown`, idx)
}

const pressHotCueEnd = (idx) => {
  storage.fireControlElement(`d.${props.deck.index}.hotCueUp`, idx)
}

const haveAnyCues = computed(() => {
  return cueItems.value.filter(item => item.second > 0).length > 0
})

</script>

<style lang="scss">

</style>
