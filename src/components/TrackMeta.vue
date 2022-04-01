<template>
  <div class="modal  modal-full" id="track-details" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document" v-if="deck.track">
      <div class="modal-content">
        <a href="#" class="btn btn-square btn-rounded btn-default position-absolute right-0 mr-10" role="button" aria-label="ClXose">
          <span aria-hidden="true">&times;</span>
        </a>
        <h5 class="modal-title">Currently playing</h5>
        <table class="table table-strXiped table-bordered">
          <tbody>
          <tr>
            <th>Artist</th>
            <td>{{deck.track.artist}}</td>
            <th>Year</th>
            <td>{{deck.track.year}}</td>
            <th>BPMdetect</th>
            <td>{{deck.track.bpmdetect}}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{{deck.track.title}}</td>
            <th>Length</th>
            <td>{{formatDuration(duration)}}</td>
            <th>BPM</th>
            <td>{{deck.track.bpm}}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>{{formatBytes(deck.track.size)}}</td>
            <th>Key</th>
            <td>{{deck.track.key}}</td>
            <th>Downbeat</th>
            <td>{{deck.track.downbeat ? deck.track.downbeat.toFixed(3) : ''}}</td>
          </tr>
          <tr>
            <th>
              Path
            </th>
            <td colspan="5" class="break-word">
              {{deck.track.path}}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="track-meta p-5 d-flex justify-content-between" @click="toggleFormat">
    <a href="#track-details" v-html="formatArtistTitle(deck.track)"></a>
    <div>
      <span :class="bpmClass">{{formattedTempo}}</span>
      <span class="text-muted"> BPM</span>
    </div>
    <div>
        <div v-if="format">
            {{formatDuration(deck.currentSecond)}}
            <span class="text-primary"> | </span>
            <span class="text-muted">{{formatDuration(duration)}}</span>
        </div>
        <div v-else>
            {{deck.currentSecond.toFixed(2)}}
            <span class="text-primary"> | </span>
            <span class="text-muted">{{duration.toFixed(2)}}</span>
        </div>
    </div>
  </div>
</template>

<script setup>
// TODO: consider to have an optional 'time remaining' as format
import { ref, watch, computed } from 'vue'
import utils from '../mixins/utils.js'
import formatArtistTitleMixin from '../mixins/format/artisttitle'
const { getBpm, isManualBpm } = utils()
const { formatArtistTitle } = formatArtistTitleMixin()

const duration = ref(0)
const format = ref(true)
const props = defineProps({
  deck: {
    type: Object,
    default: null
  }
})

const toggleFormat = () => {
  format.value = !format.value
}

const bpmClass = computed(() => {
  return isManualBpm(props.deck.track) ? 'text-success' : 'text-primary'
})

const formattedTempo = computed(() => {
  if (!props.deck.track) {
    return '0'
  }
  return (getBpm(props.deck.track) * props.deck.playbackRate).toFixed(1)
})

const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// TODO move to util (code duplication in TrackList.vue)
const formatDuration = (duration) => {
  // thanks to https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds#answer-11486026
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600)
  const mins = ~~((duration % 3600) / 60)
  const secs = ~~duration % 60

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = ''

  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '')
  }

  ret += '' + mins + ':' + (secs < 10 ? '0' : '')
  ret += '' + secs
  return ret
}

watch(() => props.deck.track, (newTrack) => {
  if (newTrack) {
    duration.value = props.deck.track.length
  }
})
</script>

<style lang="scss">
#track-details td {
  word-wrap: break-word
}
</style>
