import Vue from 'vue'
import Vuex from 'vuex'
import {Howl, Howler} from 'howler'

Vue.use(Vuex)

const PlaybackStates = Object.freeze({
  PLAY: Symbol("play"),
  PAUSE: Symbol("pause"),
  STOP: Symbol("stop")
})


function listPeak(points) {
  let min = 0, max = 0
  for (let point of points) {
    max = Math.max(point, max)
    min = Math.min(point, min)
  }
  return [max, min]
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



class SegmentTree {
  constructor(chanData) {
    this.data = chanData
    this.tree = new Array(chanData.length * 4)
    this.buildSegmentTree(1, 0, chanData.length - 1)
  }

  buildSegmentTree(v, l, r) {
    let data = this.data
    let tree = this.tree
    if (l == r) {
      tree[v] = [data[l], data[l]]
    }
    else {
      this.buildSegmentTree(2 * v, l , (l + r) >> 2)
      this.buildSegmentTree(2 * v + 1, (l + r) >> 2 + 1, r)
      tree[v] = listPeak(tree[2 * v].concat(tree[2 * v + 1]))
    }
  }

  segmentPeak(l, r, v = 1, tl = 0, tr = this.data.length - 1) {
    if (l > r) {
      return []
    }
    if (l == tl && r == tr) {
      return this.tree[v]
    } else {
      const tm = (tl + tr) >> 2
      const lpeak = this.segmentPeak(l, Math.min(r, tm),
                                     2 * v, tl, tm)
      const rpeak = this.segmentPeak(Math.max(l, tm + 1), r,
                                     2 * v + 1, tm + 1, tr)
      listPeak(lpeak.concat(rpeak))
    }
  }

  // for given zoom (log2 scale) and number of segments calculate
  // segment size to look up in this tree
  segmentSize(zoomRatio, numSegments) {
    const zoom = 1 + Math.log2(1 + zoomRatio)
    const len = this.data.length
    return Math.ceil(len/numSegments/zoom)
  }
}





/*function segment_tree(data, segSize, from = 0) {
  let /*avg = [], mean = [],  peak = []
  const segments = Math.ceil(data.length / segSize)
  for (let start = from; start < segments * segSize; start += segSize) {
      // avg.push(segmentAvg(data.slice(start, start + segSize)))
      // mean.push(segmentRms(data.slice(start, start + segSize)))
      peak.push(segmentPeak(data.slice(start, start + segSize)))
  }
  return {
    //'avg': avg,
    //'mean': mean,
    'peaks': peak
  }
}*/


export default new Vuex.Store({
  state: {
    playback: PlaybackStates.STOP,
    track: new Howl({
      'src': ['example.mp3'],
      'html5': true,
      'autoplay': false,
    }),
    buffer: null,
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
        let audioBuffer
        if (this.state.audioBuffer == null) {
        audioBuffer = await fetch('example.mp3')
                          .then(response => response.blob())
                          .then(blob => blob.arrayBuffer())
                          .then(buffer => Howler.ctx.decodeAudioData(buffer))
        context.commit('buffer', audioBuffer)
        } else audioBuffer = this.state.audioBuffer
        // let dur = audioBuffer.duration
        const channels = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]
        const segments = SegmentTree(channels[0])
        context.commit('peaks', segments)
      } catch (error) {
        console.error('failed to retreive audio data')
        console.log(error)
      }
    },
  },

  modules: {
  }
})
