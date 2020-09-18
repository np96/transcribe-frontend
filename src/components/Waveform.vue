<template>
  <div style="width:100%;">
      <canvas @mousedown="startSelect" @mouseup="endSelect" @mousemove="selectMove"
        id = "c" ref="can"/>
    <v-btn icon large fab color="indigo" @click="onZoomIn">
      <v-icon>mdi-magnify-plus</v-icon>
    </v-btn>
    <v-btn icon large fab color="indigo" @click="onZoomOut">
      <v-icon>mdi-magnify-minus</v-icon>
    </v-btn>
    <div style="width:100%; overflow:scroll" id="scrolltar">
      <canvas id="scroller" style="resize:both"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  render: h => h('div'),
  props: {
    width: {
      type: Number,
      default: 1440,
    },
    height: {
      type: Number,
      default: 320,
    },
    divWidth: {
      type: Number,
      default: 1440,
    }
  },
  data () {
    return {
      offsetLeft: 0,
      zoom: 0,
      ctx: null,
      ready: false,
      canv: null,
      loopStart: null,
      loopEnd: null,
      dragging: false,
      peaksCanv: new Array(this.divWidth)
    }
  },

  async created () {
    await this.$store.dispatch('getWaveform')
    await this.updatePeaks()
    this.ready = true
  },

  mounted () {
    const canv = document.getElementById("c")
    document.getElementById("scrolltar").addEventListener("scroll", this.onScroll)
    canv.setAttribute('width', this.width)
    canv.setAttribute('height', this.height)
    
    this.canv = canv
    this.ctx = canv.getContext("2d")
    this.drawPeaks()
  },

  methods: {

    onScroll(e) {
      this.offsetLeft = e.target.scrollLeft
      this.updatePeaks()
    },

    onZoomIn() {
      this.zoom = Math.min(this.zoom + 0.1, 10)
      this.updatePeaks()
    },

    onZoomOut() {
      this.zoom = Math.max(this.zoom - 0.1, 0)
      this.updatePeaks()
    },

    startSelect() {
      this.loopStart = null
      this.loopEnd = null
      this.dragging = true
    },

    endSelect() {
      if (this.loopEnd == null) { return }
      this.dragging = false
      const start = this.getTime(this.loopStart, this.$store.getters.duration)
      const end = this.getTime(this.loopEnd, this.$store.getters.duration)
      this.$store.dispatch('startLoop', [start, end])
    },

    selectMove(e) {
      console.log(e.clientX)
      if (!this.dragging)
        return;
      if (this.loopStart == null) {
        this.loopStart = e.clientX
      }
      else {
        this.loopStart = Math.min(e.clientX, this.loopStart)
        this.loopEnd = Math.max(e.clientX, this.loopStart)
      }
    },

    updatePeaks () {
      const offset = this.offsetLeft
      const tree = this.$store.state.segments
      const segmentSize = tree.segmentSize(this.zoom, this.divWidth)
      const h = this.height >> 1
      for (let i = offset; i < offset + this.divWidth; i++) {
        const p = tree.segmentPeakBottom(i * segmentSize, (i + 1) * segmentSize)
        this.peaksCanv[i - offset] = [h - h * p[0], h - h * p[1]]
      }
    },

    getTime(x, duration) {
      // t = (x + ol) * dur / w / (z + 1)
      return (x + this.offsetLeft) * duration / this.width / (this.zoom + 1)
    },

    getX(time, duration) {
      // x = w * t * (z + 1) / dur - ol
      return Math.floor(this.width * time * (this.zoom + 1) / duration - this.offsetLeft)
    },

    drawSlider() {
      const time = this.$store.getters.seek
      const x = this.getX(time, this.$store.getters.duration)
      if (x >= 0) {
        this.ctx.beginPath()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle='black'
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.height)
        this.ctx.stroke()
      }
    },

    drawPeaks () {
      const scroller = document.getElementById("scroller")
      scroller.setAttribute('width', this.width * (this.zoom + 1))
      scroller.setAttribute('height', 100)
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.lineWidth = 0.5
      this.ctx.strokeStyle = 'green'
      this.ctx.beginPath()
      let x = 0
      this.peaksCanv.forEach(p => {
        this.ctx.moveTo(x, p[0])
        this.ctx.lineTo(x, p[1])
        x++
      })
      this.ctx.stroke()
      this.drawSlider()
      requestAnimationFrame(this.drawPeaks.bind(this))
    },
  }
}
</script>