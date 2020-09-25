import Vue from 'vue'
import Vuex from 'vuex'
import {Howl, Howler} from 'howler'
import {SegmentTree, segmentList} from './segment_tree'

Vue.use(Vuex)

const PlaybackStates = Object.freeze({
  PLAY: Symbol("play"),
  PAUSE: Symbol("pause"),
  STOP: Symbol("stop")
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
}

const actions = {
  startLoop (context, pos) {
    console.log(pos[0] + ' ' + pos[1])
    context.state.track.stop()
    context.dispatch('stop')
    context.state.track._sprite.l =  [ pos[0]*1000, (pos[1]-pos[0])*1000, true]
    context.commit('loop', [true, pos[0], pos[1]])
    context.dispatch('play')
  },
  
  endLoop (context) {
    context.commit('loop', [false, null, null])
  },

  play (context) {
    console.log(Howler.codecs("mp3"))
    if (context.state.loop[0]) {
      context.state.track.play('l')
    } else {
      context.state.track.play()
    }
    // console.log(this.state.track.seek())
    context.commit('play')
  },

  pause (context) {
    this.state.track.pause()
    context.commit('pause')
  },

  stop (context) {
    this.state.track.stop()
    context.commit('stop')
  },

  async getWaveform (context) {
    try {
      let audioBuffer
      if (this.state.audioBuffer == null) {
      audioBuffer = await fetch('example.mp3')
                        .then(response => response.blob())
                        .then(blob => blob.arrayBuffer())
                        .then(buffer => Howler.ctx.decodeAudioData(buffer))
      context.commit('buffer', audioBuffer)
      } else audioBuffer = this.state.audioBuffer
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
    track: new Howl({
      'src': ['example.mp3'],
      'html5': true,
      'autoplay': false,
    }),
    buffer: null,
    segments: null,
    loop: [false, 0, 0],
    peaks: [],
  }

  const computed = {
    duration: state => { return state.track.duration() },
    seek: state => { return state.track.seek()  + state.loop[0] ? state.loop[1] : 0}
  }
  
  return {
    state,
    computed,
    actions,
    mutations,
  }
}