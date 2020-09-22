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


function arrayReducer(arr, reducer) {
  return arr.reduce(reducer)
}

function segmentAvg(points) {
  //return arrayReducer(points, (acc, v) => acc + Math.abs(v)) / points.length * 2
  return arrayReducer(points, (acc, v) => acc + v) / points.length
}
/*
function segmentRms(points) {
  const squareSum = arrayReducer(points, (acc, v) => acc + Math.pow(v, 2))
  return Math.sqrt(squareSum / points.length)
}
*/



class SegmentTree {
  constructor(chanData) {
    this.data = chanData
    this.tree = new Array(chanData.length * 2 - 1)
    //this.buildSegmentTree(1, 0, chanData.length - 1)
    this.buildTree()
  }

  buildSegmentTree(v, l, r) {
    let data = this.data
    let tree = this.tree
    if (l == r) {
      tree[v] = [data[l], data[l]]
    }
    else {
      this.buildSegmentTree(2 * v, l , (l + r) >> 1)
      this.buildSegmentTree(2 * v + 1, ((l + r) >> 1) + 1, r)
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
      const tm = (tl + tr) >> 1
      const lpeak = this.segmentPeak(l, Math.min(r, tm),
                                     2 * v, tl, tm)
      const rpeak = this.segmentPeak(Math.max(l, tm + 1), r,
                                     2 * v + 1, tm + 1, tr)
      return listPeak(lpeak.concat(rpeak))
    }
  }

  buildTree() {
    let data = this.data
    let tree = this.tree
    const n = data.length
    for (let i = 0; i < n; i++) {
      tree[n - 1 + i] = [data[i], data[i]]
    }
    for (let i = n - 2; i >= 0; i--) {
      tree[i] = listPeak(tree[2 * i + 1].concat(tree[2 * i + 2]))
    }
  }

  segmentPeakBottom(l, r) {
    l += this.data.length - 1
    r += this.data.length - 1
    let left = [], right = []
    while (l < r) {
      if (l % 2 == 0) {
        left = listPeak(left.concat(this.tree[l]))
      }
      l >>= 1
      if (r % 2) {
        right = listPeak(this.tree[r].concat(right))
      }
      r >>= 1; r -= 1
    }
    if (l == r) {
        left = listPeak(this.tree[l].concat(left))
    }
    return listPeak(left.concat(right))
  
  }

  // for given zoom (log2 scale) and number of segments calculate
  // segment size to look up in this tree
  segmentSize(zoomRatio, numSegments) {
    const zoom = 1 + Math.log2(1 + zoomRatio)
    const len = this.data.length
    return Math.floor(len/numSegments/zoom)
  }
}


function segmentList(data, segSize, from = 0) {
  let avg = [] //, mean = [],  let peak = []
  const segments = Math.ceil(data.length / segSize)
  for (let start = from; start < segments * segSize; start += segSize) {
      avg.push(segmentAvg(data.slice(start, start + segSize)))
      // mean.push(segmentRms(data.slice(start, start + segSize)))
      // peak.push(listPeak(data.slice(start, start + segSize)))
  }
  return {
    'avg': avg,
    //'mean': mean,
    // 'peaks': peak
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
    buffer: null,
    segments: null,
    loop: [false, 0, 0],
    peaks: [],
  },

  computed: {
    duration: state => { return state.track.duration() },
    seek: state => { return state.track.seek()  + state.loop[0] ? state.loop[1] : 0}
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
    
  },
  actions: {

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
  },

  modules: {
  }
})
