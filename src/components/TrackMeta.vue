<template>
  <div class="modal  modal-full" id="track-details" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document" v-if="track">
      <div class="modal-content">
        <a href="#" class="btn btn-square btn-rounded btn-default position-absolute right-0 mr-10" role="button" aria-label="ClXose">
          <span aria-hidden="true">&times;</span>
        </a>
        <h5 class="modal-title">Currently playing</h5>
        <table class="table table-strXiped table-bordered">
          <tbody>
          <tr>
            <th>Artist</th>
            <td>{{track.artist}}</td>
            <th>Year</th>
            <td>{{track.year}}</td>
            <th>BPMdetect</th>
            <td>{{track.bpmdetect}}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{{track.title}}</td>
            <th>Length</th>
            <td>{{formatDuration(duration)}}</td>
            <th>BPM</th>
            <td>{{track.bpm}}</td>
          </tr>
          <tr>
            <th>Size</th>
            <td>TODO: MB</td>
            <th>Key</th>
            <td>{{track.key}}</td>
            <th>Downbeat</th>
            <td>{{track.downbeat}}</td>
          </tr>
          <tr>
            <th>
              Path
            </th>
            <td colspan="5">
              {{track.path}}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="track-meta p-5 d-flex justify-content-between" @click="toggleFormat">
    <a href="#track-details" v-html="formatArtistTitle(track)"></a>
    <div>
      <span :class="bpmClass">{{formattedTempo}}</span>
      <span class="text-muted"> BPM</span>
    </div>
    <div>
        <div v-if="format">
            {{formatDuration(currentSecond)}}
            <span class="text-primary"> | </span>
            <span class="text-muted">{{formatDuration(duration)}}</span>
        </div>
        <div v-else>
            {{currentSecond.toFixed(2)}}
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
  track: {
    type: Object,
    default: null
  },
  currentSecond: {
    type: Number,
    default: 0
  },
  playbackRate: {
    type: Number,
    default: 1
  }
})

const toggleFormat = () => {
  format.value = !format.value
}

const bpmClass = computed(() => {
  return isManualBpm(props.track) ? 'text-success' : 'text-primary'
})

const formattedTempo = computed(() => {
  if (!props.track) {
    return '0'
  }
  return (getBpm(props.track) * props.playbackRate).toFixed(1)
})

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

watch(() => props.track, () => {
  duration.value = props.track.length
})
</script>

<style lang="scss">
#track-details td {
  word-wrap: break-word
}
</style>
