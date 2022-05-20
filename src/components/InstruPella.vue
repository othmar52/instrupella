<template>
  <a href="#" ref="top" id="top"><!-- used for scroll to top --></a>
  <BlazingBaton v-if="storage.getShowIncomingMidiClock" ref="baton" />
  <div class="instrupella">
    <Deck
      v-for="deck in decks"
      :key="deck.index"
      :deck="deck"
      :midiLearn="midiLearn"
      @updateTrack="persistUpdateTrack"
    />
    <div v-if="tracks">
      <a href="#" ref="tracklist" id="tracklist"><!-- used for scroll to tracklist --></a>
      <TrackList
        :tracks="tracks"
      />
    </div>
    <div v-else>
      loading tracklist...
    </div>
    <span
      class="btn btn-primary btn-scroll-to-top"
      v-show="showScrollToTop"
      @click="storage.setScrollToTop(true)"
    >
      <IconArrow additionalClasses="icon-in-text" />
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useMainStore } from "@/store.js";
import { useMidiStore } from "@/midistore.js";
import Deck from '@/components/Deck/Deck.vue'
import TrackList from '@/components/TrackList/TrackList.vue'
import BlazingBaton from '@/components/BlazingBaton/BlazingBaton.vue'
import IconArrow from '@/components/Icons/Arrow.vue'
const props = defineProps({
  midiLearn: {
    type: Boolean,
    default: false
  }
})
const track = ref(null)
const top = ref(null)
const tracklist = ref(null)
const tracks = ref([])
const baton = ref(null)
const showScrollToTop = ref(false)

const storage = useMainStore()
const midistorage = useMidiStore()
const decks = computed(() => storage.getDecks)

watch(() => storage.scrollToTop, (value) => {
  if (value === false) {
    return
  }
  // TODO: why does smooth scrolling not work?
  // maybe absolute positioning (body & more) of halfmoon framework is the reason
  // top.value.scrollIntoView({
  //   behavior: 'smooth',
  //   block: 'end'
  // })
  top.value.scrollIntoView(false)
  storage.setScrollToTop(false)
})

watch(() => midistorage.getHaveGuiAlerts, () => {
  for (const item of midistorage.getGuiAlerts) {
    showStickyAlert(item)
  }
  midistorage.setGuiAlerts([])
})

watch(() => storage.scrollToTrackList, (value) => {
  if (value === false) {
    return
  }
  // TODO: why does smooth scrolling not work?
  // maybe absolute positioning (body & more) of halfmoon framework is the reason
  tracklist.value.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  storage.setScrollToTrackList(false)
})

const persistUpdateTrack = (properties) => {
  storage.addTrackProp(properties)
}

const loadTrackList = () => {
  // TODO: fetch() is incompatible to file:/// protocol
  fetch(`./${process.env.VUE_APP_MUSIC_ABSPATH.split(/\//).pop()}/instrupella/instrupella-db.json`)
    .then(response => response.json())
    .then(json => {
      tracks.value = json.map((track, idx) => ({ ...track, id: idx }))
      mergeLocalStorageTrackProperties()
      storage.setTracks(tracks.value)
      // check url get params if we have a track to load
      // TODO: handle any amount of decks (d0, d1, d2, ...)
      const loadTrack = new URLSearchParams(window.location.search).get('d0')
      if (loadTrack === null) {
        return
      }
      storage.loadTrackByPath(0, loadTrack)
      // TODO: this is incompatible to file:/// protocol
      window.history.pushState({}, null, '/#')
    })
}

const mergeLocalStorageTrackProperties = () => {
  for (const trackProps of storage.getAllTrackProps) {
    const index = tracks.value.findIndex(item => item.path === trackProps.path)
    if (index === -1) {
      continue
    }
    for (const [key, value] of Object.entries(trackProps)) {
      tracks.value[index][key] = value
    }
  }
}

const showStickyAlert = (options) => {
    window.halfmoon.initStickyAlert(options)
}

const scrollListener = () => {
  showScrollToTop.value = top.value.getBoundingClientRect().top < 0 ? true : false
}

onMounted(() => {
  loadTrackList()
  storage.clearDecks()
  storage.createDeck()
  midistorage.checkInitMidi()
  document.querySelector('.content-wrapper').addEventListener('scroll', scrollListener)
})

onBeforeUnmount(() => {
  document.querySelector('.content-wrapper').removeEventListener('scroll', scrollListener)
})

</script>

<style lang="scss">
.btn-scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
}
</style>
