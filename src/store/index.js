import Vue from 'vue'
import Vuex from 'vuex'
import {Howl, Howler} from 'howler'
import {SegmentTree, segmentList} from './segment_tree'

Vue.use(Vuex)

export const PlaybackStates = Object.freeze({
  PLAY: "play",
  PAUSE: "pause",
  STOP: "stop"
})

const mutations = {
  play (state) {
    switch (state.playback) {
      case PlaybackStates.PLAY:
        return;
      case PlaybackStates.PAUSE:
        state.playback = PlaybackStates.PLAY
        break;
      case PlaybackStates.STOP:
        state.playback = PlaybackStates.PLAY
        break;
      
    }
  },
  pause (state) {
    switch (state.playback) {
      case PlaybackStates.PLAY:
        state.playback = PlaybackStates.PAUSE
        break;
      case PlaybackStates.PAUSE:
        break;
      case PlaybackStates.STOP:
        break;
    }
  },
  stop (state) {
    switch (state.playback) {
      case PlaybackStates.PLAY:
        state.playback = PlaybackStates.STOP
        break;
      case PlaybackStates.PAUSE:
        state.playback = PlaybackStates.STOP
        break;
      case PlaybackStates.STOP:
        break;
    }
  },
  peaks (state, data) {
    state.peaks = data
  },
  segments (state, segments) {
    state.segments = segments
  },
  buffer (state, buf) {
    state.buffer = buf
  },
  loop (state, loop) {
    state.loop = loop
  },
  howl (state, src) {
    state.tracks.push(src)
  }
}

const actions = {
  startLoop (context, pos) {
    console.log(pos[0] + ' ' + pos[1])
    context.getters.track.stop()
    context.dispatch('stop')
    context.getters.track._sprite.l = [pos[0]*1000, (pos[1]-pos[0])*1000, true]
    context.commit('loop', [true, pos[0], pos[1]])
    context.dispatch('play')
  },
  
  endLoop (context) {
    context.commit('loop', [false, null, null])
  },

  play (context) {
    if (context.state.loop[0]) {
      context.getters.track.play('l')
    } else {
      context.getters.track.pause()
      context.getters.track.play()
    }
    // console.log(this.state.track.seek())
    context.commit('play')
  },

  pause (context) {
    context.getters.track.pause()
    context.commit('pause')
  },

  stop (context) {
    context.getters.track.stop()
    context.commit('stop')
  },

  async upload (context, data) {
    const audioBuffer = await data.file.arrayBuffer()
        .then(buffer => Howler.ctx.decodeAudioData(buffer))
    const channels = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]
    const segmentTree = new SegmentTree(
                            segmentList(channels[0], 100)['avg']
                          )
    context.dispatch('stop')
    context.dispatch('newTrack', data.howl)
    context.dispatch('endLoop')
    context.commit('buffer', audioBuffer)
    context.commit('segments', segmentTree)
  },

  newTrack (context, h) {
    context.commit('howl', h)
  },

  async getWaveform (context) {
    try {
      let audioBuffer
      if (context.state.buffer == null) {
        const h = new Howl({
          'src': ['example.mp3'],
          'html5': true,
          'autoplay': false,
        })

        context.dispatch('newTrack', h)
        audioBuffer = await fetch('example.mp3')
                          .then(response => response.blob())
                          .then(blob => blob.arrayBuffer())
                          .then(buffer => Howler.ctx.decodeAudioData(buffer))
        context.commit('buffer', audioBuffer)
      } else audioBuffer = context.state.buffer
      const channels = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]
      const segmentTree = new SegmentTree(
                            segmentList(channels[0], 100)['avg']
                          )
      context.commit('segments', segmentTree)
    } catch (error) {
      console.error('failed to retreive audio data')
      console.log(error)
    }
  },
}

export default function createStoreConfig() {
  const state = {
    playback: PlaybackStates.STOP,
    tracks: [],
    buffer: null,
    segments: null,
    loop: [false, 0, 0],
    peaks: [],
  }

  const computed = {
    
  }

  const getters = {
    duration: state => { return state.tracks[state.tracks.length - 1].duration() },
    seek: state => { return state.tracks[state.tracks.length - 1].seek() },
    track: state => { return state.tracks[state.tracks.length - 1] }
  }

  return {
    state,
    computed,
    getters,
    actions,
    mutations,
  }
}