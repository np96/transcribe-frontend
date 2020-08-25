import Vue from 'vue'
import Vuex from 'vuex'
import {Howl, Howler} from 'howler'

Vue.use(Vuex)

const PlaybackStates = Object.freeze({
  PLAY: Symbol("play"),
  PAUSE: Symbol("pause"),
  STOP: Symbol("stop")
})





function segmentPeak(points) {
  return [Math.max(...points), Math.min(...points)]
}

/*
function arrayReducer(arr, reducer) {
  return arr.reduce(reducer)
}

function segmentAvg(points) {
  return arrayReducer(points, (acc, v) => acc + Math.abs(v)) / points.length * 2
}

function segmentRms(points) {
  const squareSum = arrayReducer(points, (acc, v) => acc + Math.pow(v, 2))
  return Math.sqrt(squareSum / points.length)
}
*/

function waveformData(data, segSize) {
  let /*avg = [], mean = [], */ peak = []
  const segments = Math.ceil(data.length / segSize)
  for (let start = 0; start < segments * segSize; start += segSize) {
      //avg.push(segmentAvg(data.slice(start, start + segSize)))
      // mean.push(segmentRms(data.slice(start, start + segSize)))
      peak.push(segmentPeak(data.slice(start, start + segSize)))
  }
  return {
    //'avg': avg,
    //'mean': mean,
    'peaks': peak
  }
}


export default new Vuex.Store({
  state: {
    playback: PlaybackStates.STOP,
    track: new Howl({
      'src': ['example.mp3'],
      'html5': true,
      'autoplay': false,
    }), 
    peaks: [],
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
    peaks (state, data) {
      state.peaks = data
    }
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

    async getWaveform (context) {
      try {
        const audioBuffer = await fetch('example.mp3')
                          .then(response => response.blob())
                          .then(blob => blob.arrayBuffer())
                          .then(buffer => Howler.ctx.decodeAudioData(buffer))
        const channels = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]
        const data = waveformData(channels[0], Math.ceil(channels[0].length / 500))
        context.commit('peaks', data['peaks'])
      } catch (error) {
        console.error('failed to retreive audio data')
        console.log(error)
      }
    },
  },

  modules: {
  }
})
