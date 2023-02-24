<template>
  <div class="modal modal-full ie-scroll-fix track-edit" id="track-edit" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <a href="#" class="close" role="button" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <h5 class="modal-title">
              <strong class="text-muted">track-edit</strong>
              <span v-if="editTrack" v-html="formatArtistTitle(editTrack)"></span></h5>
            <table class="table table-bordered" v-if="editTrack">
              <tbody>
              <tr>
                <th>
                  Path
                </th>
                <td colspan="2" class="break-word">
                  {{editTrack.path}}, {{formatBytes(editTrack.size)}}, {{formatDuration(editTrack.duration)}}
                </td>
              </tr>
              <tr
                v-for="key of Object.keys(workProps)"
                :key="key"
                :id="`track-row-${key}`"
              >
                <th>{{key}}</th>
                <td>{{editTrack[key]}}</td>
                <td v-if="['artist', 'title', 'year', 'key', 'bpm', 'bpmdetect', 'beat', 'downbeat'].includes(key)">
                    <input type="text" v-model="workProps[key]" :class="`form-control ${isModifiedClass(key)}`" />
                </td>
                <td v-if="['tempoDrift', 'downbeatDrift'].includes(key)">
                    <span class="custom-switch">
                      <input type="checkbox" v-model="workProps[key]" :id="`track-edit-${key}`">
                      <label :for="`track-edit-${key}`" :class="`${isModifiedClass(key)}`">{{key}}</label>
                    </span>
                </td>
                <td v-if="['like'].includes(key)">
                    <ButtonIcon
                      componentName="IconThumbUp"
                      :permaClasses="`btn btn-square btn-default m-5`"
                      :activeClass="(workProps.like === 1 ) ? 'btn-success' : ''"
                      @click="toggleThumbUp"
                    />
                    <ButtonIcon
                      componentName="IconThumbDown"
                      :permaClasses="`btn btn-square btn-default m-5`"
                      :activeClass="(workProps.like === -1 ) ? 'btn-danger' : ''"
                      @click="toggleThumbDown"
                    />
                    <label :class="`${isModifiedClass(key)}`">{{key}}</label>
                </td>
              </tr>
              </tbody>
            </table>
            <div class="text-center mt-20">
                <a href="#" class="btn btn-default" role="button">Close</a>
                <a href="#" @click="saveChanges" class="btn btn-default" role="button">Save changes</a>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMainStore } from '@/store.js'
import formatArtistTitleMixin from '../mixins/format/artisttitle'
import ButtonIcon from '@/components/ButtonIcon.vue'

const { formatArtistTitle } = formatArtistTitleMixin()

const workProps = ref({
  artist: '',
  title: '',
  year: '',
  key: '',
  bpmdetect: .0,
  bpm: .0,
  downbeat: .0,
  beat: '',
  tempoDrift: false,
  downbeatDrift: false,
  like: 0
})

const storage = useMainStore()

const editTrack = computed(() => storage.getEditTrack)
const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const toggleThumbUp = () => {
  workProps.value.like = (workProps.value.like < 1) ? 1 : 0
}

const toggleThumbDown = () => {
  workProps.value.like = (workProps.value.like > -1) ? -1 : 0
}

const saveChanges = () => {
  let hasCanges = false
  const trackProps = { path: editTrack.value.path }
  for (const propName of Object.keys(workProps.value)) {
    if (isModifiedClass(propName) === '') {
      continue
    }
    hasCanges = true
    trackProps[propName] = workProps.value[propName]
  }

  if (hasCanges === false) {
    return
  }
  storage.addTrackProp(trackProps)
}

const isModifiedClass = (propName) => {
  return (workProps.value[propName] == editTrack.value[propName])
    ? ''
    : (['tempoDrift', 'downbeatDrift', 'like'].includes(propName))
      ? 'text-danger'
      : 'is-invalid'
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
watch(() => storage.getEditTrack, (newTrack) => {

  workProps.value = {
    artist: newTrack.artist,
    title: newTrack.title,
    year: newTrack.year,
    key: newTrack.key,
    bpmdetect: newTrack.bpmdetect,
    bpm: newTrack.bpm,
    downbeat: newTrack.downbeat,
    beat: newTrack.beat,
    tempoDrift: newTrack.tempoDrift,
    downbeatDrift: newTrack.downbeatDrift,
    like: newTrack.like
  }

})

</script>

<style lang="scss">

</style>
