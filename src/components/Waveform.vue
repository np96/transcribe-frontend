<template>
  <div style="max-height: 80px; width:100%">
    <v-row 
     :align="align"
        no-gutters>
      <canvas id = "c"></canvas>
    </v-row>
    <v-container style="max-height: 80px;max-width:500px"
                 class="overflow-x-auto">
      <v-row
        v-scroll:#scroll-target="onScroll"
        align="align"
        style="width:2000px">
      </v-row>
  </div>
</template>

<script>
export default {
//  render: h => h('div'),
  props: {
    width: {
      type: Number,
      default: 500,
    },
    height: {
      type: Number,
      default: 80,
    },
    divWidth: {
      type: Number,
      default: 500,
    }
  },
  data () {
    return {
      offsetLeft: 0,
      zoom: 2,
      ctx: null,
      canv: null,
      peaksCanv: new Array(this.divWidth)
    }
  },
  computed: {
    peaksCanvas: this.peaksCanv
  },
  mounted () {
    const canv = document.getElementById("c")
    canv.setAttribute('width', this.width)
    canv.setAttribute('height', this.height)
    this.canv = canv
    this.ctx = canv.getContext("2d")
    this.updatePeaks()
    this.$store.dispatch('getWaveform').then(this.drawPeaks())
  },

  methods: {

    onScroll(e) {
      this.offsetLeft = e.target.scrollLeft
    },

    updatePeaks () {
      const offset = this.offsetLeft
      const tree = this.$store.state.peaks
      const segmentSize = tree.segmentSize(this.zoomRatio, this.divWidth)
      const h = this.height >> 2
      for (let i = offset; i < offset + this.divWidth; i++) {
        const p = tree.segmentPeak(i * segmentSize, (i + 1) * segmentSize)
        this.peaksCanv[i] = [h - h * p[0], h - h * p[1]]
      }
    },

    drawPeaks () {
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ctx.lineWidth = 0.5
      this.ctx.strokeStyle = 'green'
      this.ctx.beginPath()
      let x = 0
      this.peaksCanvas.forEach(p => {
        this.ctx.moveTo(x, p[0])
        this.ctx.lineTo(x, p[1])
        x++
      })
      this.ctx.stroke()
      requestAnimationFrame(this.drawPeaks)
    },
  }
}
</script>