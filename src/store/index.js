import Vue from 'vue'
import Vuex from 'vuex'
import {Howl, Howler} from 'howler'

Vue.use(Vuex)

const PlaybackStates = Object.freeze({
  PLAY: Symbol("play"),
  PAUSE: Symbol("pause"),
  STOP: Symbol("stop")
})


export default new Vuex.Store({
  state: {
    playback: PlaybackStates.STOP,
    track: new Howl({
      'src': ['holdsworth.mp3'],
      'html5': true,
      'autoplay': false,
    }), 
    time: 0,
  },
  mutations: {
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
          state.time = 0
          break;
        case PlaybackStates.PAUSE:
          state.playback = PlaybackStates.STOP
          state.time = 0
          break;
        case PlaybackStates.STOP:
          break;
      }
    },
  },
  actions: {
    play  (context) {
      console.log(Howler.codecs("mp3"));
      context.state.track.play();
      // console.log(this.state.track.seek())
      console.log("lmao");
      context.commit('play')
    },
    pause (context) {
      this.state.track.pause()
      context.commit('pause')
    },
    stop  (context) {
      this.state.track.stop()
      context.commit('stop')
    },
  },
  modules: {
  }
})
